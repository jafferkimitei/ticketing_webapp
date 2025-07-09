import { mutation } from "convex/server";
import { v } from "convex/values";

export const submitReview = mutation({
  args: {
    userId: v.id("users"),
    eventId: v.id("events"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    const ticket = await ctx.db
      .query("tickets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId).eq("eventId", args.eventId))
      .first();
    if (!ticket || ticket.status !== "used") {
      throw new Error("You must attend the event to submit a review");
    }
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId).eq("eventId", args.eventId))
      .first();
    if (existingReview) {
      throw new Error("You have already reviewed this event");
    }
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    await ctx.db.insert("reviews", {
      userId: args.userId,
      eventId: args.eventId,
      rating: args.rating,
      comment: args.comment,
      createdAt: new Date().toISOString(),
      status: "pending",
    });

    return { success: true };
  },
});