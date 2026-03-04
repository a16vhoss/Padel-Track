import type { PlayerId } from '@/types/shot';
import type { MatchConfig, ServeSide } from '@/types/match';
import type { PointScore, GameScore, SetScore, MatchScore, ScoringEvent } from '@/types/scoring';

/**
 * Padel scoring state machine.
 *
 * Scoring rules:
 *   - Points: 0 -> 15 -> 30 -> 40 -> Game
 *   - At deuce (40-40): if goldenPoint, next point wins. Otherwise advantage/deuce.
 *   - Games: first to 6 with 2-game lead. At 6-6 (configurable tiebreakAt), tiebreak.
 *   - Tiebreak: first to 7 with 2-point lead. Points counted 0,1,2,3...
 *   - Sets: best of N (configurable setsToWin, typically 2 for best of 3).
 *   - Serve rotation: J1 -> J3 -> J2 -> J4, repeating.
 *   - Serve side: alternates each point (derecha first). In tiebreak, switch every 2 points.
 */

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------

/** Standard serve rotation order across games. */
const SERVER_ROTATION: PlayerId[] = ['J1', 'J3', 'J2', 'J4'];

/** Progression of standard game points. */
const POINT_PROGRESSION: PointScore[] = [0, 15, 30, 40];

/** Map a team to its player IDs. */
function teamPlayers(team: 'team1' | 'team2'): [PlayerId, PlayerId] {
  return team === 'team1' ? ['J1', 'J2'] : ['J3', 'J4'];
}

/** Determine which team a player belongs to. */
function playerTeam(player: PlayerId): 'team1' | 'team2' {
  return player === 'J1' || player === 'J2' ? 'team1' : 'team2';
}

// ------------------------------------------------------------------
// ScoringEngine
// ------------------------------------------------------------------

export class ScoringEngine {
  private config: MatchConfig;

  // Score state
  private sets: SetScore[];
  private currentSetIndex: number;
  private currentGame: GameScore;

  // Tiebreak state
  private isTiebreak: boolean;
  private tiebreakPoints: { team1: number; team2: number };

  // Server tracking
  private serverRotationIndex: number; // index into SERVER_ROTATION
  private totalGamesPlayed: number; // total games played (determines server)

  // Serve side tracking
  private pointsInCurrentGame: number;

  // Match completion
  private isFinished: boolean;
  private matchWinner: 'team1' | 'team2' | null;

  // Sets won
  private setsWon: { team1: number; team2: number };

  constructor(config: MatchConfig) {
    this.config = config;
    this.sets = [];
    this.currentSetIndex = 0;
    this.currentGame = { team1: 0, team2: 0, isDeuce: false };
    this.isTiebreak = false;
    this.tiebreakPoints = { team1: 0, team2: 0 };
    this.serverRotationIndex = 0;
    this.totalGamesPlayed = 0;
    this.pointsInCurrentGame = 0;
    this.isFinished = false;
    this.matchWinner = null;
    this.setsWon = { team1: 0, team2: 0 };

    // Initialize first set
    this.sets.push({ team1: 0, team2: 0 });
  }

  // ----------------------------------------------------------------
  // Public API
  // ----------------------------------------------------------------

  /**
   * Get the current full score state.
   */
  getScore(): MatchScore {
    return {
      sets: this.sets.map((s) => ({ ...s })),
      currentGame: this.isTiebreak
        ? {
            team1: this.tiebreakPoints.team1 as PointScore | 'Ad',
            team2: this.tiebreakPoints.team2 as PointScore | 'Ad',
            isDeuce: false,
          }
        : { ...this.currentGame },
      currentSetIndex: this.currentSetIndex,
      server: this.getCurrentServer(),
      serveSide: this.getServeSide(),
      isFinished: this.isFinished,
      winner: this.matchWinner,
    };
  }

  /**
   * Record a point won by a team. Returns array of events that occurred.
   */
  pointWon(team: 'team1' | 'team2'): ScoringEvent[] {
    if (this.isFinished) {
      return [];
    }

    const events: ScoringEvent[] = [];

    events.push({ type: 'POINT_WON', team });
    this.pointsInCurrentGame++;

    if (this.isTiebreak) {
      this.handleTiebreakPoint(team, events);
    } else {
      this.handleGamePoint(team, events);
    }

    return events;
  }

  /**
   * Get the current server player ID.
   */
  getCurrentServer(): PlayerId {
    return SERVER_ROTATION[this.serverRotationIndex % SERVER_ROTATION.length];
  }

  /**
   * Get the current serve side (derecha or izquierda).
   *
   * Standard games: first point derecha, then alternating.
   * Tiebreak: first point derecha, then alternating every point;
   *           server changes every 2 points.
   */
  getServeSide(): ServeSide {
    if (this.isTiebreak) {
      // In tiebreak, serve side alternates every point starting with derecha
      const totalTiebreakPoints = this.tiebreakPoints.team1 + this.tiebreakPoints.team2;
      return totalTiebreakPoints % 2 === 0 ? 'derecha' : 'izquierda';
    }
    // Standard game: first point derecha, then alternating
    return this.pointsInCurrentGame % 2 === 0 ? 'derecha' : 'izquierda';
  }

  /**
   * Reset the engine to initial state.
   */
  reset(): void {
    this.sets = [{ team1: 0, team2: 0 }];
    this.currentSetIndex = 0;
    this.currentGame = { team1: 0, team2: 0, isDeuce: false };
    this.isTiebreak = false;
    this.tiebreakPoints = { team1: 0, team2: 0 };
    this.serverRotationIndex = 0;
    this.totalGamesPlayed = 0;
    this.pointsInCurrentGame = 0;
    this.isFinished = false;
    this.matchWinner = null;
    this.setsWon = { team1: 0, team2: 0 };
  }

  // ----------------------------------------------------------------
  // Private: standard game point handling
  // ----------------------------------------------------------------

  private handleGamePoint(team: 'team1' | 'team2', events: ScoringEvent[]): void {
    const other: 'team1' | 'team2' = team === 'team1' ? 'team2' : 'team1';

    const scoringTeamPoints = this.currentGame[team];
    const otherTeamPoints = this.currentGame[other];

    // Check for deuce / advantage state
    if (scoringTeamPoints === 40 && otherTeamPoints === 40) {
      // Deuce: golden point or advantage
      if (this.config.goldenPoint) {
        // Golden point: whoever wins this point wins the game
        this.gameWon(team, events);
      } else {
        // Go to advantage
        this.currentGame[team] = 'Ad';
        this.currentGame.isDeuce = false;
      }
      return;
    }

    if (scoringTeamPoints === 'Ad') {
      // Already at advantage, win the game
      this.gameWon(team, events);
      return;
    }

    if (otherTeamPoints === 'Ad') {
      // Other team had advantage, back to deuce
      this.currentGame[other] = 40;
      this.currentGame.isDeuce = true;
      return;
    }

    // Normal point progression: 0 -> 15 -> 30 -> 40 -> game
    if (scoringTeamPoints === 40) {
      // At 40 and opponent is not at 40 or Ad: win the game
      this.gameWon(team, events);
      return;
    }

    // Advance to next point value
    const currentIndex = POINT_PROGRESSION.indexOf(scoringTeamPoints as PointScore);
    if (currentIndex >= 0 && currentIndex < POINT_PROGRESSION.length - 1) {
      this.currentGame[team] = POINT_PROGRESSION[currentIndex + 1];
    }

    // Check if we're now at deuce
    if (this.currentGame.team1 === 40 && this.currentGame.team2 === 40) {
      this.currentGame.isDeuce = true;
    }
  }

  // ----------------------------------------------------------------
  // Private: tiebreak point handling
  // ----------------------------------------------------------------

  private handleTiebreakPoint(team: 'team1' | 'team2', events: ScoringEvent[]): void {
    this.tiebreakPoints[team]++;

    const t1 = this.tiebreakPoints.team1;
    const t2 = this.tiebreakPoints.team2;
    const totalPoints = t1 + t2;

    // Check for tiebreak win: first to 7 with 2-point lead
    if (t1 >= 7 || t2 >= 7) {
      if (Math.abs(t1 - t2) >= 2) {
        this.gameWon(team, events);
        return;
      }
    }

    // Server rotation in tiebreak: switch every 2 points
    // First point is served by the current server, then every 2 points the server rotates.
    // After the first point, then every 2 points.
    if (totalPoints === 1 || (totalPoints > 1 && (totalPoints - 1) % 2 === 0)) {
      this.advanceServer();
    }
  }

  // ----------------------------------------------------------------
  // Private: game/set/match transitions
  // ----------------------------------------------------------------

  private gameWon(team: 'team1' | 'team2', events: ScoringEvent[]): void {
    const currentSet = this.sets[this.currentSetIndex];
    currentSet[team]++;

    this.totalGamesPlayed++;

    // Reset game state
    this.currentGame = { team1: 0, team2: 0, isDeuce: false };
    this.pointsInCurrentGame = 0;

    const wasTiebreak = this.isTiebreak;
    this.isTiebreak = false;
    this.tiebreakPoints = { team1: 0, team2: 0 };

    // Check for set win
    if (this.checkSetWon(currentSet, team)) {
      this.setWon(team, events);
      return;
    }

    // Check if we should start a tiebreak
    if (
      currentSet.team1 === this.config.tiebreakAt &&
      currentSet.team2 === this.config.tiebreakAt
    ) {
      this.isTiebreak = true;
    }

    // Advance server for next game (only for standard games; tiebreak handles its own rotation)
    if (!wasTiebreak) {
      this.advanceServer();
    }

    events.push({ type: 'NEW_GAME' });
  }

  private checkSetWon(set: SetScore, team: 'team1' | 'team2'): boolean {
    const other: 'team1' | 'team2' = team === 'team1' ? 'team2' : 'team1';
    const teamGames = set[team];
    const otherGames = set[other];

    // Won via tiebreak (the game that was just won WAS the tiebreak)
    if (this.isTiebreak && teamGames > otherGames) {
      // Tiebreak game was won, set is won
      // Actually, the tiebreak game count was already incremented, so check:
      // After tiebreak at 6-6, winning team has 7, other has 6. 7-6 = 1 >= 1 is not enough
      // for the standard "2 game lead" check, but tiebreak sets always end 7-6.
      return true;
    }

    // Standard: first to 6 (or more) with 2-game lead
    if (teamGames >= 6 && teamGames - otherGames >= 2) {
      return true;
    }

    return false;
  }

  private setWon(team: 'team1' | 'team2', events: ScoringEvent[]): void {
    this.setsWon[team]++;

    events.push({ type: 'NEW_SET' });

    // Check for match win
    if (this.setsWon[team] >= this.config.setsToWin) {
      this.isFinished = true;
      this.matchWinner = team;
      events.push({ type: 'MATCH_OVER', winner: team });
      return;
    }

    // Start new set
    this.currentSetIndex++;
    this.sets.push({ team1: 0, team2: 0 });

    // Reset game state
    this.currentGame = { team1: 0, team2: 0, isDeuce: false };
    this.pointsInCurrentGame = 0;
    this.isTiebreak = false;
    this.tiebreakPoints = { team1: 0, team2: 0 };

    // Advance server for the new set (normal rotation continues)
    this.advanceServer();

    // Also emit NEW_GAME since a new set implies a new game
    events.push({ type: 'NEW_GAME' });
  }

  // ----------------------------------------------------------------
  // Private: server management
  // ----------------------------------------------------------------

  private advanceServer(): void {
    this.serverRotationIndex =
      (this.serverRotationIndex + 1) % SERVER_ROTATION.length;
  }
}

// ------------------------------------------------------------------
// Factory helper
// ------------------------------------------------------------------

/**
 * Create a new ScoringEngine with the given match configuration.
 */
export function createScoringEngine(config: MatchConfig): ScoringEngine {
  return new ScoringEngine(config);
}
