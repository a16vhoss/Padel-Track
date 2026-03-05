import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { DetectedPose } from '@/types/video';

let poseLandmarker: PoseLandmarker | null = null;
let lastVideoTime = -1;

export async function initPoseDetection(): Promise<PoseLandmarker> {
  if (poseLandmarker) return poseLandmarker;

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );

  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numPoses: 4, // up to 4 players in padel
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  return poseLandmarker;
}

export function detectPoses(
  video: HTMLVideoElement,
  timestampMs: number
): DetectedPose[] {
  if (!poseLandmarker || video.currentTime === lastVideoTime) return [];
  lastVideoTime = video.currentTime;

  const result = poseLandmarker.detectForVideo(video, timestampMs);

  return (result.landmarks || []).map((landmarks, i) => ({
    landmarks: landmarks.map((l) => ({
      x: l.x,
      y: l.y,
      z: l.z,
      visibility: l.visibility ?? 0,
    })),
    worldLandmarks: (result.worldLandmarks?.[i] || []).map((l) => ({
      x: l.x,
      y: l.y,
      z: l.z,
      visibility: l.visibility ?? 0,
    })),
  }));
}

export function disposePoseDetection() {
  if (poseLandmarker) {
    poseLandmarker.close();
    poseLandmarker = null;
  }
  lastVideoTime = -1;
}

export { DrawingUtils };
