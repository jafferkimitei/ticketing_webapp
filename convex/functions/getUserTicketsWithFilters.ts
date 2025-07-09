import { query } from "convex/server";
import { v } from "convex/values";

export const getUserTicketsWithFilters = query({
  args: {
    userId: v.string(),
    status: v.string(),
    skip: v.number(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("tickets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const tickets = await query
      .order("desc")
      .take(args.limit)
      .skip(args.skip)
      .collect();

    const total = await ctx.db
      .query("tickets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect()
      .then((t) => t.length);

    return {
      tickets: await Promise.all(
        tickets.map(async (ticket) => {
          const event = await ctx.db.get(ticket.eventId);
          return { ...ticket, eventName: event?.name || "Unknown Event" };
        })
      ),
      total,
    };
  },
});