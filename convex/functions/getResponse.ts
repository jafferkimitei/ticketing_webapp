import { query } from "convex/server";
import { v } from "convex/values";

export const getResponse = query({
  args: { reviewId: v.id("reviews") },
  handler: async (ctx, args) => {
    const responses = await ctx.db
      .query("responses")
      .withIndex("by_reviewId", (q) => q.eq("reviewId", args.reviewId))
      .collect();
    return await Promise.all(
      responses.map(async (response) => {
        const organizer = await ctx.db.get(response.organizerId);
        return {
          id: response._id,
          comment: response.comment,
          organizerName: organizer?.name || "Organizer",
          createdAt: response.createdAt,
        };
      })
    );
  },
});