import { Button, Container, Head, Heading, Html, Text } from "@react-email/components";
import * as React from "react";

interface PayoutNoticeProps {
  name: string;
  eventName: string;
  amount: number;
}

export default function PayoutNotice({ name, eventName, amount }: PayoutNoticeProps) {
  return (
    <Html>
      <Head />
      <Container className="max-w-2xl mx-auto p-4 bg-gray-100">
        <Heading className="text-2xl font-bold text-green-600">✅ Payout Complete for {eventName}</Heading>
        <Text className="text-gray-700 mt-4">
          Hi {name}, your payout of KSH {amount} for {eventName} has been sent to your M-Pesa account. Funds should arrive within 1-2 business days.
        </Text>
        <Button
          href={`${process.env.NEXT_PUBLIC_DOMAIN}/b2b/organizer/payouts`}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          View Payouts
        </Button>
      </Container>
    </Html>
  );
}