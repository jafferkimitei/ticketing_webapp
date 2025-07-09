import { mutation } from "convex/server";
import { v } from "convex/values";

export const submitResponse = mutation({
  args: {
    reviewId: v.id("reviews"),
    organizerId: v.id("users"),
    comment: v.string(),
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
    await ctx.db.insert("responses", {
      reviewId: args.reviewId,
      organizerId: args.organizerId,
      comment: args.comment,
      createdAt: new Date().toISOString(),
    });
    return { success: true };
  },
});