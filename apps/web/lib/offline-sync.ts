// Offline Emergency Storage & Synchronization Handler
export interface QueuedSOSRequest {
  id: string;
  tempId: string;
  payload: any;
  queuedAt: string;
  synced: boolean;
  syncResult?: any;
}

const STORAGE_KEY = 'ne_resq_offline_sos_queue';

export const getQueuedSOSRequests = (): QueuedSOSRequest[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read offline SOS queue', e);
    return [];
  }
};

export const queueOfflineSOS = (payload: any): QueuedSOSRequest => {
  const queue = getQueuedSOSRequests();
  const queuedItem: QueuedSOSRequest = {
    id: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    tempId: `PENDING-OFFLINE-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    payload,
    queuedAt: new Date().toISOString(),
    synced: false
  };

  queue.push(queuedItem);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  }
  return queuedItem;
};

export const syncOfflineSOSQueue = async (): Promise<{ syncedCount: number; failedCount: number }> => {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return { syncedCount: 0, failedCount: 0 };
  }

  const queue = getQueuedSOSRequests();
  const pending = queue.filter(item => !item.synced);
  let syncedCount = 0;
  let failedCount = 0;

  for (const item of pending) {
    try {
      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item.payload, isOfflineSynced: true })
      });

      if (res.ok) {
        const data = await res.json();
        item.synced = true;
        item.syncResult = data.data;
        syncedCount++;
      } else {
        failedCount++;
      }
    } catch (err) {
      failedCount++;
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  return { syncedCount, failedCount };
};
