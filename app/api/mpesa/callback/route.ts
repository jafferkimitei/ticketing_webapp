import { NextResponse } from "next/server";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export async function POST(request: Request) {
  const callbackData = await request.json();
  const { ResultCode, ResultDesc, CheckoutRequestID, MpesaReceiptNumber } = callbackData.Body.stkCallback;

  try {
    if (ResultCode === 0) {
      // Payment successful, update transaction in Convex
      const updateTransaction = useMutation(api.transactions.updateTransaction);
      await updateTransaction({
        checkoutRequestId: CheckoutRequestID,
        status: "completed",
        mpesaReceiptNumber: MpesaReceiptNumber,
      });
      return NextResponse.json({ success: true });
    } else {
      // Payment failed
      return NextResponse.json({ success: false, error: ResultDesc });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}