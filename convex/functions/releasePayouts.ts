import { mutation } from "convex/server";
import { v } from "convex/values";
import { Resend } from "resend";
import * as React from "react";
import PayoutNotice from "../../app/emails/PayoutNotice";

const resend = new Resend(process.env.RESEND_API_KEY);

export const releasePayout = mutation({
  args: {
    eventId: v.id("events"),
    organizerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify organizer
    const user = await ctx.db.get(args.organizerId);
    if (!user || user.role !== "organizer") {
      throw new Error("Unauthorized");
    }

    // Get event
    const event = await ctx.db.get(args.eventId);
    if (!event || event.organizerId !== args.organizerId) {
      throw new Error("Event not found or unauthorized");
    }

    // Check event date has passed
    if (new Date(event.date) > new Date()) {
      throw new Error("Cannot release payout before event date");
    }

    // Get completed transactions
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

    const completedTransactions = transactions.filter((tx) => tx?.status === "completed");
    const totalAmount = completedTransactions.reduce((sum, tx) => sum + (tx?.amount || 0), 0);
    const payoutAmount = totalAmount * 0.97; // 3% platform fee

    if (payoutAmount <= 0) {
      throw new Error("No funds available for payout");
    }

    // M-Pesa B2C API call
    const accessToken = await getMpesaAccessToken();
    const response = await fetch("https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        InitiatorName: process.env.MPESA_INITIATOR_NAME,
        SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
        CommandID: "BusinessPayment",
        Amount: payoutAmount,
        PartyA: process.env.MPESA_SHORTCODE,
        PartyB: user.phone, // Organizer's phone number
        Remarks: `Payout for ${event.name}`,
        QueueTimeOutURL: `${process.env.MPESA_CALLBACK_URL}/b2c/timeout`,
        ResultURL: `${process.env.MPESA_CALLBACK_URL}/b2c/result`,
        Occasion: `Event ${event._id}`,
      }),
    });

    const result = await response.json();
    if (result.ResponseCode !== "0") {
      throw new Error(`M-Pesa B2C failed: ${result.ResponseDescription}`);
    }

    // Store payout
    const payoutId = await ctx.db.insert("payouts", {
      eventId: args.eventId,
      organizerId: args.organizerId,
      amount: payoutAmount,
      status: "pending",
      createdAt: new Date().toISOString(),
      mpesaReceiptNumber: result.TransactionID || null,
    });

    // Send email
    await resend.emails.send({
      from: "no-reply@yourdomain.com",
      to: user.email,
      subject: `✅ Payout Initiated for ${event.name}`,
      react: React.createElement(PayoutNotice, {
        name: user.name,
        eventName: event.name,
        amount: payoutAmount,
      }),
    });

    return { success: true, payoutId };
  },
});

async function getMpesaAccessToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const response = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const data = await response.json();
  return data.access_token;
}