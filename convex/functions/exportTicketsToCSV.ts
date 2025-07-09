import { mutation } from "convex/server";
import { v } from "convex/values";

export const exportTicketsToCSV = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    const headers = ["Ticket ID", "Event Name", "Ticket Type", "Purchaser", "Status", "Purchase Date"];
    const rows = await Promise.all(
      tickets.map(async (ticket) => {
        const event = await ctx.db.get(ticket.eventId);
        const user = await ctx.db.get(ticket.userId);
        return [
          ticket._id,
          event?.name || "Unknown Event",
          ticket.ticketType,
          user?.name || "Unknown User",
          ticket.status,
          new Date(ticket.purchaseDate).toLocaleDateString(),
        ].map((field) => `"${field}"`).join(",");
      })
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob); // Note: This is a client-side operation, but for simplicity, return the content
    return csvContent; // In practice, store in Convex storage and return a URL
  },
});