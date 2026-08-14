import { Itinerary } from '../types';
import { parseItineraryStartDate } from './googleCalendar';

/**
 * Utility to trigger browser printable PDF export for an Itinerary with specific formatted calendar dates.
 */
export function exportItineraryToPdf(itinerary: Itinerary): void {
  // Create an invisible print iframe to render clean printable HTML without polluting main DOM
  const printIframe = document.createElement('iframe');
  printIframe.style.position = 'fixed';
  printIframe.style.right = '0';
  printIframe.style.bottom = '0';
  printIframe.style.width = '0';
  printIframe.style.height = '0';
  printIframe.style.border = '0';

  document.body.appendChild(printIframe);

  const doc = printIframe.contentWindow?.document;
  if (!doc) return;

  const baseStartDate = parseItineraryStartDate(itinerary);
  const endItineraryDate = new Date(baseStartDate);
  endItineraryDate.setDate(endItineraryDate.getDate() + (itinerary.days.length - 1));

  const formattedStartDateStr = baseStartDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedEndDateStr = endItineraryDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedDateRange = `${formattedStartDateStr} – ${formattedEndDateStr}`;

  const vibesHtml = itinerary.vibes
    .map(
      (v) =>
        `<span style="background: #e6f7f7; color: #00696b; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; margin-right: 6px;">${v}</span>`
    )
    .join('');

  const daysHtml = itinerary.days
    .map((day) => {
      const dayDate = new Date(baseStartDate);
      dayDate.setDate(dayDate.getDate() + (day.dayNumber - 1));
      const formattedDayDate = dayDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      return `
    <div style="margin-bottom: 24px; page-break-inside: avoid;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #00ced1; padding-bottom: 6px; margin-bottom: 12px;">
        <h2 style="color: #00696b; margin: 0; font-size: 18px; font-family: 'Playfair Display', Georgia, serif;">
          Day ${day.dayNumber}: ${day.title}
        </h2>
        <span style="font-size: 12px; font-weight: bold; color: #a43c12; background: #fe7e4f1a; padding: 3px 10px; border-radius: 4px; border: 1px solid #a43c1240;">
          📅 ${formattedDayDate}
        </span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${day.activities
          .map(
            (act, idx) => `
          <div style="background: #fbf9f4; border: 1px solid #e2ddd3; padding: 12px 16px; border-radius: 12px; font-family: system-ui, sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 11px; font-weight: 800; color: #00696b; text-transform: uppercase; background: #e0f2f1; padding: 2px 8px; border-radius: 4px;">
                ${act.time}
              </span>
              <span style="font-size: 11px; color: #a43c12; font-weight: bold;">
                Stop #${idx + 1}
              </span>
            </div>
            <h3 style="margin: 4px 0 2px 0; font-size: 15px; color: #1b1c19;">${act.title}</h3>
            ${act.location ? `<p style="margin: 2px 0; font-size: 12px; color: #555;">Location: ${act.location}</p>` : ''}
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #444; font-style: italic;">"${act.vibe}"</p>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
    })
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Planzo Travel Guide - ${itinerary.destination}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,700;1,600&display=swap');
          body {
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            color: #1b1c19;
            margin: 0;
            padding: 32px;
            background: #ffffff;
          }
          .header {
            border-bottom: 3px solid #00696b;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .logo {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 28px;
            font-weight: 800;
            color: #00696b;
            margin: 0 0 4px 0;
          }
          .title {
            font-size: 22px;
            font-weight: 700;
            color: #a43c12;
            margin: 0 0 8px 0;
          }
          .meta {
            font-size: 13px;
            color: #555;
            margin-bottom: 12px;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #eee;
            padding-top: 16px;
            font-size: 11px;
            color: #888;
            text-align: center;
          }
          @media print {
            body { padding: 0; }
            .header { border-bottom-color: #00696b; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Planzo AI Travel Guide</div>
          <div class="title">Trip to ${itinerary.destination}</div>
          <div class="meta">
            <strong>Travel Dates:</strong> ${formattedDateRange} &nbsp;|&nbsp; 
            <strong>Duration:</strong> ${itinerary.days.length} Days &nbsp;|&nbsp; 
            <strong>Total Stops:</strong> ${itinerary.totalStops} &nbsp;|&nbsp; 
            <strong>Active Hours:</strong> ${itinerary.activeHours} hrs/day
          </div>
          <div>${vibesHtml}</div>
        </div>

        <div>
          ${daysHtml}
        </div>

        <div class="footer">
          Generated with Planzo AI — Intelligent Travel Itinerary Planner & Map Visualizer
        </div>
      </body>
    </html>
  `;

  doc.open();
  doc.write(htmlContent);
  doc.close();

  // Wait briefly for fonts/styles to load in iframe then invoke print
  setTimeout(() => {
    printIframe.contentWindow?.focus();
    printIframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(printIframe);
    }, 1000);
  }, 300);
}
