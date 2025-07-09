import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const updateUserPreferences = mutation({
  args: {
    userId: v.id("users"),
    preferredCategories: v.array(v.string()),
    preferredLocations: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      preferredCategories: args.preferredCategories,
      preferredLocations: args.preferredLocations,
    });
    return { success: true };
  },
});