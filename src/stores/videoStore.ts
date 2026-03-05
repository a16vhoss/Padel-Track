import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { VideoClip, VideoAnnotation, OverlayMode, CourtCalibration, DetectedPose } from '@/types/video';
import { PlayerId, ShotType, ShotStatus, ShotDirection, ShotPower, ShotSpin } from '@/types/shot';
import { ZoneDestination, WallZoneId } from '@/types/zones';

interface VideoState {
  // Video
  videoUrl: string | null;
  videoFileName: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;

  // Pose detection
  poses: DetectedPose[];
  isDetecting: boolean;
  overlayMode: OverlayMode;
  showPaddle: boolean;
  showCourt: boolean;

  // Court calibration
  courtCalibration: CourtCalibration | null;
  isCalibrating: boolean;
  calibrationStep: number; // 0-3 for 4 corners

  // Annotations
  annotations: VideoAnnotation[];
  clips: VideoClip[];
  activeClipId: string | null;
  isAnnotating: boolean;

  // Actions - Video
  setVideoUrl: (url: string | null, fileName?: string) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;

  // Actions - Pose
  setPoses: (poses: DetectedPose[]) => void;
  setIsDetecting: (detecting: boolean) => void;
  setOverlayMode: (mode: OverlayMode) => void;
  togglePaddle: () => void;
  toggleCourt: () => void;

  // Actions - Calibration
  setCourtCalibration: (cal: CourtCalibration | null) => void;
  setIsCalibrating: (cal: boolean) => void;
  setCalibrationStep: (step: number) => void;
  setCalibrationPoint: (step: number, point: { x: number; y: number }) => void;

  // Actions - Annotations
  addAnnotation: (data: {
    timestamp: number;
    player: PlayerId;
    shotType: ShotType;
    status: ShotStatus;
    direction?: ShotDirection;
    power: ShotPower;
    spin: ShotSpin;
    wallBounces: WallZoneId[];
    destination: ZoneDestination | null;
    clipId?: string;
  }) => void;
  removeAnnotation: (id: string) => void;
  clearAnnotations: () => void;

  // Actions - Clips
  addClip: (startTime: number, endTime: number, label: string) => void;
  updateClip: (id: string, data: Partial<VideoClip>) => void;
  removeClip: (id: string) => void;
  setActiveClip: (id: string | null) => void;
  setIsAnnotating: (annotating: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  videoUrl: null as string | null,
  videoFileName: null as string | null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  poses: [] as DetectedPose[],
  isDetecting: false,
  overlayMode: 'skeleton' as OverlayMode,
  showPaddle: true,
  showCourt: false,
  courtCalibration: null as CourtCalibration | null,
  isCalibrating: false,
  calibrationStep: 0,
  annotations: [] as VideoAnnotation[],
  clips: [] as VideoClip[],
  activeClipId: null as string | null,
  isAnnotating: false,
};

export const useVideoStore = create<VideoState>((set, get) => ({
  ...initialState,

  // Video
  setVideoUrl: (url, fileName) => set({ videoUrl: url, videoFileName: fileName || null }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),

  // Pose
  setPoses: (poses) => set({ poses }),
  setIsDetecting: (isDetecting) => set({ isDetecting }),
  setOverlayMode: (overlayMode) => set({ overlayMode }),
  togglePaddle: () => set((s) => ({ showPaddle: !s.showPaddle })),
  toggleCourt: () => set((s) => ({ showCourt: !s.showCourt })),

  // Calibration
  setCourtCalibration: (courtCalibration) => set({ courtCalibration }),
  setIsCalibrating: (isCalibrating) => set({ isCalibrating, calibrationStep: 0 }),
  setCalibrationStep: (calibrationStep) => set({ calibrationStep }),
  setCalibrationPoint: (step, point) => {
    const current = get().courtCalibration || {
      topLeft: { x: 0, y: 0 },
      topRight: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 0 },
      bottomRight: { x: 0, y: 0 },
    };
    const corners: (keyof CourtCalibration)[] = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
    const updated = { ...current, [corners[step]]: point };
    const nextStep = step + 1;
    if (nextStep >= 4) {
      set({ courtCalibration: updated, isCalibrating: false, calibrationStep: 0 });
    } else {
      set({ courtCalibration: updated, calibrationStep: nextStep });
    }
  },

  // Annotations
  addAnnotation: (data) => {
    const annotation: VideoAnnotation = { id: uuid(), ...data };
    set((s) => ({
      annotations: [...s.annotations, annotation].sort((a, b) => a.timestamp - b.timestamp),
    }));
  },
  removeAnnotation: (id) => set((s) => ({ annotations: s.annotations.filter((a) => a.id !== id) })),
  clearAnnotations: () => set({ annotations: [] }),

  // Clips
  addClip: (startTime, endTime, label) => {
    const clip: VideoClip = { id: uuid(), startTime, endTime, label };
    set((s) => ({ clips: [...s.clips, clip].sort((a, b) => a.startTime - b.startTime) }));
  },
  updateClip: (id, data) =>
    set((s) => ({ clips: s.clips.map((c) => (c.id === id ? { ...c, ...data } : c)) })),
  removeClip: (id) =>
    set((s) => ({
      clips: s.clips.filter((c) => c.id !== id),
      annotations: s.annotations.filter((a) => a.clipId !== id),
      activeClipId: s.activeClipId === id ? null : s.activeClipId,
    })),
  setActiveClip: (activeClipId) => set({ activeClipId }),
  setIsAnnotating: (isAnnotating) => set({ isAnnotating }),

  // Reset
  reset: () => set(initialState),
}));
