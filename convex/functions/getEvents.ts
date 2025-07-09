import { query } from "convex/server";
import { v } from "convex/values";

export const getEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.eventId);
  },
});