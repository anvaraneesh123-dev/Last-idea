import { 
  OfflineSyncQueueItem, 
  SyncNetworkState, 
  CommunityRequest, 
  HazardReport, 
  ResourceItem 
} from '../types';
import { offlineDb } from './indexedDb';
import { dataService } from './dataService';
import { isSupabaseConfigured, supabase } from './supabaseClient';

class SyncService {
  private networkState: SyncNetworkState = navigator.onLine ? 'online' : 'offline';
  private simulatedOffline: boolean = false;
  private lastSyncedAt: string = new Date().toISOString();
  private listeners: Set<(state: {
    networkState: SyncNetworkState;
    lastSyncedAt: string;
    isSimulatedOffline: boolean;
    pendingCount: number;
  }) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  getNetworkState(): SyncNetworkState {
    if (this.simulatedOffline) return 'offline';
    return this.networkState;
  }

  isOnline(): boolean {
    if (this.simulatedOffline) return false;
    return navigator.onLine;
  }

  getLastSyncedAt(): string {
    return this.lastSyncedAt;
  }

  getIsSimulatedOffline(): boolean {
    return this.simulatedOffline;
  }

  setSimulatedOffline(simulated: boolean) {
    this.simulatedOffline = simulated;
    this.networkState = simulated ? 'offline' : (navigator.onLine ? 'online' : 'offline');
    this.notify();
    if (!simulated && navigator.onLine) {
      this.syncPendingQueue();
    }
  }

  private handleNetworkChange(online: boolean) {
    if (this.simulatedOffline) return; // Keep simulated offline
    this.networkState = online ? 'online' : 'offline';
    this.notify();
    if (online) {
      this.syncPendingQueue();
    }
  }

  subscribe(listener: (state: {
    networkState: SyncNetworkState;
    lastSyncedAt: string;
    isSimulatedOffline: boolean;
    pendingCount: number;
  }) => void) {
    this.listeners.add(listener);
    // Initial emit
    this.getPendingQueueCount().then(pendingCount => {
      listener({
        networkState: this.getNetworkState(),
        lastSyncedAt: this.lastSyncedAt,
        isSimulatedOffline: this.simulatedOffline,
        pendingCount,
      });
    });

    return () => {
      this.listeners.delete(listener);
    };
  }

  private async notify() {
    const pendingCount = await this.getPendingQueueCount();
    const state = {
      networkState: this.getNetworkState(),
      lastSyncedAt: this.lastSyncedAt,
      isSimulatedOffline: this.simulatedOffline,
      pendingCount,
    };
    this.listeners.forEach(fn => fn(state));
  }

  async getPendingQueueCount(): Promise<number> {
    try {
      const items = await offlineDb.getPendingSyncItems();
      return items.length;
    } catch {
      return 0;
    }
  }

  async getAllQueueItems(): Promise<OfflineSyncQueueItem[]> {
    try {
      return await offlineDb.getAll<OfflineSyncQueueItem>('sync_queue');
    } catch {
      return [];
    }
  }

  // Enqueue an action performed while offline or for delayed synchronization
  async enqueueAction(
    operation: OfflineSyncQueueItem['operation'],
    entityType: OfflineSyncQueueItem['entityType'],
    payload: any
  ): Promise<OfflineSyncQueueItem> {
    const clientGeneratedId = payload.id || `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const syncItem = await offlineDb.enqueueSync({
      clientGeneratedId,
      operation,
      entityType,
      payload: { ...payload, id: clientGeneratedId },
    });

    this.notify();

    // If online, immediately try syncing the queue
    if (this.isOnline()) {
      this.syncPendingQueue();
    }

    return syncItem;
  }

  // Synchronize queued items with duplicate prevention and conflict handling
  async syncPendingQueue(): Promise<{
    processed: number;
    succeeded: number;
    failed: number;
  }> {
    if (!this.isOnline()) {
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    this.networkState = 'syncing';
    this.notify();

    let succeeded = 0;
    let failed = 0;

    try {
      const pendingItems = await offlineDb.getPendingSyncItems();

      for (const item of pendingItems) {
        try {
          if (item.retryCount >= 5) {
            await offlineDb.updateSyncItemStatus(item.id, 'failed', 'Max retries (5) exceeded. Requires manual intervention.');
            failed += 1;
            continue;
          }

          await offlineDb.updateSyncItemStatus(item.id, 'syncing');

          // Process by operation type with idempotency & conflict safety
          if (item.operation === 'create_request') {
            const req = item.payload as CommunityRequest;
            const allReqs = await offlineDb.getAll<CommunityRequest>('resource_requests');
            // Duplicate prevention check
            const alreadyCreated = allReqs.some(r => 
              (r.id === req.clientGeneratedId) || 
              (!r.id.startsWith('req-draft-') && r.title === req.title && r.requesterPhone === req.requesterPhone && Math.abs(new Date(r.timestamp).getTime() - new Date(req.timestamp).getTime()) < 10000)
            );

            if (!alreadyCreated) {
              const created = await dataService.createRequest({
                requesterName: req.requesterName,
                requesterPhone: req.requesterPhone,
                title: req.title,
                details: req.details,
                category: req.category,
                type: req.type,
                quantityRequested: req.quantityRequested,
                urgency: req.urgency,
                location: req.location,
                latitude: req.latitude,
                longitude: req.longitude,
              });

              // Clean up local draft placeholder so it cleanly upgrades to the official ticket
              if (req.id && req.id.startsWith('req-draft-')) {
                await offlineDb.delete('resource_requests', req.id);
              }
            }
          } else if (item.operation === 'submit_hazard_report') {
            const hazard = item.payload as HazardReport;
            await offlineDb.put<HazardReport>('hazard_reports', hazard);
          } else if (item.operation === 'borrow_resource') {
            const { resourceId } = item.payload;
            await dataService.borrowResource(resourceId);
          } else if (item.operation === 'update_request_status') {
            const { requestId, status, responderName, matchedResourceId } = item.payload;
            const currentReq = await offlineDb.getById<CommunityRequest>('resource_requests', requestId);
            
            // Conflict handling: Do not silently overwrite terminal server states
            if (currentReq && (currentReq.status === 'Fulfilled' || currentReq.status === 'Cancelled') && status !== currentReq.status) {
              console.warn(`Sync conflict detected on #${requestId}: Server has final state '${currentReq.status}'. Preserving server version.`);
              await offlineDb.updateSyncItemStatus(item.id, 'synced', `Preserved newer server state (${currentReq.status})`);
              succeeded += 1;
              continue;
            }
            await dataService.updateRequestStatus(requestId, status, responderName, matchedResourceId);
          }

          // Mark as successfully synced
          await offlineDb.updateSyncItemStatus(item.id, 'synced');
          succeeded += 1;
        } catch (err: any) {
          console.error(`Sync error on queue item ${item.id}:`, err);
          await offlineDb.updateSyncItemStatus(item.id, 'failed', err?.message || 'Sync failed');
          failed += 1;
        }
      }

      this.lastSyncedAt = new Date().toISOString();
      this.networkState = failed > 0 ? 'sync_failed' : 'online';
    } catch (err) {
      console.error('Fatal syncQueue error:', err);
      this.networkState = 'sync_failed';
    } finally {
      this.notify();
    }

    return {
      processed: succeeded + failed,
      succeeded,
      failed,
    };
  }

  // Clear completed items from the sync log
  async clearCompletedLogs(): Promise<void> {
    const all = await this.getAllQueueItems();
    for (const item of all) {
      if (item.status === 'synced') {
        await offlineDb.delete('sync_queue', item.id);
      }
    }
    this.notify();
  }
}

export const syncService = new SyncService();
