export function parseActivityTimeRange(timeStr?: string): { startTime: string; endTime: string } {
  if (!timeStr) return { startTime: '09:00 AM', endTime: '11:00 AM' };
  const parts = timeStr.split(/\s*-\s*|\s*to\s*/i);
  const startTime = parts[0]?.trim() || '09:00 AM';
  const endTime = parts[1]?.trim() || calculateEndTimeFromStart(startTime, 2);
  return { startTime, endTime };
}

export function formatActivityTimeRange(startTime: string, endTime: string): string {
  return `${startTime.trim()} - ${endTime.trim()}`;
}

export function calculateEndTimeFromStart(startTimeStr: string, addHours: number): string {
  const match = startTimeStr.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
  if (!match) return '11:00 AM';

  let h = parseInt(match[1], 10);
  const m = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3] ? match[3].toUpperCase() : null;

  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;

  const totalMins = h * 60 + m + Math.round(addHours * 60);
  const endH24 = Math.floor(totalMins / 60) % 24;
  const endM = totalMins % 60;

  let endH12 = endH24 % 12;
  if (endH12 === 0) endH12 = 12;
  const endPeriod = endH24 >= 12 ? 'PM' : 'AM';

  const mFormatted = String(endM).padStart(2, '0');
  const hFormatted = String(endH12).padStart(2, '0');
  return `${hFormatted}:${mFormatted} ${endPeriod}`;
}
