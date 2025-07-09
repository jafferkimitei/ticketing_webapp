import { query } from "../_generated/server";
import { v } from "convex/values";

export const getPayoutByTransactionId = query({
  args: { mpesaReceiptNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payouts")
      .withIndex("by_mpesaReceiptNumber", (q) => q.eq("mpesaReceiptNumber", args.mpesaReceiptNumber))
      .first();
  },
});