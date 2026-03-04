import { ShotType, PlayerId } from './shot';

export interface TrainingExercise {
  id: string;
  title: string;
  description: string;
  targetShotType: ShotType;
  targetZones?: number[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  category: 'attack' | 'defense' | 'transition' | 'serve' | 'wall';
}

export interface TrainingPlan {
  id: string;
  playerId: string;
  playerName: string;
  exercises: TrainingExercise[];
  weaknesses: PlayerWeakness[];
  generatedAt: number;
}

export interface PlayerWeakness {
  area: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  shotType?: ShotType;
  zone?: number;
  errorRate: number;
  recommendation: string;
}
