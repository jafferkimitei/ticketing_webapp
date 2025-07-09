import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";
import * as React from "react";
import RefundProcessed from "../../app/emails/RefundProcessed";

const resend = new Resend(process.env.RESEND_API_KEY);

export const processRefund = mutation({
  args: {
    ticketId: v.id("tickets"),
    organizerId: v.id("users"),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: async (ctx: any, args: { ticketId: string; organizerId: string }) => {
    // Verify organizer
    const user = await ctx.db.get(args.organizerId);
    if (!user || user.role !== "organizer") {
      throw new Error("Unauthorized");
    }

    // Get ticket and event
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    const event = await ctx.db.get(ticket.eventId);
    if (!event || event.organizerId !== args.organizerId) {
      throw new Error("Event not found or unauthorized");
    }

    // Get transaction
    const transaction = await ctx.db
      .query("transactions")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .withIndex("by_ticketId", (q: any) => q.eq("ticketId", args.ticketId))
      .first();
    if (!transaction || transaction.status !== "completed") {
      throw new Error("No valid transaction found");
    }

    // Update ticket and transaction status
    await ctx.db.patch(args.ticketId, { status: "refunded" });
    await ctx.db.patch(transaction._id, { status: "refunded" });

    // Create notification
    await ctx.db.insert("notifications", {
      userId: ticket.userId,
      type: "refund_processed",
      message: `Your ${ticket.ticketType} ticket for ${event.name} has been refunded.`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    // Send email
    const userDetails = await ctx.db.get(ticket.userId);
    if (userDetails) {
      await resend.emails.send({
        from: "no-reply@yourdomain.com",
        to: userDetails.email,
        subject: `💸 Refund Processed for ${event.name}`,
        react: React.createElement(RefundProcessed, {
          name: userDetails.name,
          eventName: event.name,
          amount: transaction.amount,
        }),
      });
    }

    return { success: true, ticketId: args.ticketId };
  },
});