import { Itinerary, Activity } from '../types';

/**
 * Generates a Google Calendar event creation URL for a given activity.
 */
export function createGoogleCalendarUrl(
  destination: string,
  activity: Activity,
  dayNumber: number,
  baseStartDate?: Date
): string {
  const title = encodeURIComponent(`[Planzo] ${activity.title} (${destination})`);
  const details = encodeURIComponent(
    `Day ${dayNumber} Activity in ${destination}\n\nVibe: ${activity.vibe}\nTime: ${activity.time}\n\nGenerated with Planzo AI Travel Itinerary Planner.`
  );
  const location = encodeURIComponent(activity.location || destination);

  // Default date handling: starting tomorrow or given base date
  const startDate = baseStartDate ? new Date(baseStartDate) : new Date();
  if (!baseStartDate) {
    startDate.setDate(startDate.getDate() + dayNumber);
  } else {
    startDate.setDate(startDate.getDate() + (dayNumber - 1));
  }

  // Parse time if possible (e.g., "09:00 AM - 11:30 AM")
  let startHour = 9;
  let endHour = 11;

  if (activity.time) {
    const match = activity.time.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const isPM = match[3].toUpperCase() === 'PM';
      if (isPM && h < 12) h += 12;
      if (!isPM && h === 12) h = 0;
      startHour = h;
      endHour = h + 2;
    }
  }

  const startIso = new Date(startDate.setHours(startHour, 0, 0, 0))
    .toISOString()
    .replace(/-|:|\.\d\d\d/g, '');
  const endIso = new Date(startDate.setHours(endHour, 0, 0, 0))
    .toISOString()
    .replace(/-|:|\.\d\d\d/g, '');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startIso}/${endIso}`;
}

/**
 * Generates an .ics file string for the entire itinerary and triggers download.
 */
export function downloadItineraryIcs(itinerary: Itinerary): void {
  const now = new Date().toISOString().replace(/-|:|\.\d\d\d/g, '');
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Planzo AI//Travel Itinerary Planner//EN',
    `X-WR-CALNAME:Planzo Trip to ${itinerary.destination}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + 1); // Start tomorrow

  itinerary.days.forEach((day) => {
    const dayDate = new Date(baseDate);
    dayDate.setDate(dayDate.getDate() + (day.dayNumber - 1));

    day.activities.forEach((act, idx) => {
      let startH = 9 + idx * 2;
      let endH = startH + 1;

      if (act.time) {
        const match = act.time.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
        if (match) {
          let h = parseInt(match[1], 10);
          const isPM = match[3].toUpperCase() === 'PM';
          if (isPM && h < 12) h += 12;
          if (!isPM && h === 12) h = 0;
          startH = h;
          endH = h + 1;
        }
      }

      const dtStart = new Date(dayDate.setHours(startH, 0, 0, 0))
        .toISOString()
        .replace(/-|:|\.\d\d\d/g, '');
      const dtEnd = new Date(dayDate.setHours(endH, 0, 0, 0))
        .toISOString()
        .replace(/-|:|\.\d\d\d/g, '');

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:planzo-${itinerary.id}-${day.dayNumber}-${act.id}@planzo.ai`,
        `DTSTAMP:${now}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:[Planzo] ${act.title} (${itinerary.destination})`,
        `DESCRIPTION:Day ${day.dayNumber} Activity in ${itinerary.destination}\\nVibe: ${act.vibe}\\nTime: ${act.time}`,
        `LOCATION:${act.location || itinerary.destination}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Planzo_${itinerary.destination.replace(/\s+/g, '_')}_Schedule.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
