import { Button, Container, Head, Heading, Html, Img, Text } from "@react-email/components";
import * as React from "react";

interface TicketConfirmationProps {
  name: string;
  eventName: string;
  ticketType: string;
  qrCode: string;
}

export default function TicketConfirmation({ name, eventName, ticketType, qrCode }: TicketConfirmationProps) {
  return (
    <Html>
      <Head />
      <Container className="max-w-2xl mx-auto p-4 bg-gray-100">
        <Heading className="text-2xl font-bold text-blue-600">🎫 Your Ticket for {eventName}</Heading>
        <Text className="text-gray-700 mt-4">
          Hi {name}, your ticket for {eventName} ({ticketType}) is ready! Present the QR code below at the event.
        </Text>
        <Img src={qrCode} alt="Ticket QR Code" className="mt-4 mx-auto" width="150" height="150" />
        <Button
          href={`${process.env.NEXT_PUBLIC_DOMAIN}/b2c/my-tickets`}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          View My Tickets
        </Button>
      </Container>
    </Html>
  );
}