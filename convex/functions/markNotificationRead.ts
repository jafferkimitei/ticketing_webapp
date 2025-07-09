import { mutation } from "convex/server";
import { v } from "convex/values";

export const markNotificationRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { read: true });
    return { success: true };
  },
});