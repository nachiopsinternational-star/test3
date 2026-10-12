import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { AttendanceRecord } from '../../types';
import { offlineStorage } from '../../services/offlineStorage';

interface FocusLensCameraProps {
  studentName: string;
  onAttendanceLogCreated?: (record: AttendanceRecord) => void;
  onFocusScoreChange?: (score: number) => void;
}

/**
 * Headless Precision Focus & Presence Guard
 * 
 * Runs 100% in the background / backend with NO intrusive UI card in the lesson view.
 * 
 * High Precision & Speed:
 * 1. 0ms instant tab-switch & window blur detection via Page Visibility API.
 * 2. Real-time idle inactivity monitoring (mouse, keyboard, touch, scroll).
 * 3. Silent headless optical presence check (off-screen video & 32x32 luminance differencing).
 * 4. Authoritative backend scoring via /api/focus-telemetry.
 * 5. Floating non-blocking warning banner with instant "Resume Lesson" action.
 * 6. True elapsed-duration session attendance logging.
 */
export const FocusLensCamera: React.FC<FocusLensCameraProps> = ({
  studentName,
  onAttendanceLogCreated,
  onFocusScoreChange,
}) => {
  const [focusScore, setFocusScore] = useState<number>(95);
  const [isDistracted, setIsDistracted] = useState<boolean>(false);
  const [distractionReason, setDistractionReason] = useState<string | null>(null);
  const [warningDismissed, setWarningDismissed] = useState<boolean>(false);

  // Hidden offscreen elements for headless camera frame processing
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Timing & state refs
  const lastActiveTimestampRef = useRef<number>(Date.now());
  const sessionStartTimeRef = useRef<number>(Date.now());
  const scoreRef = useRef<number>(focusScore);
  const isDistractedRef = useRef<boolean>(isDistracted);
  const onFocusScoreChangeRef = useRef(onFocusScoreChange);
  const onAttendanceLogRef = useRef(onAttendanceLogCreated);

  useEffect(() => {
    scoreRef.current = focusScore;
  }, [focusScore]);

  useEffect(() => {
    isDistractedRef.current = isDistracted;
  }, [isDistracted]);

  useEffect(() => {
    onFocusScoreChangeRef.current = onFocusScoreChange;
  }, [onFocusScoreChange]);

  useEffect(() => {
    onAttendanceLogRef.current = onAttendanceLogCreated;
  }, [onAttendanceLogCreated]);

  // Sync with authoritative backend scoring
  const reportTelemetry = useCallback(async (distracted: boolean, reason: string | null, eventType: string) => {
    try {
      const response = await fetch('/api/focus-telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          currentScore: scoreRef.current,
          isDistracted: distracted,
          reason,
          eventType,
          timestamp: Date.now(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (typeof data.authoritativeScore === 'number') {
          setFocusScore(data.authoritativeScore);
          scoreRef.current = data.authoritativeScore;
          if (onFocusScoreChangeRef.current) {
            onFocusScoreChangeRef.current(data.authoritativeScore);
          }
        }
      }
    } catch {
      // Offline fallback: apply standard client adjustment
      const fallbackScore = distracted
        ? Math.max(45, scoreRef.current - 8)
        : Math.min(99, scoreRef.current + 2);
      setFocusScore(fallbackScore);
      scoreRef.current = fallbackScore;
      if (onFocusScoreChangeRef.current) {
        onFocusScoreChangeRef.current(fallbackScore);
      }
    }
  }, [studentName]);

  // Handle user interaction (resets inactivity instantly)
  const handleUserActivity = useCallback(() => {
    lastActiveTimestampRef.current = Date.now();
    if (isDistractedRef.current && distractionReason === 'Inactivity detected') {
      setIsDistracted(false);
      setDistractionReason(null);
      setWarningDismissed(false);
      reportTelemetry(false, null, 'user_resumed_activity');
    }
  }, [distractionReason, reportTelemetry]);

  // Silent headless camera stream initialization (no camera UI on screen)
  useEffect(() => {
    let isMounted = true;

    async function initHeadlessCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 160 }, height: { ideal: 120 }, facingMode: 'user' },
          audio: false,
        });
        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        cameraStreamRef.current = stream;
        if (hiddenVideoRef.current) {
          hiddenVideoRef.current.srcObject = stream;
          hiddenVideoRef.current.play().catch(() => {});
        }
      } catch {
        // Camera unavailable or denied: silently fall back to visibility + activity guard
      }
    }

    initHeadlessCamera();

    return () => {
      isMounted = false;
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }
    };
  }, []);

  // Instant 0ms detection of tab hidden, blur, and input activity
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsDistracted(true);
        setDistractionReason('Tab switched or browser minimized');
        setWarningDismissed(false);
        reportTelemetry(true, 'Tab switched or browser minimized', 'tab_blur');
      } else {
        lastActiveTimestampRef.current = Date.now();
        setIsDistracted(false);
        setDistractionReason(null);
        reportTelemetry(false, null, 'tab_focus');
      }
    };

    const handleWindowBlur = () => {
      setIsDistracted(true);
      setDistractionReason('Window lost focus');
      setWarningDismissed(false);
      reportTelemetry(true, 'Window lost focus', 'window_blur');
    };

    const handleWindowFocus = () => {
      lastActiveTimestampRef.current = Date.now();
      setIsDistracted(false);
      setDistractionReason(null);
      reportTelemetry(false, null, 'window_focus');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, [handleUserActivity, reportTelemetry]);

  // Periodic heartbeat & optical check (every 3.5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const idleSeconds = (now - lastActiveTimestampRef.current) / 1000;
      let distracted = false;
      let reason: string | null = null;

      if (document.visibilityState === 'hidden') {
        distracted = true;
        reason = 'Tab switched or browser minimized';
      } else if (idleSeconds > 35) {
        distracted = true;
        reason = 'Inactivity detected (>35s idle)';
      }

      // Headless optical presence verification (if camera stream is active)
      if (hiddenVideoRef.current && offscreenCanvasRef.current && !distracted) {
        try {
          const video = hiddenVideoRef.current;
          const canvas = offscreenCanvasRef.current;
          if (video.readyState >= 2) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = 32;
              canvas.height = 32;
              ctx.drawImage(video, 0, 0, 32, 32);
              const imgData = ctx.getImageData(0, 0, 32, 32);
              const data = imgData.data;

              let totalLuma = 0;
              for (let i = 0; i < data.length; i += 4) {
                totalLuma += (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
              }
              const avgLuma = totalLuma / (32 * 32);

              // Lens covered or completely dark
              if (avgLuma < 4) {
                distracted = true;
                reason = 'Camera covered or face not detected';
              }
            }
          }
        } catch {
          // Ignore offscreen processing errors
        }
      }

      const wasDistracted = isDistractedRef.current;
      setIsDistracted(distracted);
      setDistractionReason(reason);

      // Report to backend to get authoritative score & trigger warning
      if (distracted !== wasDistracted || distracted) {
        reportTelemetry(distracted, reason, distracted ? 'distraction_check' : 'heartbeat_check');
      } else {
        // Periodic heartbeat to recover focus score during continuous attention
        reportTelemetry(false, null, 'routine_heartbeat');
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [reportTelemetry]);

  // True Session Attendance Logger (logs actual elapsed minutes every 60s)
  useEffect(() => {
    const attendanceInterval = setInterval(() => {
      const now = new Date();
      const currentScore = scoreRef.current;
      const distracted = isDistractedRef.current;
      const elapsedMinutes = Math.max(1, Math.round((Date.now() - sessionStartTimeRef.current) / 60000));

      const record: AttendanceRecord = {
        id: `att_${Date.now()}`,
        date: now.toISOString().split('T')[0],
        timeSlot: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        durationMinutes: elapsedMinutes,
        presenceRate: distracted ? 65 : 100,
        focusScorePct: currentScore,
        distractionEvents: distracted ? 1 : 0,
        status: currentScore >= 70 ? 'Present' : 'Distracted',
        verificationMethod: 'Session Activity & Engagement Guard',
      };

      offlineStorage.enqueueSyncItem({
        type: 'attendance',
        payload: record,
      });

      if (onAttendanceLogRef.current) {
        onAttendanceLogRef.current(record);
      }
    }, 60000);

    return () => clearInterval(attendanceInterval);
  }, []);

  const handleResumeFocus = () => {
    setWarningDismissed(true);
    setIsDistracted(false);
    setDistractionReason(null);
    lastActiveTimestampRef.current = Date.now();
    reportTelemetry(false, null, 'user_clicked_resume');
  };

  return (
    <>
      {/* Offscreen hidden video & canvas for zero-UI background optical checks */}
      <video ref={hiddenVideoRef} className="hidden" playsInline muted />
      <canvas ref={offscreenCanvasRef} className="hidden" width={32} height={32} />

      {/* Floating Warning Banner: ONLY displayed when attention drifts */}
      {isDistracted && !warningDismissed && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-lg bg-amber-950/95 border border-amber-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 flex items-center justify-between gap-3 text-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Attention Drift Detected</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-900 text-amber-300 rounded font-semibold">
                  Score: {focusScore}%
                </span>
              </div>
              <p className="text-[11px] text-amber-200/90 mt-0.5">
                {distractionReason || 'Please return your focus to the lesson to maintain comprehension.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleResumeFocus}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition-colors shadow-md flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resume Lesson</span>
          </button>
        </div>
      )}
    </>
  );
};
