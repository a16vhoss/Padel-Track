const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;

export function relativeTime(timestamp: number): string {
  const now = Date.now();
  const diffSec = Math.floor((now - timestamp) / 1000);

  if (diffSec < MINUTE) return 'ahora mismo';
  if (diffSec < HOUR) {
    const m = Math.floor(diffSec / MINUTE);
    return `hace ${m} ${m === 1 ? 'min' : 'min'}`;
  }
  if (diffSec < DAY) {
    const h = Math.floor(diffSec / HOUR);
    return `hace ${h} ${h === 1 ? 'hora' : 'horas'}`;
  }
  if (diffSec < WEEK) {
    const d = Math.floor(diffSec / DAY);
    return `hace ${d} ${d === 1 ? 'día' : 'días'}`;
  }
  if (diffSec < MONTH) {
    const w = Math.floor(diffSec / WEEK);
    return `hace ${w} ${w === 1 ? 'semana' : 'semanas'}`;
  }
  return new Date(timestamp).toLocaleDateString('es-ES');
}

export function formatDuration(ms: number): string {
  if (!ms || ms <= 0) return '0m';
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
