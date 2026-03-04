import { ShotType, PlayerId } from './shot';

export interface PlayerProfile {
  playerId: string;
  playerName: string;
  matchesAnalyzed: number;
  lastUpdated: number;

  // Overall stats
  totalShots: number;
  totalWinners: number;
  totalErrors: number;
  winnerRate: number;
  errorRate: number;

  // Strengths & weaknesses
  strengths: ScoutingInsight[];
  weaknesses: ScoutingInsight[];

  // Shot preferences
  preferredShots: ShotPreference[];

  // Zone tendencies
  hotZones: number[];  // zones where they hit most
  dangerZones: number[]; // zones where they make most errors

  // Serve stats
  serveStats: {
    firstServeIn: number;
    firstServeWinPct: number;
    secondServeWinPct: number;
    aceCount: number;
    doubleFaultCount: number;
    preferredServeSide: 'derecha' | 'izquierda' | 'balanced';
  };

  // Wall usage
  wallUsage: {
    totalWallShots: number;
    wallWinnerRate: number;
    preferredWalls: string[];
  };
}

export interface ScoutingInsight {
  area: string;
  description: string;
  confidence: number; // 0-100
  basedOnShots: number;
}

export interface ShotPreference {
  shotType: ShotType;
  count: number;
  percentage: number;
  winnerRate: number;
  errorRate: number;
}

export interface ScoutingReport {
  id: string;
  playerProfile: PlayerProfile;
  recommendations: string[];
  generatedAt: number;
  matchIds: string[];
}
