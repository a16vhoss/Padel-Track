import { ShotType } from '@/types/shot';

const RIVAL_HINT = 'La pelota cae en cancha rival \u2191';

const SHOT_HINTS: Record<ShotType, string> = {
  S: RIVAL_HINT,
  Re: RIVAL_HINT,
  B: RIVAL_HINT,
  Rm: RIVAL_HINT,
  Vi: RIVAL_HINT,
  BP: RIVAL_HINT,
  x4: RIVAL_HINT,
  G: RIVAL_HINT,
  V: RIVAL_HINT,
  D: RIVAL_HINT,
  Ch: RIVAL_HINT,
  Ps: RIVAL_HINT,
  CP: RIVAL_HINT,
  Bl: RIVAL_HINT,
};

export function getShotContextHint(shotType: ShotType | null): string {
  if (!shotType) return 'Selecciona donde cae la pelota';
  return SHOT_HINTS[shotType];
}
