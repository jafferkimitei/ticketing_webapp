import { query } from "../_generated/server";
import { v } from "convex/values";

export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    
    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
    };
  },
});