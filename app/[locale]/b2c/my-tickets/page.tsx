import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useClerk } from "@clerk/nextjs";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function MyTicketsPage() {
  const t = useTranslations("MyTicketsPage");
  const { user } = useClerk();
  const userData = useQuery(api.functions.getUser, { clerkId: user?.id }) || null;
  const tickets = useQuery(
    api.functions.getUserTickets,
    userData ? { userId: userData._id } : "skip"
  ) || [];

  useEffect(() => {
    if (tickets.length > 0 && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage({
          type: "CACHE_TICKETS",
          tickets: tickets.map((ticket) => ({
            id: ticket._id,
            eventName: ticket.eventName,
            ticketType: ticket.ticketType,
            qrCode: ticket.qrCode,
            purchaseDate: ticket.purchaseDate,
          })),
        });
      });

      const dbRequest = indexedDB.open("ticketingDB", 1);
      dbRequest.onupgradeneeded = () => {
        const db = dbRequest.result;
        if (!db.objectStoreNames.contains("tickets")) {
          db.createObjectStore("tickets", { keyPath: "id" });
        }
      };
    }
  }, [tickets]);

  const getOfflineTickets = async () => {
    return new Promise((resolve) => {
      const dbRequest = indexedDB.open("ticketingDB", 1);
      dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const transaction = db.transaction(["tickets"], "readonly");
        const store = transaction.objectStore("tickets");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
      };
      dbRequest.onerror = () => resolve([]);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8" aria-labelledby="my-tickets-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 id="my-tickets-heading" className="text-3xl font-bold text-gray-800 mb-8 text-center">
          {t("title") || "My Tickets"}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <div
                key={ticket._id}
                className="bg-white p-6 rounded-lg shadow-md"
                aria-labelledby={`ticket-${ticket._id}-title`}
              >
                <h2 id={`ticket-${ticket._id}-title`} className="text-xl font-semibold text-gray-800 mb-2">
                  {ticket.eventName}
                </h2>
                <p className="text-gray-600">{t("ticketType") || "Ticket Type"}: {ticket.ticketType}</p>
                <p className="text-gray-600">
                  {t("purchased") || "Purchased"}: {new Date(ticket.purchaseDate).toLocaleDateString()}
                </p>
                <img
                  src={ticket.qrCode}
                  alt={`QR code for ${ticket.eventName} ${ticket.ticketType}`}
                  className="mt-4 w-32 h-32 mx-auto"
                />
              </div>
            ))
          ) : (
            <p className="text-gray-600 col-span-full text-center">
              {t("noTickets") || "No tickets found. Purchase tickets to see them here!"}
            </p>
          )}
        </div>
        <button
          onClick={async () => {
            const offlineTickets = await getOfflineTickets();
            console.log("Offline Tickets:", offlineTickets);
          }}
          className="mt-8 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          aria-label="View offline tickets"
        >
          {t("viewOffline") || "View Offline Tickets"}
        </button>
      </div>
    </div>
  );
}