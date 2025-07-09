import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface PayoutButtonProps {
  eventId: string;
  organizerId: string;
}

export default function PayoutButton({ eventId, organizerId }: PayoutButtonProps) {
  const releasePayout = useMutation(api.functions.releasePayout);

  const handlePayout = async () => {
    try {
      await releasePayout({ eventId, organizerId });
      alert("Payout initiated successfully!");
    } catch (error) {
      alert(`Error: ${(error as Error).message}`);
    }
  };

  return (
    <button
      onClick={handlePayout}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      Release Payout
    </button>
  );
}