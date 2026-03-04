import { Match, Point } from '@/types/match';
import { Shot } from '@/types/shot';
import { ExportMatch, ExportPoint, ExportShot } from '@/types/json-export';

function exportShot(shot: Shot, match: Match): ExportShot {
  const player = match.teams
    .flatMap((t) => t.players)
    .find((p) => p.id === shot.player);

  const dest = shot.destination;
  const isIntermediate = dest?.type === 'intermediate';

  const zoneStr = !dest ? '' : dest.type === 'intermediate'
    ? `${dest.primary},${dest.secondary}`
    : String(dest.zone);

  const primaryZone = !dest ? 0 : dest.type === 'single'
    ? dest.zone
    : dest.primary;

  const result: ExportShot = {
    numero_golpe: shot.sequenceNumber,
    jugador: player?.name || shot.player,
    jugador_id: shot.player,
    tipo_golpe: shotTypeName(shot.type),
    tipo_golpe_codigo: shot.type,
    zona_destino_suelo: zoneStr,
    zona_destino_suelo_primaria: primaryZone,
    zona_intermedia: isIntermediate,
    paredes_rebote: shot.modifiers.wallBounces,
    potencia: powerName(shot.modifiers.power),
    efecto: spinName(shot.modifiers.spin),
    resultado_individual: statusName(shot.status),
  };

  if (dest?.type === 'intermediate') {
    result.zona_destino_suelo_secundaria = dest.secondary;
    result.precision_ubicacion = 'linea_divisoria';
  } else if (dest) {
    result.precision_ubicacion = 'zona_unica';
  }

  if (shot.modifiers.direction) {
    result.direccion = shot.modifiers.direction;
  }

  return result;
}

function exportPoint(point: Point, match: Match): ExportPoint {
  const server = match.teams
    .flatMap((t) => t.players)
    .find((p) => p.id === point.server);

  return {
    punto_numero: point.pointNumber,
    set: point.setNumber,
    juego: point.gameNumber,
    marcador_antes: point.scoreBefore,
    marcador_despues: point.scoreAfter,
    sacador: server?.name || point.server,
    sacador_id: point.server,
    lado_saque: point.serveSide,
    secuencia_golpes: point.shots.map((s) => exportShot(s, match)),
    total_golpes: point.shots.length,
    ganador: match.teams[point.winner === 'team1' ? 0 : 1].name,
    causa: point.cause,
    notacion_compacta: point.notation,
  };
}

export function buildExportJSON(match: Match): ExportMatch {
  const allPoints = match.sets.flatMap((s) => s.games.flatMap((g) => g.points));
  const allShots = allPoints.flatMap((p) => p.shots);

  let intermediateHits = 0;
  let winnersT1 = 0, winnersT2 = 0;
  let errorsT1 = 0, errorsT2 = 0;

  for (const shot of allShots) {
    if (shot.destination?.type === 'intermediate') intermediateHits++;
    const isT1 = shot.player === 'J1' || shot.player === 'J2';
    if (shot.status === 'W') { isT1 ? winnersT1++ : winnersT2++; }
    if (shot.status === 'X' || shot.status === 'DF') { isT1 ? errorsT1++ : errorsT2++; }
  }

  return {
    version: '2.1',
    partido: {
      id: match.id,
      fecha: new Date(match.createdAt).toISOString().split('T')[0],
      equipos: {
        equipo1: {
          nombre: match.teams[0].name,
          jugadores: match.teams[0].players.map((p) => p.name),
        },
        equipo2: {
          nombre: match.teams[1].name,
          jugadores: match.teams[1].players.map((p) => p.name),
        },
      },
      configuracion: {
        sets_para_ganar: match.config.setsToWin,
        golden_point: match.config.goldenPoint,
        tiebreak_en: match.config.tiebreakAt,
      },
      resultado: {
        ganador: match.winner
          ? match.teams[match.winner === 'team1' ? 0 : 1].name
          : null,
        sets: match.sets.map((s) => ({
          equipo1: s.score.team1,
          equipo2: s.score.team2,
        })),
      },
    },
    puntos: allPoints.map((p) => exportPoint(p, match)),
    estadisticas: {
      total_puntos: allPoints.length,
      total_golpes: allShots.length,
      promedio_golpes_por_punto:
        allPoints.length > 0
          ? Math.round((allShots.length / allPoints.length) * 10) / 10
          : 0,
      winners: { equipo1: winnersT1, equipo2: winnersT2 },
      errores: { equipo1: errorsT1, equipo2: errorsT2 },
      botes_en_lineas: intermediateHits,
    },
  };
}

function shotTypeName(code: string): string {
  const names: Record<string, string> = {
    S: 'saque', Re: 'resto', B: 'bandeja', Rm: 'remate',
    Vi: 'vibora', BP: 'bajada_pared', x4: 'por_4',
    G: 'globo', V: 'volea', D: 'dejada', Ch: 'chiquita',
    Ps: 'passing_shot', CP: 'contrapared', Bl: 'bloqueo',
  };
  return names[code] || code;
}

function powerName(p: string): string {
  const names: Record<string, string> = {
    '-': 'suave', '': 'normal', '+': 'fuerte', '++': 'muy_fuerte',
  };
  return names[p] || 'normal';
}

function spinName(s: string): string {
  const names: Record<string, string> = {
    '': 'plano', '^': 'liftado', '~': 'cortado',
  };
  return names[s] || 'plano';
}

function statusName(s: string): string {
  const names: Record<string, string> = {
    W: 'winner', X: 'error', N: 'no_llega', DF: 'doble_falta', '': 'continua',
  };
  return names[s] || 'continua';
}
