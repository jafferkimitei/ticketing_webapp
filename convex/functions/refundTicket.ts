import { mutation } from "convex/server";
import { v } from "convex/values";

export const refundTicket = mutation({
  args: {
    ticketId: v.id("tickets"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket || ticket.userId !== args.userId) {
      throw new Error("Ticket not found or unauthorized");
    }
    if (ticket.status !== "purchased") {
      throw new Error("Ticket is not eligible for refund");
    }

    const event = await ctx.db.get(ticket.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Process refund via M-Pesa
    const transaction = await ctx.db
      .query("transactions")
      .withIndex("by_ticketId", (q) => q.eq("ticketId", args.ticketId))
      .first();
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    const accessToken = await getMpesaAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

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
        Remarks: `Refund for ticket ${args.ticketId}`,
        Occasion: event.name,
      }),
    });

    const refundResult = await refundResponse.json();
    if (refundResult.ResponseCode !== "0") {
      throw new Error(`Refund failed: ${refundResult.ResponseDescription}`);
    }

    // Update ticket and transaction status
    await ctx.db.patch(args.ticketId, { status: "refunded" });
    await ctx.db.patch(transaction._id, { status: "refunded" });

    // Update ticket availability
    const updatedTicketTypes = event.ticketTypes.map((t) =>
      t.type === ticket.ticketType ? { ...t, available: t.available + 1 } : t
    );
    await ctx.db.patch(ticket.eventId, { ticketTypes: updatedTicketTypes });

    // Notify waitlist
    await ctx.db.insert("notifications", {
      userId: event.organizerId,
      type: "waitlist_trigger",
      message: `A ${ticket.ticketType} ticket for ${event.name} was refunded. Notify waitlist?`,
      read: false,
      createdAt: new Date().toISOString(),
    });

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