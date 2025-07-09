import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      message: args.message,
      read: false,
      createdAt: new Date().toISOString(),
    });
    return { success: true, notificationId };
  },
});