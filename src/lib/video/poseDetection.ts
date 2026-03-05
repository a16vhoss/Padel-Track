import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { DetectedPose, PoseLandmark } from '@/types/video';

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
        'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numPoses: 4,
    minPoseDetectionConfidence: 0.6,
    minPosePresenceConfidence: 0.6,
    minTrackingConfidence: 0.6,
  });

  return poseLandmarker;
}

// Minimum bounding box size (normalized 0-1) to consider a pose a real player
// Filters out tiny background people, ads, spectators
const MIN_POSE_HEIGHT = 0.08; // at least 8% of frame height
const MIN_VISIBLE_LANDMARKS = 8; // need enough visible joints

function filterRelevantPoses(poses: DetectedPose[]): DetectedPose[] {
  return poses.filter((pose) => {
    const lm = pose.landmarks;
    if (!lm || lm.length < 33) return false;

    const visible = lm.filter((l) => l.visibility > 0.5);
    if (visible.length < MIN_VISIBLE_LANDMARKS) return false;

    // Compute bounding box in normalized coords
    const ys = visible.map((l) => l.y);
    const xs = visible.map((l) => l.x);
    const height = Math.max(...ys) - Math.min(...ys);
    const width = Math.max(...xs) - Math.min(...xs);

    // Filter out tiny detections (background people, ads)
    if (height < MIN_POSE_HEIGHT && width < MIN_POSE_HEIGHT) return false;

    // Filter out poses mostly outside the frame
    const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
    if (centerX < 0.02 || centerX > 0.98 || centerY < 0.02 || centerY > 0.98) return false;

    return true;
  });
}

export function detectPoses(
  video: HTMLVideoElement,
  timestampMs: number
): DetectedPose[] {
  if (!poseLandmarker || video.currentTime === lastVideoTime) return [];
  lastVideoTime = video.currentTime;

  const result = poseLandmarker.detectForVideo(video, timestampMs);

  const rawPoses = (result.landmarks || []).map((landmarks, i) => ({
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

  // Filter out irrelevant poses (spectators, ads, background)
  return filterRelevantPoses(rawPoses);
}

export function disposePoseDetection() {
  if (poseLandmarker) {
    poseLandmarker.close();
    poseLandmarker = null;
  }
  lastVideoTime = -1;
}

export { DrawingUtils };
