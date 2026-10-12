import { AsyncTask } from '../types';

export const taskService = {
  // Submit new async task
  async submitTask<T = any>(
    type: 'generate_course' | 'compile_animation' | 'batch_sync' | 'export_glbx',
    name: string,
    payload: any
  ): Promise<{ taskId: string; message: string }> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, name, payload }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit background task');
    }

    return res.json();
  },

  // Get task status
  async getTask<T = any>(taskId: string): Promise<AsyncTask<T>> {
    const res = await fetch(`/api/tasks/${taskId}`);
    if (!res.ok) {
      throw new Error(`Task ${taskId} not found`);
    }
    return res.json();
  },

  // List recent tasks
  async listTasks(): Promise<AsyncTask[]> {
    const res = await fetch('/api/tasks');
    if (!res.ok) return [];
    const data = await res.json();
    return data.tasks || [];
  },

  // Cancel task
  async cancelTask(taskId: string): Promise<boolean> {
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    return res.ok;
  },

  // Poll task until finished or timeout
  pollTask<T = any>(
    taskId: string,
    onProgress: (task: AsyncTask<T>) => void,
    intervalMs = 800,
    maxWaitSec = 60
  ): Promise<AsyncTask<T>> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const task = await this.getTask<T>(taskId);
          onProgress(task);

          if (task.status === 'completed') {
            clearInterval(interval);
            resolve(task);
          } else if (task.status === 'failed' || task.status === 'cancelled') {
            clearInterval(interval);
            reject(new Error(task.error || `Task ended with status: ${task.status}`));
          } else if (Date.now() - startTime > maxWaitSec * 1000) {
            clearInterval(interval);
            reject(new Error(`Task polling timed out after ${maxWaitSec}s`));
          }
        } catch (err) {
          clearInterval(interval);
          reject(err);
        }
      }, intervalMs);
    });
  },
};
