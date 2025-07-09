import { query } from "../_generated/server";
import { v } from "convex/values";

export const getEvents = query({
  args: { organizerId: v.string() },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_organizerId", (q) => q.eq("organizerId", args.organizerId))
      .collect();

    return Promise.all(
      events.map(async (event) => {
        const tickets = await ctx.db
          .query("tickets")
          .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
          .collect();
        return { ...event, tickets };
      })
    );
  },
});