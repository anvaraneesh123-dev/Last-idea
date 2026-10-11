import { 
  ResourceItem, 
  VolunteerProfile, 
  CommunityRequest, 
  RequestResponse, 
  CommunityAlert, 
  ActivityUpdate,
  UserProfile,
  HazardReport,
  EmergencyAuditEntry,
  OfflineSyncQueueItem,
  AppNotification
} from '../types';

const DB_NAME = 'nexus_community_os_db';
const DB_VERSION = 3;

export class IndexedDBService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        const stores = [
          'profiles',
          'resources',
          'volunteer_profiles',
          'resource_requests',
          'request_responses',
          'emergency_alerts',
          'activity_logs',
          'hazard_reports',
          'emergency_audit_logs',
          'sync_queue',
          'notifications',
        ];

        stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB open error:', event);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.initPromise;
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getById<T>(storeName: string, id: string): Promise<T | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async put<T extends { id: string }>(storeName: string, item: T): Promise<T> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearStore(storeName: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Sync Queue Specific Operations
  async enqueueSync(
    item: Omit<OfflineSyncQueueItem, 'id' | 'status' | 'retryCount' | 'createdAt' | 'version'>
  ): Promise<OfflineSyncQueueItem> {
    const syncItem: OfflineSyncQueueItem = {
      ...item,
      id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'pending',
      retryCount: 0,
      createdAt: new Date().toISOString(),
      version: 1,
    };
    return this.put<OfflineSyncQueueItem>('sync_queue', syncItem);
  }

  async getPendingSyncItems(): Promise<OfflineSyncQueueItem[]> {
    const all = await this.getAll<OfflineSyncQueueItem>('sync_queue');
    return all.filter(item => item.status === 'pending' || item.status === 'failed');
  }

  async updateSyncItemStatus(
    id: string, 
    status: OfflineSyncQueueItem['status'], 
    errorMessage?: string
  ): Promise<void> {
    const item = await this.getById<OfflineSyncQueueItem>('sync_queue', id);
    if (!item) return;

    item.status = status;
    item.lastAttemptedAt = new Date().toISOString();
    if (errorMessage) item.errorMessage = errorMessage;
    if (status === 'failed') item.retryCount += 1;

    await this.put<OfflineSyncQueueItem>('sync_queue', item);
  }
}

export const offlineDb = new IndexedDBService();
