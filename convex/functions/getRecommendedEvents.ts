import { query } from "../_generated/server";
import { v } from "convex/values";

export const getRecommendedEvents = query({
  args: { userId: v.id("users"), limit: v.number() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return { events: [] };
    }

    // Get user purchase history
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    const eventIds = tickets.map((t) => t.eventId);
    const purchasedEvents = await Promise.all(eventIds.map((id) => ctx.db.get(id)));

    // Extract categories and locations from history
    const historicalCategories = purchasedEvents.map((e) => e?.category || "").filter(Boolean);
    const historicalLocations = purchasedEvents.map((e) => e?.location || "").filter(Boolean);

    // Combine with user preferences
    const preferredCategories = [...new Set([...(user.preferredCategories || []), ...historicalCategories])];
    const preferredLocations = [...new Set([...(user.preferredLocations || []), ...historicalLocations])];

    // Query events matching preferences
    let query = ctx.db.query("events");
    if (preferredCategories.length > 0) {
      query = query.filter((q) => q.or(...preferredCategories.map((cat) => q.eq(q.field("category"), cat))));
    }
    if (preferredLocations.length > 0) {
      query = query.filter((q) => q.or(...preferredLocations.map((loc) => q.eq(q.field("location"), loc))));
    }

    const events = await query.order("desc").take(args.limit);

    // Fallback to popular events if no matches
    if (events.length === 0) {
      return {
        events: await ctx.db.query("events").order("desc").take(args.limit),
      };
    }

    return { events };
  },
});