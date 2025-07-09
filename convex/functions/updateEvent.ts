import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    organizerId: v.id("users"),
    name: v.string(),
    description: v.string(),
    date: v.string(),
    location: v.string(),
    category: v.string(),
    ticketTypes: v.array(
      v.object({
        type: v.string(),
        price: v.number(),
        quantity: v.number(),
        available: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event || event.organizerId !== args.organizerId) {
      throw new Error("Event not found or unauthorized");
    }

    // Calculate demand-based pricing
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();
    const salesVelocity = tickets.length / (Date.now() - new Date(event.createdAt).getTime() / 1000 / 3600); // Tickets per hour
    const updatedTicketTypes = args.ticketTypes.map((t) => {
      const originalPrice = t.price;
      const availabilityRatio = t.available / t.quantity;
      let surgeMultiplier = 1;
      if (salesVelocity > 0.5) surgeMultiplier += 0.2; // Increase by 20% if high velocity
      if (availabilityRatio < 0.2) surgeMultiplier += 0.3; // Increase by 30% if <20% tickets remain
      return { ...t, price: Math.round(originalPrice * surgeMultiplier * 100) / 100 };
    });

    await ctx.db.patch(args.eventId, {
      name: args.name,
      description: args.description,
      date: args.date,
      location: args.location,
      category: args.category,
      ticketTypes: updatedTicketTypes,
    });

    return { success: true };
  },
});