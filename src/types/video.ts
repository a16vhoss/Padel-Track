import { PlayerId, ShotType, ShotStatus, ShotDirection, ShotPower, ShotSpin } from './shot';
import { ZoneDestination, WallZoneId } from './zones';

export interface VideoClip {
  id: string;
  startTime: number; // seconds
  endTime: number;   // seconds
  label: string;
  pointNumber?: number;
}

export interface VideoAnnotation {
  id: string;
  timestamp: number; // video time in seconds
  player: PlayerId;
  shotType: ShotType;
  status: ShotStatus;
  direction?: ShotDirection;
  power: ShotPower;
  spin: ShotSpin;
  wallBounces: WallZoneId[];
  destination: ZoneDestination | null;
  clipId?: string; // linked clip
}

export interface PoseLandmark {
  x: number; // normalized 0-1
  y: number;
  z: number;
  visibility: number;
}

export interface DetectedPose {
  landmarks: PoseLandmark[];
  worldLandmarks: PoseLandmark[];
}

export type OverlayMode = 'skeleton' | 'boundingBox' | 'off';

export interface CourtCalibration {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
}
