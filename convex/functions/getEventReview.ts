import { query } from "../_generated/server";
import { v } from "convex/values";

export const getEventReviews = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId).eq("status", "approved"))
      .collect();

    return await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        return {
          id: review._id,
          rating: review.rating,
          comment: review.comment,
          userName: user?.name || "Anonymous",
          createdAt: review.createdAt,
        };
      })
    );
  },
});