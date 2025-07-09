import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  const { phoneNumber, amount, ticketId } = await request.json();

  try {
    // Generate M-Pesa access token
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");
    const tokenResponse = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${auth}` },
    });
    const accessToken = tokenResponse.data.access_token;

    // STK Push request
    const timestamp = new Date().toISOString().replace(/[-T:]/g, "").slice(0, 14);
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString("base64");
    const stkPushResponse = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: `Ticket_${ticketId}`,
        TransactionDesc: "Ticket Purchase",
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return NextResponse.json({ success: true, checkoutRequestId: stkPushResponse.data.CheckoutRequestID });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}