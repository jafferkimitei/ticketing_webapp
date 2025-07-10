import { query } from "../_generated/server";
import { v } from "convex/values";

export const getPayouts = query({
  args: { organizerId: v.id("users") },
  handler: async (ctx, args) => {
    const payouts = await ctx.db
      .query("payouts")
      .withIndex("by_organizerId", (q) => q.eq("organizerId", args.organizerId))
      .collect();

    return Promise.all(
      payouts.map(async (payout) => {
        const event = await ctx.db.get(payout.eventId);
        return { ...payout, eventName: event?.name || "Unknown Event" };
      })
    );
  },
});