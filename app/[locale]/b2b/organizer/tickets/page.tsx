import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useClerk } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

export default function BulkTicketManagementPage() {
  const t = useTranslations("BulkTicketManagementPage");
  const { user } = useClerk();
  const userData = useQuery(api.functions.getUser, { clerkId: user?.id }) || null;
  const events = useQuery(api.functions.getOrganizerEvents, { organizerId: userData?._id }) || [];
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const tickets = useQuery(api.functions.getEventTickets, { eventId: selectedEventId }) || [];
  const bulkManageTickets = useMutation(api.functions.bulkManageTickets);
  const exportTicketsToCSV = useMutation(api.functions.exportTicketsToCSV);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId) ? prev.filter((id) => id !== ticketId) : [...prev, ticketId]
    );
  };

  const handleBulkAction = async (action: "refund" | "resend" | "markUsed") => {
    if (!userData || selectedTickets.length === 0) {
      setError(t("selectTickets") || "Please select at least one ticket");
      return;
    }
    try {
      await bulkManageTickets({
        ticketIds: selectedTickets,
        action,
        organizerId: userData._id,
      });
      setSelectedTickets([]);
      setError("");
      setSuccess(t(`${action}Success`) || `${action.charAt(0).toUpperCase() + action.slice(1)} successful!`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleExportCSV = async () => {
    if (!selectedEventId) {
      setError(t("selectEvent") || "Please select an event");
      return;
    }
    try {
      const csvUrl = await exportTicketsToCSV({ eventId: selectedEventId });
      const a = document.createElement("a");
      a.href = csvUrl;
      a.download = `tickets_${selectedEventId}.csv`;
      a.click();
      setError("");
      setSuccess(t("exportSuccess") || "Tickets exported successfully!");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (!userData || userData.role !== "organizer") return <div>{t("unauthorized") || "Unauthorized"}</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8" aria-labelledby="bulk-ticket-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 id="bulk-ticket-heading" className="text-3xl font-bold text-gray-800 mb-8">
          {t("title") || "Bulk Ticket Management"}
        </h1>
        <div className="mb-6">
          <label htmlFor="event-select" className="block text-gray-700 mb-2">
            {t("selectEvent") || "Select Event"}
          </label>
          <select
            id="event-select"
            value={selectedEventId || ""}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="p-2 border rounded"
            aria-label={t("selectEvent") || "Select an event"}
          >
            <option value="">{t("selectEvent") || "Select an event"}</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>
        {selectedEventId && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              {t("tickets") || "Tickets"}
            </h2>
            {tickets.length > 0 ? (
              <div className="bg-white shadow-md rounded-lg p-6">
                <ul className="space-y-4">
                  {tickets.map((ticket) => (
                    <li key={ticket._id} className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-800">{t("selectTicket") || "Ticket"}: {ticket.ticketType}</p>
                        <p className="text-gray-600">{t("purchaser") || "Purchaser"}: {ticket.userName}</p>
                        <p className="text-gray-600">{t("status") || "Status"}: {ticket.status}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedTickets.includes(ticket._id)}
                        onChange={() => handleSelectTicket(ticket._id)}
                        className="h-5 w-5 text-blue-600"
                        aria-label={t("selectTicket") || `Select ticket ${ticket.ticketType}`}
                      />
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => handleBulkAction("refund")}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600"
                    aria-label={t("refundSelected") || "Refund Selected Tickets"}
                  >
                    {t("refundSelected") || "Refund Selected Tickets"}
                  </button>
                  <button
                    onClick={() => handleBulkAction("resend")}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    aria-label={t("resendEmails") || "Resend Ticket Emails"}
                  >
                    {t("resendEmails") || "Resend Ticket Emails"}
                  </button>
                  <button
                    onClick={() => handleBulkAction("markUsed")}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                    aria-label={t("markUsed") || "Mark Tickets as Used"}
                  >
                    {t("markUsed") || "Mark Tickets as Used"}
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
                    aria-label={t("exportCSV") || "Export to CSV"}
                  >
                    {t("exportCSV") || "Export to CSV"}
                  </button>
                </div>
                {error && (
                  <p className="text-red-600 mt-4" role="alert">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="text-green-600 mt-4" role="alert">
                    {success}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-600">{t("noTickets") || "No tickets found for this event."}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}