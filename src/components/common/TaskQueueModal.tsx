import React, { useEffect, useState } from 'react';
import { AsyncTask, Course } from '../../types';
import { taskService } from '../../services/taskService';
import {
  Zap,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Layers,
  Sparkles,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

interface TaskQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadGeneratedCourse?: (course: Course) => void;
}

export const TaskQueueModal: React.FC<TaskQueueModalProps> = ({
  isOpen,
  onClose,
  onLoadGeneratedCourse,
}) => {
  const [tasks, setTasks] = useState<AsyncTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);

  const fetchTasks = async () => {
    try {
      const list = await taskService.listTasks();
      setTasks(list);
    } catch (e) {
      console.warn('Failed to load tasks:', e);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    fetchTasks();
    const interval = setInterval(fetchTasks, 1500);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCancel = async (taskId: string) => {
    await taskService.cancelTask(taskId);
    fetchTasks();
  };

  const handleQuickDispatch = async (topic: string, interest: string, chapters: number) => {
    setIsSubmittingQuick(true);
    try {
      await taskService.submitTask('generate_course', `Quick Job: ${topic}`, {
        studentName: 'Alex Vance',
        studentGrade: '10th Grade',
        interestId: interest,
        targetTopic: topic,
        difficulty: 'Beginner',
        chapterCount: chapters,
        questionsPerChapter: 3,
      });
      await fetchTasks();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingQuick(false);
    }
  };

  const activeCount = tasks.filter((t) => t.status === 'processing' || t.status === 'queued').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-100">
                  FastAPI Background Task Queue
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Async Worker Engine
                </span>
                {activeCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 animate-pulse">
                    ● {activeCount} Running
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitor curriculum generation, multi-chapter compilation, and custom 3D SVG animation synthesis.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchTasks}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Task List"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Launch Actions */}
        <div className="bg-slate-950/70 rounded-2xl p-3.5 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Submit Sample Background Task:</span>
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              disabled={isSubmittingQuick}
              onClick={() => handleQuickDispatch('Keplerian Orbits & Gravity Assists', 'space', 4)}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 text-xs font-bold transition-all disabled:opacity-50"
            >
              + 4-Ch Orbit Course
            </button>

            <button
              disabled={isSubmittingQuick}
              onClick={() => handleQuickDispatch('Neural Synaptic Backpropagation', 'gaming', 5)}
              className="px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 text-xs font-bold transition-all disabled:opacity-50"
            >
              + 5-Ch AI Course
            </button>

            <button
              disabled={isSubmittingQuick}
              onClick={() => handleQuickDispatch('Quantum Bohr Energy States', 'anime', 3)}
              className="px-2.5 py-1.5 rounded-xl bg-pink-600/30 hover:bg-pink-600 text-pink-200 hover:text-white border border-pink-500/30 text-xs font-bold transition-all disabled:opacity-50"
            >
              + 3-Ch Quantum Course
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Clock className="w-10 h-10 mx-auto text-slate-600" />
              <div className="text-sm font-bold text-slate-400">Queue is currently empty</div>
              <div className="text-xs">
                Submit an asynchronous generation job from the Course Creator or click a quick action above.
              </div>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {task.id}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {task.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {task.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Created: {new Date(task.createdAt).toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {task.status === 'processing' && (
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                        Processing
                      </span>
                    )}
                    {task.status === 'queued' && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Queued
                      </span>
                    )}
                    {task.status === 'completed' && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    )}
                    {task.status === 'failed' && (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Failed
                      </span>
                    )}
                    {task.status === 'cancelled' && (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold">
                        Cancelled
                      </span>
                    )}

                    {(task.status === 'processing' || task.status === 'queued') && (
                      <button
                        onClick={() => handleCancel(task.id)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-500 hover:text-rose-300 border border-slate-800 transition-colors"
                        title="Cancel Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress & Step Message */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 text-[11px] truncate font-medium">
                      {task.stepMessage || 'Running task...'}
                    </span>
                    <span className="font-mono text-purple-400 font-bold text-xs shrink-0 ml-2">
                      {task.progress}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        task.status === 'completed'
                          ? 'bg-emerald-500'
                          : task.status === 'failed'
                          ? 'bg-rose-500'
                          : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>

                {/* Output course action */}
                {task.status === 'completed' && task.result?.course && onLoadGeneratedCourse && (
                  <div className="pt-1 flex items-center justify-between border-t border-slate-900">
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{task.result.course.title} ({task.result.course.chapters?.length || 0} Chapters)</span>
                    </span>

                    <button
                      onClick={() => {
                        onLoadGeneratedCourse(task.result.course);
                        onClose();
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                    >
                      <span>Load in Classroom</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
          <span>FastAPI queue automatically purges finished tasks after 24h.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
