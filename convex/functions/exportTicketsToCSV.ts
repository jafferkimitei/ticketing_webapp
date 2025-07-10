import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const exportTicketsToCSV = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    // 1. Fetch all tickets for the event
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();

    // 2. Prepare CSV headers and rows
    const headers = [
      "Ticket ID",
      "Event Name",
      "Ticket Type",
      "Purchaser Name",
      "Purchaser Email",
      "Status",
      "Purchase Date",
      "QR Code",
    ];

    const rows = await Promise.all(
      tickets.map(async (ticket) => {
        const [event, user] = await Promise.all([
          ctx.db.get(ticket.eventId),
          ctx.db.get(ticket.userId),
        ]);

        return [
          ticket._id,
          event?.name || "Unknown Event",
          ticket.ticketType,
          user?.name || "Unknown User",
          user?.email || "",
          ticket.status,
          new Date(ticket.purchaseDate).toISOString(),
          ticket.qrCode,
        ]
          .map((field) => `"${String(field).replace(/"/g, '""')}"`)
          .join(",");
      })
    );

    // 3. Generate CSV content
    const csvContent = [headers.join(","), ...rows].join("\n");

    // 4. Store in Convex storage and get URL
    const storageId = await ctx.storage.store(
      new Blob([csvContent], { type: "text/csv" })
    );

    // 5. Generate download URL (valid for 1 hour)
    const url = await ctx.storage.getUrl(storageId);

    if (!url) {
      throw new Error("Failed to generate download URL");
    }

    return {
      success: true,
      downloadUrl: url,
      ticketCount: tickets.length,
      generatedAt: new Date().toISOString(),
    };
  },
});