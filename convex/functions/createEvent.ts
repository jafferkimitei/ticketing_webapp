import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createEvent = mutation({
  args: {
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
    // Initial pricing (no surge at creation)
    const eventId = await ctx.db.insert("events", {
      organizerId: args.organizerId,
      name: args.name,
      description: args.description,
      date: args.date,
      location: args.location,
      category: args.category,
      ticketTypes: args.ticketTypes,
      createdAt: new Date().toISOString(),
    });

    return { success: true, eventId };
  },
});