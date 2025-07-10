"use node";

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import webPush from "web-push";

webPush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export const sendPushNotification = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification(sub.subscription, JSON.stringify({
          title: args.title,
          body: args.body,
        }));
      } catch (error) {
        console.error(`Failed to send push notification: ${(error as Error).message}`);
      }
    }

    return { success: true };
  },
});