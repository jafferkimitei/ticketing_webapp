import { mutation } from "convex/server";
import { v } from "convex/values";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const submitFeedback = mutation({
  args: {
    userId: v.id("users"),
    subject: v.string(),
    message: v.string(),
    category: v.union(v.literal("general"), v.literal("bug"), v.literal("feature"), v.literal("event")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const feedbackId = await ctx.db.insert("feedback", {
      userId: args.userId,
      subject: args.subject,
      message: args.message,
      category: args.category,
      createdAt: new Date().toISOString(),
    });

    await resend.emails.send({
      from: "no-reply@yourdomain.com",
      to: "support@yourdomain.com",
      subject: `New Feedback: ${args.subject}`,
      html: `
        <h2>New Feedback</h2>
        <p><strong>User:</strong> ${user.name} (${user.email})</p>
        <p><strong>Category:</strong> ${args.category}</p>
        <p><strong>Subject:</strong> ${args.subject}</p>
        <p><strong>Message:</strong> ${args.message}</p>
        <p><strong>Feedback ID:</strong> ${feedbackId}</p>
      `,
    });

    return { success: true };
  },
});