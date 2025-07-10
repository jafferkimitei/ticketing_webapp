import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("attendee"), v.literal("organizer")),
    phone: v.optional(v.string()),
    age: v.optional(v.number()),
    createdAt: v.string(),
    preferredCategories: v.array(v.string()),
    preferredLocations: v.array(v.string()),
  }).index("by_clerkId", ["clerkId"]),
  events: defineTable({
    name: v.string(),
    description: v.string(),
    date: v.string(),
    location: v.string(),
    organizerId: v.id("users"),
    category: v.string(),
    ticketTypes: v.array(
      v.object({
        type: v.string(),
        price: v.number(),
        quantity: v.number(),
        available: v.number(),
      })
    ),
    createdAt: v.string(),
    surgeSettings: v.optional(
      v.object({
        velocityThreshold: v.number(),
        velocitySurge: v.number(),
        availabilityThreshold: v.number(),
        availabilitySurge: v.number(),
        disabled: v.boolean(),
      })
    ),
  })
    .index("by_organizerId", ["organizerId"])
    .index("by_category", ["category"])
    .searchIndex("search_events", {
      searchField: "name",
    }),
  tickets: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    ticketType: v.string(),
    status: v.string(),
    qrCode: v.string(),
    purchaseDate: v.string(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_userId", ["userId"]),
  transactions: defineTable({
    ticketId: v.id("tickets"),
    userId: v.id("users"),
    eventId: v.id("events"),
    amount: v.number(),
    paymentMethod: v.literal("mpesa"),
    status: v.string(),
    createdAt: v.string(),
    mpesaReceiptNumber: v.string(),
  })
    .index("by_ticketId", ["ticketId"])
    .index("by_mpesaReceiptNumber", ["mpesaReceiptNumber"])
    .index("by_eventId", ["eventId"]),
  payouts: defineTable({
    organizerId: v.id("users"),
    eventId: v.id("events"),
    amount: v.number(),
    status: v.string(),
    createdAt: v.string(),
    mpesaReceiptNumber: v.string(),
  })
    .index("by_organizerId", ["organizerId"])
    .index("by_mpesaReceiptNumber", ["mpesaReceiptNumber"]),
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    message: v.string(),
    read: v.boolean(),
    createdAt: v.string(),
  }).index("by_userId", ["userId"]),
  promoCodes: defineTable({
    code: v.string(),
    eventId: v.id("events"),
    discount: v.number(),
    maxUses: v.number(),
    uses: v.number(),
    validUntil: v.string(),
    createdAt: v.string(),
  })
    .index("by_code", ["code"])
    .index("by_eventId", ["eventId"]),
  pushSubscriptions: defineTable({
    userId: v.id("users"),
    subscription: v.object({
      endpoint: v.string(),
      keys: v.object({
        p256dh: v.string(),
        auth: v.string(),
      }),
    }),
    createdAt: v.string(),
  }).index("by_userId", ["userId"]),
  waitlists: defineTable({
    userId: v.id("users"),
    eventId: v.id("events"),
    ticketType: v.string(),
    createdAt: v.string(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_userId_eventId_ticketType", ["userId", "eventId", "ticketType"]),
  reviews: defineTable({
    userId: v.id("users"),
    eventId: v.id("events"),
    rating: v.number(),
    comment: v.string(),
    createdAt: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("flagged")),
    flaggedReason: v.optional(v.string()),
  })
    .index("by_eventId_status", ["eventId", "status"])
    .index("by_userId_eventId", ["userId", "eventId"]),
  feedback: defineTable({
    userId: v.id("users"),
    subject: v.string(),
    message: v.string(),
    category: v.union(v.literal("general"), v.literal("bug"), v.literal("feature"), v.literal("event")),
    createdAt: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_category", ["category"]),
  responses: defineTable({
    reviewId: v.id("reviews"),
    organizerId: v.id("users"),
    comment: v.string(),
    createdAt: v.string(),
  })
    .index("by_reviewId", ["reviewId"])
    .index("by_organizerId", ["organizerId"]),
});