import { PlayerId, ShotType, ShotDirection, ShotPower, ShotSpin, ShotStatus } from './shot';
import { WallZoneId } from './zones';

export interface ExportShot {
  numero_golpe: number;
  jugador: string;
  jugador_id: PlayerId;
  tipo_golpe: string;
  tipo_golpe_codigo: ShotType;
  zona_destino_suelo: string;
  zona_destino_suelo_primaria: number;
  zona_destino_suelo_secundaria?: number;
  zona_intermedia: boolean;
  precision_ubicacion?: 'zona_unica' | 'linea_divisoria';
  paredes_rebote: WallZoneId[];
  direccion?: ShotDirection;
  potencia: string;
  efecto: string;
  resultado_individual: string;
}

export interface ExportPoint {
  punto_numero: number;
  set: number;
  juego: number;
  marcador_antes: string;
  marcador_despues: string;
  sacador: string;
  sacador_id: PlayerId;
  lado_saque: string;
  secuencia_golpes: ExportShot[];
  total_golpes: number;
  ganador: string;
  causa: string;
  notacion_compacta: string;
}

export interface ExportMatch {
  version: string;
  partido: {
    id: string;
    fecha: string;
    equipos: {
      equipo1: { nombre: string; jugadores: string[] };
      equipo2: { nombre: string; jugadores: string[] };
    };
    configuracion: {
      sets_para_ganar: number;
      golden_point: boolean;
      tiebreak_en: number;
    };
    resultado: {
      ganador: string | null;
      sets: Array<{ equipo1: number; equipo2: number }>;
    };
  };
  puntos: ExportPoint[];
  estadisticas: {
    total_puntos: number;
    total_golpes: number;
    promedio_golpes_por_punto: number;
    winners: { equipo1: number; equipo2: number };
    errores: { equipo1: number; equipo2: number };
    botes_en_lineas: number;
  };
}
