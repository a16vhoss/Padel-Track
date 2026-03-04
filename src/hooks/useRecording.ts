'use client';

import { useRecordingStore } from '@/stores/recordingStore';
import { usePointStore } from '@/stores/pointStore';

export function useRecording() {
  const recording = useRecordingStore();
  const point = usePointStore();

  return {
    ...recording,
    shots: point.shots,
    addShot: point.addShot,
    removeLast: point.removeLast,
    clearShots: point.clearShots,
  };
}
