import { mutation } from "convex/server";
import { v } from "convex/values";
import { Resend } from "resend";
import * as React from "react";
import WelcomeAttendee from "../../app/emails/WelcomeAttendee";
import WelcomeOrganizer from "../../app/emails/WelcomeOrganizer";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = mutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("attendee"), v.literal("organizer")),
  },
  handler: async (ctx, args) => {
    const component = args.role === "attendee"
      ? React.createElement(WelcomeAttendee, { name: args.name })
      : React.createElement(WelcomeOrganizer, { name: args.name });
    const subject = args.role === "attendee" ? "🎟️ Welcome to [Brand Name]!" : "🚀 Welcome Organizer!";

    const response = await resend.emails.send({
      from: "no-reply@yourdomain.com",
      to: args.email,
      subject,
      react: component,
    });

    if (response.error) {
      throw new Error(`Failed to send email: ${response.error.message}`);
    }

    return { success: true };
  },
});