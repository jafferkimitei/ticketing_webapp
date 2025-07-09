import { query } from "../_generated/server";
import { v } from "convex/values";

export const getEventTickets = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    return await Promise.all(
      tickets.map(async (ticket) => {
        const user = await ctx.db.get(ticket.userId);
        return {
          _id: ticket._id,
          ticketType: ticket.ticketType,
          userName: user?.name || "Unknown",
          status: ticket.status,
        };
      })
    );
  },
});