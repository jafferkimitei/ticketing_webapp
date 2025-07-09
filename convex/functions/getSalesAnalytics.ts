/* eslint-disable @typescript-eslint/no-explicit-any */
import { query } from "../_generated/server";
import { v } from "convex/values";

export const getSalesAnalytics = query({
    args: { eventId: v.id("events"), organizerId: v.string() },
    handler: async (ctx, args) => {
      const event = await ctx.db.get(args.eventId);
      if (!event || event.organizerId !== args.organizerId) {
        throw new Error("Event not found or unauthorized");
      }
  
      const tickets = await ctx.db
        .query("tickets")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
        .collect();
  
      const transactions = await Promise.all(
        tickets.map((ticket) =>
          ctx.db
            .query("transactions")
            .withIndex("by_ticketId", (q) => q.eq("ticketId", ticket._id))
            .first()
        )
      );
  
      const totalSales = transactions.reduce((sum, tx) => sum + (tx?.amount || 0), 0);
      const ticketCount = tickets.length;
      
      const ticketTypeBreakdown = event.ticketTypes.map((type: any) => ({
        type: type.type,
        sold: tickets.filter((t) => t.ticketType === type.type).length,
        revenue: transactions
          .filter((tx) => tickets.find((t) => t._id === tx?.ticketId)?.ticketType === type.type)
          .reduce((sum, tx) => sum + (tx?.amount || 0), 0),
      }));
  
      // Daily sales
      const dailySales = transactions.reduce((acc, tx) => {
        if (!tx) return acc;
        const date = new Date(tx.createdAt).toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + tx.amount;
        return acc;
      }, {} as Record<string, number>);
  
      // Refund rate
      const refundedTickets = tickets.filter((t) => t.status === "refunded").length;
      const refundRate = ticketCount > 0 ? (refundedTickets / ticketCount) * 100 : 0;
  
      // Attendee demographics (age groups)
      const attendees = await Promise.all(
        tickets.map((ticket) => ctx.db.get(ticket.userId))
      );
      
      const ageGroups = attendees.reduce((acc, user) => {
        if (!user || !user.age) return acc;
        const ageGroup = Math.floor(user.age / 10) * 10;
        acc[`${ageGroup}-${ageGroup + 9}`] = (acc[`${ageGroup}-${ageGroup + 9}`] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
  
      return {
        eventName: event.name,
        totalSales,
        ticketCount,
        ticketTypeBreakdown,
        dailySales,
        refundRate,
        ageGroups,
      };
    },
  });
  