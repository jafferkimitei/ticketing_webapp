import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

export const applyPromoCode = mutation({
  args: {
    eventId: v.id("events"),
    code: v.string(),
  },
  handler: async (ctx, args: { eventId: Id<"events">; code: string }) => {
    // Placeholder: Validate promo code against a hypothetical "promos" table
    const promo = await ctx.db
      .query("promos") // Assumes a promos table; adjust as needed
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
    if (!promo || promo.eventId !== args.eventId) throw new Error("Invalid or expired promo code");
    return promo.discount; // e.g., 10 for 10% off
  },
});