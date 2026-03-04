import { ShotType } from '@/types/shot';
import { TrainingExercise, TrainingPlan, PlayerWeakness } from '@/types/training';
import { PlayerProfile } from '@/types/scouting';

const EXERCISE_DATABASE: TrainingExercise[] = [
  // Attack exercises
  { id: 'ex-1', title: 'Remate con precision', description: 'Practicar remates dirigidos a zonas especificas del fondo. Alternar entre paralelo y cruzado.', targetShotType: 'Rm', difficulty: 'intermediate', durationMinutes: 15, category: 'attack' },
  { id: 'ex-2', title: 'Bandeja continua', description: 'Series de bandejas desde media pista. Enfocarse en la colocacion y profundidad.', targetShotType: 'B', difficulty: 'beginner', durationMinutes: 10, category: 'attack' },
  { id: 'ex-3', title: 'Vibora con angulo', description: 'Practicar viboras buscando angulos cerrados. Trabajar el efecto cortado.', targetShotType: 'Vi', difficulty: 'advanced', durationMinutes: 15, category: 'attack' },
  { id: 'ex-4', title: 'Dejada sorpresa', description: 'Ejercicio de dejadas desde la red. Practicar el toque suave despues de un golpe fuerte.', targetShotType: 'D', difficulty: 'intermediate', durationMinutes: 10, category: 'attack' },

  // Defense exercises
  { id: 'ex-5', title: 'Globo defensivo', description: 'Practicar globos profundos desde posicion defensiva. Buscar que el globo supere a los rivales.', targetShotType: 'G', difficulty: 'beginner', durationMinutes: 15, category: 'defense' },
  { id: 'ex-6', title: 'Contrapared bajo presion', description: 'Simular situaciones de presion y devolver con contrapared. Trabajar el timing.', targetShotType: 'CP', difficulty: 'intermediate', durationMinutes: 15, category: 'defense' },
  { id: 'ex-7', title: 'Bloqueo en la red', description: 'Practicar bloqueos ante remates rivales. Posicionamiento y reaccion.', targetShotType: 'Bl', difficulty: 'beginner', durationMinutes: 10, category: 'defense' },

  // Transition exercises
  { id: 'ex-8', title: 'Chiquita y subida', description: 'Ejecutar chiquita y subir a la red inmediatamente. Trabajar la transicion.', targetShotType: 'Ch', difficulty: 'intermediate', durationMinutes: 15, category: 'transition' },
  { id: 'ex-9', title: 'Passing shot cruzado', description: 'Practicar passing shots cuando los rivales estan en la red. Precision y timing.', targetShotType: 'Ps', difficulty: 'advanced', durationMinutes: 15, category: 'transition' },
  { id: 'ex-10', title: 'Volea profunda', description: 'Series de voleas buscando profundidad. Alternar entre volea corta y profunda.', targetShotType: 'V', difficulty: 'beginner', durationMinutes: 10, category: 'transition' },

  // Serve exercises
  { id: 'ex-11', title: 'Primer saque con potencia', description: 'Practicar primeros saques buscando potencia y colocacion. Zona 3 y zona 5.', targetShotType: 'S', difficulty: 'intermediate', durationMinutes: 15, category: 'serve' },
  { id: 'ex-12', title: 'Segundo saque seguro', description: 'Practicar segundos saques con efecto cortado. Priorizar consistencia sobre potencia.', targetShotType: 'S', difficulty: 'beginner', durationMinutes: 10, category: 'serve' },
  { id: 'ex-13', title: 'Saque y volea', description: 'Secuencia de saque seguido de volea. Trabajar el primer golpe despues del saque.', targetShotType: 'S', difficulty: 'advanced', durationMinutes: 20, category: 'serve' },

  // Wall exercises
  { id: 'ex-14', title: 'Bajada de pared', description: 'Practicar bajadas de pared desde el fondo. Trabajar el timing y la posicion del cuerpo.', targetShotType: 'BP', difficulty: 'intermediate', durationMinutes: 15, category: 'wall' },
  { id: 'ex-15', title: 'Por 4 (doble pared)', description: 'Ejercicio de golpes que pasan por las 4 paredes. Dominar la direccion y el angulo.', targetShotType: 'x4', difficulty: 'advanced', durationMinutes: 20, category: 'wall' },
  { id: 'ex-16', title: 'Lectura de pared lateral', description: 'Practicar la lectura de bolas que vienen de pared lateral. Posicionamiento y golpe.', targetShotType: 'BP', difficulty: 'beginner', durationMinutes: 15, category: 'wall' },

  // Return exercises
  { id: 'ex-17', title: 'Resto agresivo', description: 'Practicar restos buscando meter presion al sacador. Resto cruzado y paralelo.', targetShotType: 'Re', difficulty: 'intermediate', durationMinutes: 15, category: 'defense' },
  { id: 'ex-18', title: 'Resto con chiquita', description: 'Resto suave con chiquita para ganar la red. Sorprender al equipo sacador.', targetShotType: 'Re', difficulty: 'advanced', durationMinutes: 15, category: 'transition' },
];

export function generateTrainingPlan(profile: PlayerProfile): TrainingPlan {
  const weaknesses: PlayerWeakness[] = [];
  const selectedExercises: TrainingExercise[] = [];

  // Identify weaknesses from profile
  for (const w of profile.weaknesses) {
    const shotType = profile.preferredShots.find((p) => {
      const name = p.shotType;
      return w.area.toLowerCase().includes(name.toLowerCase());
    });

    weaknesses.push({
      area: w.area,
      description: w.description,
      severity: w.confidence > 70 ? 'high' : w.confidence > 40 ? 'medium' : 'low',
      shotType: shotType?.shotType,
      errorRate: shotType?.errorRate ?? 0,
      recommendation: `Practicar ${w.area} con ejercicios enfocados`,
    });
  }

  // High error rate overall
  if (profile.errorRate > 30) {
    weaknesses.push({
      area: 'Consistencia general',
      description: `Tasa de error del ${profile.errorRate}% - por encima del promedio`,
      severity: 'high',
      errorRate: profile.errorRate,
      recommendation: 'Enfocarse en reducir errores no forzados',
    });
  }

  // Serve weakness
  if (profile.serveStats.doubleFaultCount > 2) {
    weaknesses.push({
      area: 'Saque',
      description: `${profile.serveStats.doubleFaultCount} dobles faltas`,
      severity: 'medium',
      shotType: 'S',
      errorRate: 0,
      recommendation: 'Trabajar el segundo saque con mas consistencia',
    });
  }

  // Select exercises based on weaknesses
  for (const weakness of weaknesses) {
    if (weakness.shotType) {
      const exercise = EXERCISE_DATABASE.find((e) => e.targetShotType === weakness.shotType);
      if (exercise && !selectedExercises.includes(exercise)) {
        selectedExercises.push(exercise);
      }
    }
  }

  // Add general exercises if plan is too short
  if (selectedExercises.length < 3) {
    for (const ex of EXERCISE_DATABASE) {
      if (selectedExercises.length >= 6) break;
      if (!selectedExercises.includes(ex)) {
        selectedExercises.push(ex);
      }
    }
  }

  // Limit to 6 exercises
  const finalExercises = selectedExercises.slice(0, 6);

  return {
    id: `plan-${profile.playerId}-${Date.now()}`,
    playerId: profile.playerId,
    playerName: profile.playerName,
    exercises: finalExercises,
    weaknesses,
    generatedAt: Date.now(),
  };
}

export function getExercisesByCategory(category: TrainingExercise['category']): TrainingExercise[] {
  return EXERCISE_DATABASE.filter((e) => e.category === category);
}

export function getAllExercises(): TrainingExercise[] {
  return [...EXERCISE_DATABASE];
}
