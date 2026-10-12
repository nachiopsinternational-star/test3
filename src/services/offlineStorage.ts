export interface OfflineLessonPackage {
  courseId: string;
  chapterId: string;
  title: string;
  cachedAt: number;
  sizeBytes: number;
}

export interface SyncQueueItem {
  id: string;
  type: 'attendance' | 'quiz_completion' | 'xp_gain';
  payload: any;
  timestamp: number;
}

const STORAGE_KEYS = {
  CACHED_LESSONS: 'cognisphere_offline_lessons',
  SYNC_QUEUE: 'cognisphere_sync_queue',
  LAST_CLOUD_SYNC: 'cognisphere_last_sync_timestamp',
};

export class OfflineStorageManager {
  private static instance: OfflineStorageManager;
  private isOnlineStatus: boolean = navigator.onLine;

  private constructor() {
    window.addEventListener('online', () => {
      this.isOnlineStatus = true;
      this.triggerCloudSync();
    });
    window.addEventListener('offline', () => {
      this.isOnlineStatus = false;
    });
  }

  public static getInstance(): OfflineStorageManager {
    if (!OfflineStorageManager.instance) {
      OfflineStorageManager.instance = new OfflineStorageManager();
    }
    return OfflineStorageManager.instance;
  }

  public isOnline(): boolean {
    return this.isOnlineStatus;
  }

  public getCachedLessons(): OfflineLessonPackage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CACHED_LESSONS);
      return data ? JSON.parse(data) : [
        {
          courseId: 'course-py',
          chapterId: 'ch-py-1',
          title: 'Python Variables, Heap & Pointer References',
          cachedAt: Date.now() - 3600000,
          sizeBytes: 14820490,
        },
      ];
    } catch {
      return [];
    }
  }

  public cacheLesson(pkg: OfflineLessonPackage): void {
    const lessons = this.getCachedLessons();
    const existingIdx = lessons.findIndex(
      (l) => l.courseId === pkg.courseId && l.chapterId === pkg.chapterId
    );
    if (existingIdx >= 0) {
      lessons[existingIdx] = pkg;
    } else {
      lessons.push(pkg);
    }
    localStorage.setItem(STORAGE_KEYS.CACHED_LESSONS, JSON.stringify(lessons));
  }

  public removeCachedLesson(courseId: string, chapterId: string): void {
    const lessons = this.getCachedLessons().filter(
      (l) => !(l.courseId === courseId && l.chapterId === chapterId)
    );
    localStorage.setItem(STORAGE_KEYS.CACHED_LESSONS, JSON.stringify(lessons));
  }

  public enqueueSyncItem(item: Omit<SyncQueueItem, 'id' | 'timestamp'>): void {
    const queue = this.getSyncQueue();
    queue.push({
      ...item,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
    });
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
  }

  public getSyncQueue(): SyncQueueItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public async triggerCloudSync(): Promise<{ syncedCount: number; lastSync: string }> {
    const queue = this.getSyncQueue();
    if (queue.length === 0) {
      const now = new Date().toISOString();
      return { syncedCount: 0, lastSync: this.getLastSyncTime() };
    }

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: queue }),
      });

      if (response.ok) {
        const result = await response.json();
        const processedIds = new Set(result.processedIds || []);

        // Only remove items that the server confirmed saved
        const remainingQueue = this.getSyncQueue().filter((item) => !processedIds.has(item.id));
        localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(remainingQueue));

        const now = result.serverTimestamp || new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.LAST_CLOUD_SYNC, now);
        return { syncedCount: processedIds.size, lastSync: now };
      } else {
        console.warn(`Sync endpoint returned status ${response.status}. Retaining queue locally.`);
        return { syncedCount: 0, lastSync: this.getLastSyncTime() };
      }
    } catch (err) {
      // Offline or network error: retain all items in local queue for next sync
      console.warn('Network sync failed, retaining items in local storage queue:', err);
      return { syncedCount: 0, lastSync: this.getLastSyncTime() };
    }
  }

  public getLastSyncTime(): string {
    return localStorage.getItem(STORAGE_KEYS.LAST_CLOUD_SYNC) || new Date().toISOString();
  }
}

export const offlineStorage = OfflineStorageManager.getInstance();
