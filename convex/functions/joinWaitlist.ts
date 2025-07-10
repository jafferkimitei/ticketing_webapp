import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const joinWaitlist = mutation({
  args: {
    userId: v.id("users"),
    eventId: v.id("events"),
    ticketType: v.string(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    const ticketType = event.ticketTypes.find((t) => t.type === args.ticketType);
    if (!ticketType) {
      throw new Error("Invalid ticket type");
    }
    if (ticketType.available > 0) {
      throw new Error("Tickets are still available");
    }

    const existing = await ctx.db
      .query("waitlists")
      .withIndex("by_userId_eventId_ticketType", (q) =>
        q.eq("userId", args.userId).eq("eventId", args.eventId).eq("ticketType", args.ticketType)
      )
      .first();
    if (existing) {
      throw new Error("Already on waitlist");
    }

    await ctx.db.insert("waitlists", {
      userId: args.userId,
      eventId: args.eventId,
      ticketType: args.ticketType,
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  },
});