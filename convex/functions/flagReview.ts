import { mutation } from "convex/server";
import { v } from "convex/values";

export const flagReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    organizerId: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }
    const event = await ctx.db.get(review.eventId);
    if (!event || event.organizerId !== args.organizerId) {
      throw new Error("Unauthorized or event not found");
    }
    await ctx.db.patch(args.reviewId, {
      status: "flagged",
      flaggedReason: args.reason,
    });
    return { success: true };
  },
});