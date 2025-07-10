import { query } from "../_generated/server";
import { v } from "convex/values";

export const getEventsWithFilters = query({
  args: {
    location: v.string(),
    date: v.string(),
    category: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("events");

    if (args.location) {
      query = query.filter((q) => q.eq(q.field("location"), args.location));
    }
    if (args.date) {
      query = query.filter((q) => q.eq(q.field("date"), args.date));
    }
    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }

    const events = await query.order("desc").take(args.limit);

    const total = await ctx.db.query("events").collect().then((e) => e.length);

    return { events, total };
  },
});