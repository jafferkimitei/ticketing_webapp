import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";
import webPush from "web-push";

const resend = new Resend(process.env.RESEND_API_KEY);

webPush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export const notifyWaitlist = mutation({
  args: {
    eventId: v.id("events"),
    ticketType: v.string(),
    organizerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event || event.organizerId !== args.organizerId) {
      throw new Error("Event not found or unauthorized");
    }

    const waitlistEntries = await ctx.db
      .query("waitlists")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId).eq("ticketType", args.ticketType))
      .collect();

    for (const entry of waitlistEntries) {
      const user = await ctx.db.get(entry.userId);
      if (!user) continue;

      // Send email
      await resend.emails.send({
        from: "no-reply@cubepass.com",
        to: user.email,
        subject: `🎟️ Tickets Available for ${event.name}`,
        text: `Great news! ${args.ticketType} tickets for ${event.name} are now available. Visit ${process.env.NEXT_PUBLIC_DOMAIN}/b2c/checkout/${args.eventId} to purchase.`,
      });

      // Send push notification
      const subscriptions = await ctx.db
        .query("pushSubscriptions")
        .withIndex("by_userId", (q) => q.eq("userId", entry.userId))
        .collect();
      for (const sub of subscriptions) {
        try {
          await webPush.sendNotification(sub.subscription, JSON.stringify({
            title: `Tickets Available for ${event.name}`,
            body: `${args.ticketType} tickets are now available!`,
          }));
        } catch (error) {
          console.error(`Failed to send push notification: ${(error as Error).message}`);
        }
      }

      // Create in-app notification
      await ctx.db.insert("notifications", {
        userId: entry.userId,
        type: "waitlist_update",
        message: `${args.ticketType} tickets for ${event.name} are now available!`,
        read: false,
        createdAt: new Date().toISOString(),
      });

      // Remove from waitlist
      await ctx.db.delete(entry._id);
    }

    return { success: true };
  },
});