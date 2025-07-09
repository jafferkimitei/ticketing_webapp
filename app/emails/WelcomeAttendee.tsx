import { Button, Container, Head, Heading, Html, Text } from "@react-email/components";
import * as React from "react";

interface WelcomeAttendeeProps {
  name: string;
}

export default function WelcomeAttendee({ name }: WelcomeAttendeeProps) {
  return (
    <Html>
      <Head />
      <Container className="max-w-2xl mx-auto p-4 bg-gray-100">
        <Heading className="text-2xl font-bold text-blue-600">🎟️ Welcome to [Brand Name], {name}!</Heading>
        <Text className="text-gray-700 mt-4">
          You’re now part of an event-loving community. Browse events, book your tickets, and manage them all from your profile. Let’s make memories!
        </Text>
        <Button
          href={`${process.env.NEXT_PUBLIC_DOMAIN}/b2c/events`}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Browse Events
        </Button>
      </Container>
    </Html>
  );
}