import { query } from "convex/server";
import { v } from "convex/values";

export const validatePromoCode = query({
  args: {
    code: v.string(),
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const promo = await ctx.db
      .query("promoCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (!promo || promo.eventId !== args.eventId) {
      return { valid: false, discount: 0 };
    }

    if (promo.uses >= promo.maxUses || new Date(promo.validUntil) < new Date()) {
      return { valid: false, discount: 0 };
    }

    return { valid: true, discount: promo.discount };
  },
});