import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const releasePayout = mutation({
  args: {
    eventId: v.id("events"),
    organizerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event || event.organizerId !== args.organizerId) {
      throw new Error("Event not found or unauthorized");
    }

    // Calculate total ticket sales (minus 3% platform fee)
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();
    const transactions = await Promise.all(
      tickets.map((ticket) =>
        ctx.db
          .query("transactions")
          .withIndex("by_ticketId", (q) => q.eq("ticketId", ticket._id))
          .first()
      )
    );
    const totalAmount = transactions.reduce((sum, tx) => sum + (tx?.amount || 0), 0);
    const payoutAmount = totalAmount * 0.97; // Deduct 3% platform fee

    // Check if event date has passed
    const eventDate = new Date(event.date);
    const now = new Date();
    if (now < eventDate) {
      throw new Error("Cannot release payout before event date");
    }

    // Generate a temporary receipt number (replace with actual M-Pesa receipt when implementing)
    const tempReceiptNumber = `TEMP-${Date.now()}`;

    // Create payout record
    const payoutId = await ctx.db.insert("payouts", {
      organizerId: args.organizerId,
      eventId: args.eventId,
      amount: payoutAmount,
      status: "pending",
      createdAt: new Date().toISOString(),
      mpesaReceiptNumber: tempReceiptNumber, 
    });

    // TODO: Replace with actual M-Pesa B2C API integration
    // For now, simulate successful payout
    const mpesaReceiptNumber = `MPESA-${Date.now()}`;
    await ctx.db.patch(payoutId, { 
      status: "completed",
      mpesaReceiptNumber: mpesaReceiptNumber 
    });

    return { success: true, payoutId, mpesaReceiptNumber };
  },
});