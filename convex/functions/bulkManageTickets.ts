import { v } from "convex/values";
import { MutationCtx, mutation } from "../_generated/server";
import { Resend } from "resend";
import * as React from "react";
import TicketConfirmation from "../../app/emails/TicketConfirmation";
import { Id } from "../_generated/dataModel";

const resend = new Resend(process.env.RESEND_API_KEY);

export const bulkManageTickets = mutation({
  args: {
    ticketIds: v.array(v.id("tickets")),
    action: v.union(v.literal("refund"), v.literal("resend"), v.literal("markUsed")),
    organizerId: v.id("users"),
  },
  handler: async (ctx: MutationCtx, args: { ticketIds: Id<"tickets">[]; action: "refund" | "resend" | "markUsed"; organizerId: Id<"users"> }) => {
    // Verify organizer
    const organizer = await ctx.db.get(args.organizerId);
    if (!organizer || organizer.role !== "organizer") {
      throw new Error("Unauthorized");
    }

    // Validate tickets and events
    const tickets = await Promise.all(
      args.ticketIds.map(async (ticketId: Id<"tickets">) => {
        const ticket = await ctx.db.get(ticketId);
        if (!ticket) {
          throw new Error(`Ticket ${ticketId} not found`);
        }
        const event = await ctx.db.get(ticket.eventId);
        if (!event || event.organizerId !== args.organizerId) {
          throw new Error(`Unauthorized for ticket ${ticketId}`);
        }
        return ticket;
      })
    );

    if (args.action === "refund") {
      for (const ticket of tickets) {
        const transaction = await ctx.db
          .query("transactions")
          .withIndex("by_ticketId", (q) => q.eq("ticketId", ticket._id))
          .first();
        if (!transaction || transaction.status !== "completed") {
          throw new Error(`No valid transaction found for ticket ${ticket._id}`);
        }
        // TODO: Implement M-Pesa Reversal API
        await ctx.db.patch(ticket._id, { status: "refunded" });
        await ctx.db.patch(transaction._id, { status: "refunded" });

        // Notify waitlist if tickets become available
        const waitlist = await ctx.db
          .query("waitlists")
          .withIndex("by_eventId", (q) => q.eq("eventId", ticket.eventId).eq("ticketType", ticket.ticketType))
          .collect();
        for (const entry of waitlist) {
          await ctx.db.mutation("sendPushNotification", {
            userId: entry.userId,
            message: `Tickets for ${ticket.ticketType} are now available!`,
          });
        }
      }
    } else if (args.action === "resend") {
      for (const ticket of tickets) {
        const user = await ctx.db.get(ticket.userId);
        if (!user || !user.email) {
          throw new Error(`No email found for user ${ticket.userId}`);
        }
        const event = await ctx.db.get(ticket.eventId);
        if (!event) {
          throw new Error(`Event not found for ticket ${ticket._id}`);
        }
        await resend.emails.send({
          from: "no-reply@yourdomain.com",
          to: user.email,
          subject: `Your Ticket for ${event.name}`,
          react: React.createElement(TicketConfirmation, {
            name: user.name,
            eventName: event.name,
            ticketType: ticket.ticketType,
            qrCode: ticket.qrCode,
          }),
        });
      }
    } else if (args.action === "markUsed") {
      for (const ticket of tickets) {
        await ctx.db.patch(ticket._id, { status: "used" });
      }
    }

    return { success: true };
  },
});