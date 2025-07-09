import { Button, Container, Head, Heading, Html, Text } from "@react-email/components";
import * as React from "react";

interface EventCancelledProps {
  name: string;
  eventName: string;
}

export default function EventCancelled({ name, eventName }: EventCancelledProps) {
  return (
    <Html>
      <Head />
      <Container className="max-w-2xl mx-auto p-4 bg-gray-100">
        <Heading className="text-2xl font-bold text-red-600">❌ {eventName} Cancelled</Heading>
        <Text className="text-gray-700 mt-4">
          Hi {name}, we’re sorry to inform you that {eventName} has been cancelled. A full refund will be processed to your M-Pesa account within 5-7 business days.
        </Text>
        <Button
          href={`${process.env.NEXT_PUBLIC_DOMAIN}/b2c/my-tickets`}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Check Refund Status
        </Button>
      </Container>
    </Html>
  );
}