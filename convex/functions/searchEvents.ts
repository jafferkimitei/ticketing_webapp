import { query } from "../_generated/server";
import { v } from "convex/values";

export const searchEvents = query({
  args: {
    query: v.string(),
    skip: v.number(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const eventsQuery = ctx.db
      .query("events")
      .withSearchIndex("search_events", (q) => q.search("name", args.query).search("description", args.query).search("location", args.query));

    const events = await eventsQuery
      .order("desc")
      .take(args.limit)
      .skip(args.skip)
      .collect();

    const total = await ctx.db.query("events").collect().then((e) => e.length);

    return { events, total };
  },
});