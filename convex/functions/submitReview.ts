import { mutation } from "../_generated/server";
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

    // Check if user has a used ticket for this event
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
      
    const hasUsedTicket = tickets.some(
      (ticket) => ticket.eventId === args.eventId && ticket.status === "used"
    );
    
    if (!hasUsedTicket) {
      throw new Error("You must attend the event to submit a review");
    }

    // Check for existing review
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_userId_eventId", (q) => q.eq("userId", args.userId))
      .collect();

    const existingReview = reviews.find(
      (review) => review.eventId === args.eventId
    );

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