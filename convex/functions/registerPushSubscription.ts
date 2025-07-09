import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const registerPushSubscription = mutation({
  args: {
    userId: v.id("users"),
    subscription: v.object({
      endpoint: v.string(),
      keys: v.object({
        p256dh: v.string(),
        auth: v.string(),
      }),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("pushSubscriptions", {
      userId: args.userId,
      subscription: args.subscription,
      createdAt: new Date().toISOString(),
    });
    return { success: true };
  },
});