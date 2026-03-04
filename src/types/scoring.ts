export type PointScore = 0 | 15 | 30 | 40;

export interface GameScore {
  team1: PointScore | 'Ad';
  team2: PointScore | 'Ad';
  isDeuce: boolean;
}

export interface SetScore {
  team1: number;
  team2: number;
}

export interface MatchScore {
  sets: SetScore[];
  currentGame: GameScore;
  currentSetIndex: number;
  server: 'J1' | 'J2' | 'J3' | 'J4';
  serveSide: 'derecha' | 'izquierda';
  isFinished: boolean;
  winner: 'team1' | 'team2' | null;
}

export type ScoringEvent =
  | { type: 'POINT_WON'; team: 'team1' | 'team2' }
  | { type: 'NEW_GAME' }
  | { type: 'NEW_SET' }
  | { type: 'MATCH_OVER'; winner: 'team1' | 'team2' };
