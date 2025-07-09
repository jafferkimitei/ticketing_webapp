/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

interface Ticket {
  id: string;
  eventName: string;
  ticketType: string;
  purchaseDate: string;
  qrCode: string;
}

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 m-4">
      <h2 className="text-xl font-bold text-gray-800">{ticket.eventName}</h2>
      <p className="text-gray-600 mt-2">Ticket Type: {ticket.ticketType}</p>
      <p className="text-sm text-gray-500 mt-1">Purchased: {new Date(ticket.purchaseDate).toLocaleDateString()}</p>
      <button
        onClick={() => setShowQR(!showQR)}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {showQR ? "Hide QR Code" : "Show QR Code"}
      </button>
      {showQR && (
        <div className="mt-4 flex justify-center">
          <img src={ticket.qrCode} alt="Ticket QR Code" className="w-32 h-32" />
        </div>
      )}
    </div>
  );
}