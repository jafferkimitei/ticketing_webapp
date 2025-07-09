import { mutation } from "convex/server";
import { v } from "convex/values";

export const createPromoCode = mutation({
  args: {
    code: v.string(),
    eventId: v.id("events"),
    discount: v.number(),
    maxUses: v.number(),
    validUntil: v.string(),
    organizerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event || event.organizerId !== args.organizerId) {
      throw new Error("Unauthorized or invalid event");
    }

    const existingCode = await ctx.db
      .query("promoCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
    if (existingCode) {
      throw new Error("Promo code already exists");
    }

    const promoId = await ctx.db.insert("promoCodes", {
      code: args.code,
      eventId: args.eventId,
      discount: args.discount,
      maxUses: args.maxUses,
      uses: 0,
      validUntil: args.validUntil,
      createdAt: new Date().toISOString(),
    });

    return { success: true, promoId };
  },
});