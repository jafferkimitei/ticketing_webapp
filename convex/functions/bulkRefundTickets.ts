import { mutation } from "convex/server";
import { v } from "convex/values";

export const bulkRefundTickets = mutation({
  args: {
    ticketIds: v.array(v.id("tickets")),
    organizerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const eventIds = new Set<string>();
    const ticketTypes = new Map<string, string[]>();

    // Validate tickets and collect event IDs and ticket types
    for (const ticketId of args.ticketIds) {
      const ticket = await ctx.db.get(ticketId);
      if (!ticket || ticket.status !== "purchased") {
        throw new Error(`Ticket ${ticketId} not found or not eligible for refund`);
      }
      const event = await ctx.db.get(ticket.eventId);
      if (!event || event.organizerId !== args.organizerId) {
        throw new Error(`Event for ticket ${ticketId} not found or unauthorized`);
      }
      eventIds.add(ticket.eventId);
      if (!ticketTypes.has(ticket.eventId)) {
        ticketTypes.set(ticket.eventId, []);
      }
      ticketTypes.get(ticket.eventId)!.push(ticket.ticketType);
    }

    // Process refunds
    const accessToken = await getMpesaAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    for (const ticketId of args.ticketIds) {
      const ticket = await ctx.db.get(ticketId);
      const event = await ctx.db.get(ticket!.eventId);
      const transaction = await ctx.db
        .query("transactions")
        .withIndex("by_ticketId", (q) => q.eq("ticketId", ticketId))
        .first();
      if (!transaction) {
        throw new Error(`Transaction for ticket ${ticketId} not found`);
      }

      const refundResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/reversal/v1/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Initiator: process.env.MPESA_INITIATOR_NAME,
          SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
          CommandID: "TransactionReversal",
          TransactionID: transaction.mpesaReceiptNumber,
          Amount: transaction.amount,
          ReceiverParty: process.env.MPESA_SHORTCODE,
          RecieverIdentifierType: "11",
          ResultURL: `${process.env.MPESA_CALLBACK_URL}/reversal/callback`,
          QueueTimeOutURL: `${process.env.MPESA_CALLBACK_URL}/reversal/timeout`,
          Remarks: `Refund for ticket ${ticketId}`,
          Occasion: event!.name,
        }),
      });

      const refundResult = await refundResponse.json();
      if (refundResult.ResponseCode !== "0") {
        throw new Error(`Refund failed for ticket ${ticketId}: ${refundResult.ResponseDescription}`);
      }

      await ctx.db.patch(ticketId, { status: "refunded" });
      await ctx.db.patch(transaction._id, { status: "refunded" });

      // Update ticket availability
      const updatedTicketTypes = event!.ticketTypes.map((t) =>
        t.type === ticket!.ticketType ? { ...t, available: t.available + 1 } : t
      );
      await ctx.db.patch(ticket!.eventId, { ticketTypes: updatedTicketTypes });
    }

    // Notify waitlists for affected events and ticket types
    for (const eventId of eventIds) {
      const event = await ctx.db.get(eventId);
      for (const ticketType of ticketTypes.get(eventId) || []) {
        await ctx.db.insert("notifications", {
          userId: event!.organizerId,
          type: "waitlist_trigger",
          message: `A ${ticketType} ticket for ${event!.name} was refunded. Notify waitlist?`,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return { success: true };
  },
});

// Helper to get M-Pesa access token
async function getMpesaAccessToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const response = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    headers: { Authorization: `Basic ${auth}` },
  });

  const data = await response.json();
  return data.access_token;
}