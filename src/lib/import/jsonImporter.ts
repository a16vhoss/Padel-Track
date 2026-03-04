import { Match } from '@/types/match';
import { saveMatch, loadMatches } from '@/lib/persistence/storage';
import { ExportMatch } from '@/types/json-export';

export interface ImportResult {
  success: boolean;
  matchId?: string;
  error?: string;
  warnings: string[];
}

export function importMatchFromJSON(jsonString: string): ImportResult {
  const warnings: string[] = [];

  try {
    const data = JSON.parse(jsonString);

    // Check if it's an ExportMatch format
    if (data.version && data.partido && data.puntos) {
      return importFromExportFormat(data, warnings);
    }

    // Check if it's a raw Match format
    if (data.id && data.teams && data.sets) {
      return importRawMatch(data as Match, warnings);
    }

    return {
      success: false,
      error: 'Formato de JSON no reconocido. Se espera formato de exportacion TacticalPadel o Match crudo.',
      warnings,
    };
  } catch (e) {
    return {
      success: false,
      error: `Error al parsear JSON: ${e instanceof Error ? e.message : 'Error desconocido'}`,
      warnings,
    };
  }
}

function importRawMatch(match: Match, warnings: string[]): ImportResult {
  // Validate required fields
  if (!match.id) {
    return { success: false, error: 'El partido no tiene ID', warnings };
  }
  if (!match.teams || match.teams.length !== 2) {
    return { success: false, error: 'El partido debe tener exactamente 2 equipos', warnings };
  }

  // Check for duplicate
  const existing = loadMatches();
  if (existing.some((m) => m.id === match.id)) {
    // Generate new ID to avoid conflict
    match.id = `imported-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    warnings.push('Ya existia un partido con ese ID. Se genero uno nuevo.');
  }

  // Validate and fix timestamps
  if (!match.createdAt) {
    match.createdAt = Date.now();
    warnings.push('Timestamp de creacion no encontrado, usando fecha actual.');
  }
  match.updatedAt = Date.now();

  // Validate config
  if (!match.config) {
    match.config = { setsToWin: 2, goldenPoint: true, tiebreakAt: 6 };
    warnings.push('Configuracion no encontrada, usando valores por defecto.');
  }

  // Save
  saveMatch(match);
  return { success: true, matchId: match.id, warnings };
}

function importFromExportFormat(data: ExportMatch, warnings: string[]): ImportResult {
  warnings.push('Importacion desde formato de exportacion: solo se recuperan datos basicos del partido.');

  // The export format doesn't contain enough info to fully reconstruct a Match
  // We'd need the full Shot objects, but export only has simplified versions
  // For now, create a summary match

  const matchId = data.partido.id || `imported-${Date.now()}`;

  // Check for duplicate
  const existing = loadMatches();
  const finalId = existing.some((m) => m.id === matchId)
    ? `imported-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    : matchId;

  if (finalId !== matchId) {
    warnings.push('ID duplicado, se genero uno nuevo.');
  }

  const match: Match = {
    id: finalId,
    teams: [
      {
        id: 'team1',
        name: data.partido.equipos.equipo1.nombre,
        players: [
          { id: 'J1', name: data.partido.equipos.equipo1.jugadores[0] || 'J1', shortName: (data.partido.equipos.equipo1.jugadores[0] || 'J1').slice(0, 3) },
          { id: 'J2', name: data.partido.equipos.equipo1.jugadores[1] || 'J2', shortName: (data.partido.equipos.equipo1.jugadores[1] || 'J2').slice(0, 3) },
        ],
        color: '#22c55e',
      },
      {
        id: 'team2',
        name: data.partido.equipos.equipo2.nombre,
        players: [
          { id: 'J3', name: data.partido.equipos.equipo2.jugadores[0] || 'J3', shortName: (data.partido.equipos.equipo2.jugadores[0] || 'J3').slice(0, 3) },
          { id: 'J4', name: data.partido.equipos.equipo2.jugadores[1] || 'J4', shortName: (data.partido.equipos.equipo2.jugadores[1] || 'J4').slice(0, 3) },
        ],
        color: '#3b82f6',
      },
    ],
    sets: (data.partido.resultado.sets || []).map((s, i) => ({
      id: `set-${i}`,
      setNumber: i + 1,
      games: [],
      winner: s.equipo1 > s.equipo2 ? 'team1' as const : s.equipo2 > s.equipo1 ? 'team2' as const : null,
      score: { team1: s.equipo1, team2: s.equipo2 },
      hasTiebreak: false,
    })),
    config: {
      setsToWin: data.partido.configuracion.sets_para_ganar,
      goldenPoint: data.partido.configuracion.golden_point,
      tiebreakAt: data.partido.configuracion.tiebreak_en,
    },
    status: data.partido.resultado.ganador ? 'finished' : 'live',
    currentSet: (data.partido.resultado.sets || []).length - 1,
    currentGame: 0,
    winner: data.partido.resultado.ganador === data.partido.equipos.equipo1.nombre ? 'team1' :
            data.partido.resultado.ganador === data.partido.equipos.equipo2.nombre ? 'team2' : null,
    createdAt: data.partido.fecha ? new Date(data.partido.fecha).getTime() : Date.now(),
    updatedAt: Date.now(),
  };

  saveMatch(match);
  warnings.push('Nota: Los golpes individuales no se pueden reconstruir completamente desde el formato de exportacion.');

  return { success: true, matchId: finalId, warnings };
}

export function validateImportJSON(jsonString: string): { valid: boolean; format: string; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (data.version && data.partido) return { valid: true, format: 'export' };
    if (data.id && data.teams) return { valid: true, format: 'match' };
    return { valid: false, format: 'unknown', error: 'Formato no reconocido' };
  } catch (e) {
    return { valid: false, format: 'invalid', error: 'JSON invalido' };
  }
}
