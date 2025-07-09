import { query } from "../_generated/server";
import { v } from "convex/values";

export const generateCalendarLink = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Assume 2-hour event
    const startFormatted = startDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const endFormatted = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    // Google Calendar URL
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.name
    )}&dates=${startFormatted}/${endFormatted}&details=${encodeURIComponent(
      event.description
    )}&location=${encodeURIComponent(event.location)}`;

    // iCal content
    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YourApp//Event Calendar//EN
BEGIN:VEVENT
UID:${args.eventId}@yourdomain.com
DTSTAMP:${startFormatted}
DTSTART:${startFormatted}
DTEND:${endFormatted}
SUMMARY:${event.name}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR
`.trim();

    return {
      googleCalendarUrl,
      icsContent,
      icsFileName: `${event.name.replace(/\s/g, "_")}.ics`,
    };
  },
});