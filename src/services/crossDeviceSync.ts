import { VolunteerProfile } from '../types';

const SYNC_TOPIC = 'nexus_community_volunteers_v1';
const CLOUD_RELAY_URL = `https://ntfy.sh/${SYNC_TOPIC}`;

export class CrossDeviceSyncService {
  private broadcastChannel: BroadcastChannel | null = null;
  private sseSource: EventSource | null = null;
  private listeners: Array<(volunteer: VolunteerProfile) => void> = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('nexus_community_mesh_v1');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'NEW_VOLUNTEER' && event.data?.volunteer) {
          this.notifyListeners(event.data.volunteer);
        }
      };
    }
  }

  // Publish a new volunteer across all devices globally and locally
  async publishVolunteer(volunteer: VolunteerProfile): Promise<void> {
    // 1. Broadcast locally across tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'NEW_VOLUNTEER',
        volunteer,
      });
    }

    // 2. Post to Local SQLite Database (if running on laptop or LAN)
    try {
      await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(volunteer),
      });
    } catch {
      // API not reachable in static mode
    }

    // 3. Post to Global Cloud Relay (so other devices anywhere on internet sync instantly)
    try {
      await fetch(CLOUD_RELAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REGISTER_VOLUNTEER',
          volunteer,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.warn('[CrossDeviceSync] Could not reach cloud relay:', err);
    }
  }

  // Pull any volunteers created on other devices from Cloud Relay
  async fetchRemoteVolunteers(): Promise<VolunteerProfile[]> {
    try {
      const res = await fetch(`${CLOUD_RELAY_URL}/json?poll=1`);
      if (!res.ok) return [];
      const text = await res.text();
      if (!text.trim()) return [];

      const lines = text.trim().split('\n').filter(Boolean);
      const remoteVolunteers: VolunteerProfile[] = [];

      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          if (entry.message) {
            const payload = JSON.parse(entry.message);
            if (payload.volunteer && payload.volunteer.id && payload.volunteer.name) {
              remoteVolunteers.push(payload.volunteer);
            }
          }
        } catch {
          // Skip invalid lines
        }
      }

      return remoteVolunteers;
    } catch (err) {
      console.warn('[CrossDeviceSync] Failed to poll remote volunteers:', err);
      return [];
    }
  }

  // Subscribe to live Server-Sent Events from Cloud Relay
  subscribe(callback: (volunteer: VolunteerProfile) => void): () => void {
    this.listeners.push(callback);

    if (typeof window !== 'undefined' && !this.sseSource) {
      try {
        this.sseSource = new EventSource(`${CLOUD_RELAY_URL}/sse`);
        this.sseSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.message) {
              const payload = JSON.parse(data.message);
              if (payload.volunteer) {
                this.notifyListeners(payload.volunteer);
              }
            }
          } catch {
            // Ignore non-json events
          }
        };
        this.sseSource.onerror = () => {
          // EventSource will auto-reconnect
        };
      } catch {
        // SSE not supported
      }
    }

    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
      if (this.listeners.length === 0 && this.sseSource) {
        this.sseSource.close();
        this.sseSource = null;
      }
    };
  }

  private notifyListeners(volunteer: VolunteerProfile) {
    for (const listener of this.listeners) {
      try {
        listener(volunteer);
      } catch (err) {
        console.error('[CrossDeviceSync] Listener error:', err);
      }
    }
  }
}

export const crossDeviceSync = new CrossDeviceSyncService();
