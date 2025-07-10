import { query } from "../_generated/server";
import { v } from "convex/values";

export const getDynamicPrice = query({
  args: {
    eventId: v.id("events"),
    ticketType: v.string(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    const ticket = event.ticketTypes.find((t) => t.type === args.ticketType);
    if (!ticket) {
      throw new Error("Ticket type not found");
    }

    if (event.surgeSettings?.disabled) {
      return { price: ticket.price, surgeApplied: false };
    }

    const ticketsSold = ticket.quantity - ticket.available;
    const totalTickets = ticket.quantity;
    const availabilityPercentage = (ticket.available / totalTickets) * 100;

    // Calculate tickets sold per hour
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const recentSales = transactions.filter(
      (t) => new Date(t.createdAt).getTime() > oneHourAgo && t.status === "completed"
    ).length;

    let surgeMultiplier = 1;
    let surgeApplied = false;

    if (
      event.surgeSettings?.velocityThreshold &&
      recentSales >= event.surgeSettings.velocityThreshold
    ) {
      surgeMultiplier += event.surgeSettings.velocitySurge / 100;
      surgeApplied = true;
    }
    if (
      event.surgeSettings?.availabilityThreshold &&
      availabilityPercentage <= event.surgeSettings.availabilityThreshold
    ) {
      surgeMultiplier += event.surgeSettings.availabilitySurge / 100;
      surgeApplied = true;
    }

    return {
      price: ticket.price * surgeMultiplier,
      surgeApplied,
    };
  },
});