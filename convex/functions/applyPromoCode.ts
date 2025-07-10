import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

export const applyPromoCode = mutation({
  args: {
    eventId: v.id("events"),
    code: v.string(),
  },
  handler: async (ctx, args: { eventId: Id<"events">; code: string }) => {
   
    const promo = await ctx.db
      .query("promoCodes") 
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
    if (!promo || promo.eventId !== args.eventId) throw new Error("Invalid or expired promo code");
    return promo.discount;
  },
});