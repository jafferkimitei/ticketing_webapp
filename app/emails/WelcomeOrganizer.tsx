import { Button, Container, Head, Heading, Html, Text } from "@react-email/components";
import * as React from "react";

interface WelcomeOrganizerProps {
  name: string;
}

export default function WelcomeOrganizer({ name }: WelcomeOrganizerProps) {
  return (
    <Html>
      <Head />
      <Container className="max-w-2xl mx-auto p-4 bg-gray-100">
        <Heading className="text-2xl font-bold text-blue-600">🚀 Welcome Organizer, {name}!</Heading>
        <Text className="text-gray-700 mt-4">
          Create, promote, and sell tickets effortlessly. Your organizer dashboard is live. We’ll handle payments, refunds, and QR delivery. You focus on the show.
        </Text>
        <Button
          href={`${process.env.NEXT_PUBLIC_DOMAIN}/b2b/organizer/dashboard`}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Go to Dashboard
        </Button>
      </Container>
    </Html>
  );
}