/* eslint-disable @typescript-eslint/no-require-imports */
const withNextIntl = require('next-intl/plugin')('./i18n/request.ts');

module.exports = withNextIntl({
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
    MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
    MPESA_SHORTCODE: process.env.MPESA_SHORTCODE,
    MPESA_PASSKEY: process.env.MPESA_PASSKEY,
    MPESA_INITIATOR_NAME: process.env.MPESA_INITIATOR_NAME,
    MPESA_SECURITY_CREDENTIAL: process.env.MPESA_SECURITY_CREDENTIAL,
    MPESA_CALLBACK_URL: process.env.MPESA_CALLBACK_URL,
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
    QR_ENCRYPTION_KEY: process.env.QR_ENCRYPTION_KEY,
    VAPID_EMAIL: process.env.VAPID_EMAIL,
    VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  },
});