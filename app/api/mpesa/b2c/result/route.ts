import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: Request) {
  const body = await request.json();
  const { Result } = body;

  if (Result.ResultCode === "0") {
    const payout = await convex.query(api.functions.getPayoutByTransactionId, {
      mpesaReceiptNumber: Result.TransactionID,
    });

    if (payout) {
      await convex.mutation(api.functions.updatePayoutStatus, {
        payoutId: payout._id,
        status: "completed",
      });
    }
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}