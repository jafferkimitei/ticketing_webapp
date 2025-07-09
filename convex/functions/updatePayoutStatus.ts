import { mutation } from "convex/server";
import { v } from "convex/values";

export const updatePayoutStatus = mutation({
  args: { payoutId: v.id("payouts"), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.payoutId, { status: args.status });
  },
});