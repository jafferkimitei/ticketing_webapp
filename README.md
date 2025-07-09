Ticketing Marketplace
A Next.js 15-based ticketing platform with Convex backend, Clerk authentication, M-Pesa payments, and multi-language support.
Setup

Install Dependencies:
npm install


Environment Variables:Create a .env.local file with the following:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CONVEX_URL=your_convex_url
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=your_mpesa_shortcode
MPESA_PASSKEY=your_mpesa_passkey
MPESA_INITIATOR_NAME=your_mpesa_initiator_name
MPESA_SECURITY_CREDENTIAL=your_mpesa_security_credential
MPESA_CALLBACK_URL=your_mpesa_callback_url
RESEND_API_KEY=your_resend_api_key
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=your_vapid_email
QR_ENCRYPTION_KEY=32_byte_encryption_key


Run Development Server:
npm run dev


Deploy Convex Backend:
npx convex deploy



New Features (July 2025)
Event Reviews

Schema: Added reviews table (userId, eventId, rating, comment, createdAt).
Functions:
submitReview: Submits a review (1–5 stars) for attended events.
getEventReviews: Fetches reviews for an event.


UI: Review form and display on /b2c/events/[eventId].

Bulk Ticket Management

Functions:
bulkRefundTickets: Refunds multiple tickets via M-Pesa reversal API, notifies waitlists.
getEventTickets: Fetches tickets for an event.


UI: Bulk refund interface at /b2b/organizer/tickets.

Dynamic Pricing

Logic: Surge pricing (20% for >0.5 tickets/hour, 30% for <20% availability) in createEvent, updateEvent, purchaseTicket.
UI: Displays surge pricing on /b2c/checkout/[eventId].

Calendar App Integration

Function: generateCalendarLink creates .ics files and Google Calendar URLs.
UI: Buttons on /b2c/events/[eventId] for Google Calendar and iCal.

Feedback Form

Schema: Added feedback table (userId, subject, message, category, createdAt).
Function: submitFeedback stores feedback and sends email via Resend.
UI: Feedback form at /b2c/feedback.

M-Pesa Reversal API Integration

Endpoint: https://sandbox.safaricom.co.ke/mpesa/reversal/v1/request
Usage: Called in bulkRefundTickets to process refunds.
Configuration:
Requires MPESA_INITIATOR_NAME, MPESA_SECURITY_CREDENTIAL, MPESA_SHORTCODE, MPESA_CALLBACK_URL.
Callback URL must handle /reversal/callback and /reversal/timeout.



Testing

Unit Tests:
npm run test


Use convex-test for Convex functions.
Test submitReview, bulkRefundTickets, generateCalendarLink, etc.


Integration Tests:
npm run cypress


Test end-to-end flows: review submission, bulk refunds, surge pricing, calendar integration.
Mock M-Pesa API responses in sandbox mode.


Accessibility:
npm run lighthouse


Verify ARIA labels and keyboard navigation.



Environment Variables



Variable
Description



MPESA_*
M-Pesa API credentials and callback URLs


RESEND_API_KEY
Resend email service API key


VAPID_*
Web Push API keys for notifications


QR_ENCRYPTION_KEY
32-byte key for QR code encryption


Deployment

Next.js:
npm run build
vercel deploy --prod


Convex:
npx convex deploy


Monitoring:

Use Sentry for error tracking.
Use Google Analytics for feature usage (reviews, refunds, calendar links).


"# cubepass" 
