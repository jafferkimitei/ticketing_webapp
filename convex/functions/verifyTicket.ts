import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { createDecipheriv } from "crypto";

export const verifyTicket = mutation({
  args: {
    qrCodeData: v.string(),
    organizerId: v.string(),
  },
  handler: async (ctx, args: { qrCodeData: string; organizerId: string }) => {
    // Decrypt QR code
    try {
      const [ivHex, encryptedHex] = args.qrCodeData.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');
      const decipher = createDecipheriv('aes-256-cbc', Buffer.from(process.env.QR_ENCRYPTION_KEY!), iv);
      let ticketId = decipher.update(encrypted).toString('utf8');
      ticketId += decipher.final().toString('utf8');

      if (!ticketId.startsWith('ticket:')) {
        return { success: false, error: "Invalid QR code format" };
      }
      const actualTicketId = ticketId.replace('ticket:', '') as Id<"tickets">;

      // Verify organizer
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", args.organizerId))
        .first();
      if (!user || user.role !== "organizer") {
        return { success: false, error: "Unauthorized" };
      }

      // Get ticket
      const ticket = await ctx.db.get(actualTicketId);
      if (!ticket) {
        return { success: false, error: "Ticket not found" };
      }

      // Get event
      const event = await ctx.db.get(ticket.eventId);
      if (!event || event.organizerId !== args.organizerId) {
        return { success: false, error: "Event not found or unauthorized" };
      }

      // Check ticket status
      if (ticket.status !== "active") {
        return { success: false, error: "Ticket is not active" };
      }

      // Mark ticket as used
      await ctx.db.patch(actualTicketId, { status: "used" });

      // Create notification
      await ctx.db.insert("notifications", {
        userId: ticket.userId,
        message: `Your ${ticket.ticketType} ticket for ${event.name} was verified and used.`,
        read: false,
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        eventName: event.name,
        ticketType: ticket.ticketType,
        userName: ticket.userName,
        purchaseDate: ticket.purchaseDate,
      };
    } catch (err) {
      return { success: false, error: `Failed to decrypt QR code: ${(err as Error).message}` };
    }
  },
});