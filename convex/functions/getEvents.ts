import { query } from "../_generated/server";
import { v } from "convex/values";

export const getEvents = query({
   args: { organizerId: v.id("users") },
    handler: async (ctx, args) => {
      return await ctx.db
        .query("events")
        .withIndex("by_organizerId", (q) => q.eq("organizerId", args.organizerId))
        .collect();
    },
  });

export const getEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.eventId);
  },
});