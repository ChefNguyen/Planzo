import { Itinerary, Activity } from '../types';
import { auth } from './firebase';

/**
 * Returns a Google Calendar URL targeting the connected account's calendar.
 * Uses the email stored in sessionStorage (gcal_account_email) if available,
 * then falls back to the Firebase auth user's email, then bare calendar root.
 */
export function getGoogleCalendarUrl(email?: string | null): string {
  const gcalEmail =
    email ||
    sessionStorage.getItem('gcal_account_email') ||
    auth.currentUser?.email;

  if (gcalEmail) {
    return `https://calendar.google.com/calendar/u/${encodeURIComponent(gcalEmail)}/r`;
  }
  return 'https://calendar.google.com/calendar/r';
}

function formatDateToIcsString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

export function parseItineraryStartDate(itinerary: Partial<Itinerary> | string): Date {
  if (typeof itinerary === 'object' && itinerary?.startDate) {
    const parts = itinerary.startDate.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
  }

  const str = typeof itinerary === 'string' ? itinerary : (itinerary?.dates || '');

  // 1. ISO YYYY-MM-DD
  const isoMatch = str.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    return new Date(y, m, d);
  }

  // 2. DD/MM/YYYY
  const dmyMatch = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10) - 1;
    const y = parseInt(dmyMatch[3], 10);
    return new Date(y, m, d);
  }

  // 3. Month Day Year (e.g. "Aug 20, 2026" or "Aug 20 - Aug 23, 2026" or "Oct 15 - Oct 18")
  const monthMap: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const monthMatch = str.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})(?:[,\s]+(\d{4}))?/i);
  if (monthMatch) {
    const mStr = monthMatch[1].toLowerCase().substring(0, 3);
    const m = monthMap[mStr] !== undefined ? monthMap[mStr] : 0;
    const d = parseInt(monthMatch[2], 10);
    let y = monthMatch[3] ? parseInt(monthMatch[3], 10) : new Date().getFullYear();

    const now = new Date();
    if (!monthMatch[3] && m < now.getMonth() && now.getMonth() - m > 2) {
      y += 1;
    }
    return new Date(y, m, d);
  }

  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 1);
  return fallback;
}

/**
 * Generates a Google Calendar event creation URL for a single given activity.
 * Appends authuser param so the correct connected account is pre-selected.
 */
export function createGoogleCalendarUrl(
  itineraryOrDestination: Itinerary | string,
  activity: Activity,
  dayNumber: number,
  baseStartDate?: Date
): string {
  const destination =
    typeof itineraryOrDestination === 'string'
      ? itineraryOrDestination
      : itineraryOrDestination.destination;
  const title = encodeURIComponent(`[Planzo] ${activity.title} (${destination})`);
  const details = encodeURIComponent(
    `Day ${dayNumber} Activity in ${destination}\n\nVibe: ${activity.vibe}\nTime: ${activity.time}\n\nGenerated with Planzo AI Travel Itinerary Planner.`
  );
  const location = encodeURIComponent(activity.location || destination);

  const parsedStart =
    typeof itineraryOrDestination === 'object'
      ? parseItineraryStartDate(itineraryOrDestination)
      : undefined;
  const startDate = baseStartDate
    ? new Date(baseStartDate)
    : parsedStart
    ? new Date(parsedStart)
    : new Date();
  if (!baseStartDate && !parsedStart) {
    startDate.setDate(startDate.getDate() + dayNumber);
  } else {
    startDate.setDate(startDate.getDate() + (dayNumber - 1));
  }

  let startHour = 9;
  let startMin = 0;
  let endHour = 11;
  let endMin = 0;

  if (activity.time) {
    const times = activity.time.split(/\s*-\s*/);
    const startMatch = times[0]?.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
    if (startMatch) {
      let h = parseInt(startMatch[1], 10);
      const m = startMatch[2] ? parseInt(startMatch[2], 10) : 0;
      const isPM = startMatch[3].toUpperCase() === 'PM';
      if (isPM && h < 12) h += 12;
      if (!isPM && h === 12) h = 0;
      startHour = h;
      startMin = m;
      endHour = h + 2;
      endMin = m;
    }
    if (times[1]) {
      const endMatch = times[1].match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
      if (endMatch) {
        let h = parseInt(endMatch[1], 10);
        const m = endMatch[2] ? parseInt(endMatch[2], 10) : 0;
        const isPM = endMatch[3].toUpperCase() === 'PM';
        if (isPM && h < 12) h += 12;
        if (!isPM && h === 12) h = 0;
        endHour = h;
        endMin = m;
      }
    }
  }

  const dtStartObj = new Date(startDate);
  dtStartObj.setHours(startHour, startMin, 0, 0);
  const dtEndObj = new Date(startDate);
  dtEndObj.setHours(endHour, endMin, 0, 0);

  const startIso = formatDateToIcsString(dtStartObj);
  const endIso = formatDateToIcsString(dtEndObj);

  const gcalEmail =
    sessionStorage.getItem('gcal_account_email') || auth.currentUser?.email;
  const authUserParam = gcalEmail
    ? `&authuser=${encodeURIComponent(gcalEmail)}`
    : '';

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startIso}/${endIso}${authUserParam}`;
}

/**
 * Generates an .ics file string for the ENTIRE itinerary (all days, all activities) and triggers download.
 */
export function downloadItineraryIcs(itinerary: Itinerary): void {
  const now = formatDateToIcsString(new Date());
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Planzo AI//Travel Itinerary Planner//EN',
    `X-WR-CALNAME:Planzo Trip to ${itinerary.destination}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  const baseDate = parseItineraryStartDate(itinerary);

  itinerary.days.forEach((day) => {
    day.activities.forEach((act, idx) => {
      const actDate = new Date(baseDate);
      actDate.setDate(actDate.getDate() + (day.dayNumber - 1));

      let startH = 9 + idx * 2;
      let startM = 0;
      let endH = startH + 1;
      let endM = 0;

      if (act.time) {
        const times = act.time.split(/\s*-\s*/);
        const startMatch = times[0]?.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
        if (startMatch) {
          let h = parseInt(startMatch[1], 10);
          const m = startMatch[2] ? parseInt(startMatch[2], 10) : 0;
          const isPM = startMatch[3].toUpperCase() === 'PM';
          if (isPM && h < 12) h += 12;
          if (!isPM && h === 12) h = 0;
          startH = h;
          startM = m;
          endH = h + 1;
          endM = m;
        }
        if (times[1]) {
          const endMatch = times[1].match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
          if (endMatch) {
            let h = parseInt(endMatch[1], 10);
            const m = endMatch[2] ? parseInt(endMatch[2], 10) : 0;
            const isPM = endMatch[3].toUpperCase() === 'PM';
            if (isPM && h < 12) h += 12;
            if (!isPM && h === 12) h = 0;
            endH = h;
            endM = m;
          }
        }
      }

      const dtStartObj = new Date(actDate);
      dtStartObj.setHours(startH, startM, 0, 0);

      const dtEndObj = new Date(actDate);
      dtEndObj.setHours(endH, endM, 0, 0);

      const dtStart = formatDateToIcsString(dtStartObj);
      const dtEnd = formatDateToIcsString(dtEndObj);

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

  const blob = new Blob([icsContent.join('\r\n')], {
    type: 'text/calendar;charset=utf-8',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    `Planzo_${itinerary.destination.replace(/\s+/g, '_')}_Schedule.ics`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Syncs the ENTIRE itinerary to Google Calendar by downloading the .ics file
 * and opening the Google Calendar Import page (Fallback).
 * Targets the connected account if one is stored.
 */
export function syncAllToGoogleCalendar(itinerary: Itinerary): void {
  downloadItineraryIcs(itinerary);
  const gcalEmail =
    sessionStorage.getItem('gcal_account_email') || auth.currentUser?.email;
  const base = gcalEmail
    ? `https://calendar.google.com/calendar/u/${encodeURIComponent(gcalEmail)}/r/settings/export`
    : 'https://calendar.google.com/calendar/r/settings/export';
  window.open(base, '_blank');
}

/**
 * Directly pushes ALL events in the itinerary into the user's Google Calendar via Google Calendar REST API.
 */
export async function syncItineraryToGoogleCalendarApi(
  itinerary: Itinerary,
  accessToken: string
): Promise<{ success: boolean; count: number; error?: string }> {
  const baseDate = parseItineraryStartDate(itinerary);

  let syncedCount = 0;
  const timeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh';

  try {
    for (const day of itinerary.days) {
      const dayDate = new Date(baseDate);
      dayDate.setDate(dayDate.getDate() + (day.dayNumber - 1));

      for (let idx = 0; idx < day.activities.length; idx++) {
        const act = day.activities[idx];
        let startH = 9 + idx * 2;
        let startM = 0;
        let endH = startH + 1;
        let endM = 0;

        if (act.time) {
          const times = act.time.split(/\s*-\s*/);
          const startMatch = times[0]?.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
          if (startMatch) {
            let h = parseInt(startMatch[1], 10);
            const m = startMatch[2] ? parseInt(startMatch[2], 10) : 0;
            const isPM = startMatch[3].toUpperCase() === 'PM';
            if (isPM && h < 12) h += 12;
            if (!isPM && h === 12) h = 0;
            startH = h;
            startM = m;
            endH = h + 1;
            endM = m;
          }
          if (times[1]) {
            const endMatch = times[1].match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
            if (endMatch) {
              let h = parseInt(endMatch[1], 10);
              const m = endMatch[2] ? parseInt(endMatch[2], 10) : 0;
              const isPM = endMatch[3].toUpperCase() === 'PM';
              if (isPM && h < 12) h += 12;
              if (!isPM && h === 12) h = 0;
              endH = h;
              endM = m;
            }
          }
        }

        const dtStartObj = new Date(dayDate);
        dtStartObj.setHours(startH, startM, 0, 0);

        const dtEndObj = new Date(dayDate);
        dtEndObj.setHours(endH, endM, 0, 0);

        const eventPayload = {
          summary: `[Planzo] ${act.title} (${itinerary.destination})`,
          description: `Day ${day.dayNumber} Activity in ${itinerary.destination}\nVibe: ${act.vibe}\nTime: ${act.time}\n\nGenerated with Planzo AI Travel Planner`,
          location: act.location || itinerary.destination,
          start: {
            dateTime: dtStartObj.toISOString(),
            timeZone,
          },
          end: {
            dateTime: dtEndObj.toISOString(),
            timeZone,
          },
        };

        const res = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventPayload),
          }
        );

        if (res.ok) {
          syncedCount++;
        } else {
          console.warn('GCal API sync event warning:', await res.text());
        }
      }
    }

    return { success: true, count: syncedCount };
  } catch (err: any) {
    console.error('Google Calendar API batch sync error:', err);
    return { success: false, count: syncedCount, error: err.message };
  }
}
