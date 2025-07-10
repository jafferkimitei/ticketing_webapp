/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import QRCode from "qrcode";
import { Resend } from "resend";
import { createCipheriv, randomBytes } from "crypto";
import * as React from "react";
import TicketConfirmation from "../../app/emails/TicketConfirmation";
import webPush from "web-push";

const resend = new Resend(process.env.RESEND_API_KEY);
const ENCRYPTION_KEY = process.env.QR_ENCRYPTION_KEY!;
const IV_LENGTH = 16;

webPush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export const purchaseTicket = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
    tickets: v.array(
      v.object({
        ticketType: v.string(),
        quantity: v.number(),
      })
    ),
    phoneNumber: v.string(),
    promoCode: v.optional(v.string()),
  },
  handler: async (ctx: any, args: {
    eventId: string;
    userId: string;
    tickets: { ticketType: string; quantity: number }[];
    phoneNumber: string;
    promoCode?: string;
  }) => {
    // Validate event and ticket types
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    for (const ticket of args.tickets) {
      const ticketType = event.ticketTypes.find((t: { type: string; }) => t.type === ticket.ticketType);
      if (!ticketType || ticketType.available < ticket.quantity) {
        throw new Error(`Ticket type ${ticket.ticketType} not available or insufficient quantity`);
      }
    }

    // Validate user
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Validate promo code
    let discount = 0;
    if (args.promoCode) {
      const promo = await ctx.db
        .query("promoCodes")
        .withIndex("by_code", (q: { eq: (arg0: string, arg1: string | undefined) => any; }) => q.eq("code", args.promoCode))
        .first();
      if (!promo || promo.eventId !== args.eventId || promo.uses >= promo.maxUses || new Date(promo.validUntil) < new Date()) {
        throw new Error("Invalid or expired promo code");
      }
      discount = promo.discount;
      await ctx.db.patch(promo._id, { uses: promo.uses + 1 });
    }

    // Calculate total price with dynamic pricing
    const ticketsSold = (await ctx.db
      .query("tickets")
      .withIndex("by_eventId", (q: { eq: (arg0: string, arg1: string) => any; }) => q.eq("eventId", args.eventId))
      .collect()).length;
    const salesVelocity = ticketsSold / ((Date.now() - new Date(event.createdAt).getTime()) / 1000 / 3600); // Tickets per hour
    const totalPrice = args.tickets.reduce((sum, ticket) => {
      const ticketType = event.ticketTypes.find((t: { type: string; }) => t.type === ticket.ticketType)!;
      let surgeMultiplier = 1;
      if (!event.surgeSettings?.disabled) {
        if (event.surgeSettings?.velocityThreshold && salesVelocity > event.surgeSettings.velocityThreshold) {
          surgeMultiplier += event.surgeSettings.velocitySurge / 100;
        }
        if (event.surgeSettings?.availabilityThreshold && ticketType.available / ticketType.quantity < event.surgeSettings.availabilityThreshold / 100) {
          surgeMultiplier += event.surgeSettings.availabilitySurge / 100;
        }
      }
      const adjustedPrice = ticketType.price * surgeMultiplier;
      return sum + adjustedPrice * ticket.quantity * (1 - discount / 100);
    }, 0);

    // M-Pesa STK Push
    const accessToken = await getMpesaAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    const stkPushResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: totalPrice,
        PartyA: args.phoneNumber,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: args.phoneNumber,
        CallBackURL: `${process.env.MPESA_CALLBACK_URL}/stk-push/callback`,
        AccountReference: `Ticket_${args.eventId}`,
        TransactionDesc: `Purchase tickets for ${event.name}`,
      }),
    });

    const stkPushResult = await stkPushResponse.json();
    if (stkPushResult.ResponseCode !== "0") {
      throw new Error(`M-Pesa STK Push failed: ${stkPushResult.ResponseDescription}`);
    }

    // Store pending transaction
    const transactionId = await ctx.db.insert("transactions", {
      ticketId: null,
      userId: args.userId,
      eventId: args.eventId,
      amount: totalPrice,
      status: "pending",
      createdAt: new Date().toISOString(),
      mpesaTransactionId: stkPushResult.CheckoutRequestID,
    });

    // Query payment status
    const queryResponse = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: stkPushResult.CheckoutRequestID,
      }),
    });

    const queryResult = await queryResponse.json();
    if (queryResult.ResponseCode !== "0" || queryResult.ResultCode !== "0") {
      await ctx.db.patch(transactionId, { status: "failed" });
      throw new Error(`Payment validation failed: ${queryResult.ResultDesc}`);
    }

    // Create tickets with encrypted QR codes
    const ticketIds: string[] = [];
    for (const ticket of args.tickets) {
      for (let i = 0; i < ticket.quantity; i++) {
        const ticketId = await ctx.db.insert("tickets", {
          eventId: args.eventId,
          userId: args.userId,
          ticketType: ticket.ticketType,
          status: "active",
          purchaseDate: new Date().toISOString(),
          qrCode: "",
          userName: user.name,
        });

        const iv = randomBytes(IV_LENGTH);
        const cipher = createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(`ticket:${ticketId}`);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        const qrCodeData = await QRCode.toDataURL(`${iv.toString("hex")}:${encrypted.toString("hex")}`);
        await ctx.db.patch(ticketId, { qrCode: qrCodeData });

        ticketIds.push(ticketId);
      }
    }

    // Update transaction
    await ctx.db.patch(transactionId, {
      ticketId: ticketIds[0],
      status: "completed",
      mpesaTransactionId: queryResult.MpesaReceiptNumber || stkPushResult.CheckoutRequestID,
    });

    // Update ticket availability
    const updatedTicketTypes = event.ticketTypes.map((t: { type: string; available: number; }) => {
      const purchased = args.tickets.find((p) => p.ticketType === t.type);
      return purchased ? { ...t, available: t.available - purchased.quantity } : t;
    });
    await ctx.db.patch(args.eventId, { ticketTypes: updatedTicketTypes });

    // Send confirmation email
    await resend.emails.send({
      from: "no-reply@yourdomain.com",
      to: user.email,
      subject: `🎟️ Ticket Confirmation for ${event.name}`,
      react: React.createElement(TicketConfirmation, {
        name: user.name,
        eventName: event.name,
        ticketType: args.tickets.map((t) => `${t.quantity} x ${t.ticketType}`).join(", "),
        qrCode: await QRCode.toDataURL(`multi-ticket:${ticketIds.join(",")}`),
      }),
    });

    // Create notification
    const message = `You purchased ${args.tickets.reduce((sum, t) => sum + t.quantity, 0)} ticket(s) for ${event.name}!`;
    await ctx.db.insert("notifications", {
      userId: args.userId,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    });

    // Send push notification
    if (user.pushSubscription) {
      try {
        await webPush.sendNotification(JSON.parse(user.pushSubscription), {
          title: "Ticket Purchase Confirmed",
          body: message,
        });
      } catch (error) {
        console.error(`Failed to send push notification: ${(error as Error).message}`);
      }
    }

    return { success: true, ticketIds };
  },
});

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