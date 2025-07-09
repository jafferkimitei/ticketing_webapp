import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface RefundButtonProps {
  ticketId: string;
  organizerId: string;
}

export default function RefundButton({ ticketId, organizerId }: RefundButtonProps) {
  const processRefund = useMutation(api.functions.processRefund);

  const handleRefund = async () => {
    try {
      await processRefund({ ticketId, organizerId });
      alert("Refund processed successfully!");
    } catch (error) {
      alert(`Error: ${(error as Error).message}`);
    }
  };

  return (
    <button
      onClick={handleRefund}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
    >
      Issue Refund
    </button>
  );
}