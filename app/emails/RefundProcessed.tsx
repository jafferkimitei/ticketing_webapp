import { Button, Container, Head, Heading, Html, Text } from "@react-email/components";
import * as React from "react";

interface RefundProcessedProps {
  name: string;
  eventName: string;
  amount: number;
}

export default function RefundProcessed({ name, eventName, amount }: RefundProcessedProps) {
  return (
    <Html>
      <Head />
      <Container className="max-w-2xl mx-auto p-4 bg-gray-100">
        <Heading className="text-2xl font-bold text-green-600">💸 Refund Processed for {eventName}</Heading>
        <Text className="text-gray-700 mt-4">
          Hi {name}, your refund of KSH {amount} for {eventName} has been processed to your M-Pesa account. Expect funds within 5-7 business days.
        </Text>
        <Button
          href={`${process.env.NEXT_PUBLIC_DOMAIN}/b2c/my-tickets`}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          View Tickets
        </Button>
      </Container>
    </Html>
  );
}