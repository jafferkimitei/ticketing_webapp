import { query } from "../_generated/server";
import { v } from "convex/values";

export const getUserTickets = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return await Promise.all(
      tickets.map(async (ticket) => {
        const event = await ctx.db.get(ticket.eventId);
        return {
          _id: ticket._id,
          eventName: event?.name || "Unknown Event",
          ticketType: ticket.ticketType,
          qrCode: ticket.qrCode,
          purchaseDate: ticket.purchaseDate,
        };
      })
    );
  },
});