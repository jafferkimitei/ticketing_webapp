import { query } from "convex/server";
import { v } from "convex/values";

export const getScanningStats = query({
  args: { eventId: v.id("events"), organizerId: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event || event.organizerId !== args.organizerId) {
      throw new Error("Event not found or unauthorized");
    }

    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    const totalTickets = tickets.length;
    const scannedTickets = tickets.filter((t) => t.status === "used").length;
    const scanRate = totalTickets > 0 ? (scannedTickets / totalTickets) * 100 : 0;

    const scanTimes = tickets
      .filter((t) => t.status === "used")
      .map((t) => ({
        ticketType: t.ticketType,
        scanTime: t.purchaseDate, // Assuming scan time is updated when status changes to "used"
      }));

    const hourlyScans = scanTimes.reduce((acc, t) => {
      const hour = new Date(t.scanTime).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      totalTickets,
      scannedTickets,
      scanRate,
      hourlyScans,
    };
  },
});