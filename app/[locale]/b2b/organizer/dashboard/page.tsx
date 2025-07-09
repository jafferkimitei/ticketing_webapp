import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { useTranslations } from "next-intl";
import { Id } from "../../../../../convex/_generated/dataModel";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardPage() {
  const t = useTranslations("DashboardPage");
  const { user } = useClerk();
  const events = useQuery(api.functions.getEvents, user?.id ? { organizerId: user.id } : "skip") || [];
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  const analytics = useQuery(
    api.functions.getSalesAnalytics,
    selectedEventId && user?.id ? { 
      eventId: selectedEventId as Id<"events">, 
      organizerId: user.id 
    } : "skip"
  );
  
  const scanningStats = useQuery(
    api.functions.getScanningStats,
    selectedEventId && user?.id ? { 
      eventId: selectedEventId as Id<"events">, 
      organizerId: user.id 
    } : "skip"
  );
  
  const notifyWaitlist = useMutation(api.functions.notifyWaitlist);
  
  const notifications: { _id: string; type: string; message: string }[] = useQuery(
    api.functions.getNotifications,
    user ? { userId: user.id as Id<"users"> } : "skip"
  ) || [];

  const hourlyScansData = {
    labels: scanningStats ? Object.keys(scanningStats.hourlyScans).map((h) => `${h}:00`) : [],
    datasets: [
      {
        label: t("hourlyScans") || "Tickets Scanned per Hour",
        data: scanningStats ? Object.values(scanningStats.hourlyScans) : [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const handleNotifyWaitlist = async (ticketType: string) => {
    if (!selectedEventId || !user?.id) return;
    
    try {
      await notifyWaitlist({
        eventId: selectedEventId as Id<"events">,
        ticketType,
        organizerId: user.id as Id<"users">,
      });
      alert(t("notifyWaitlistSuccess") || `Waitlist for ${ticketType} notified!`);
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    }
  };

  const extractTicketTypeFromMessage = (message: string): string => {
    const match = message.match(/A (.+) ticket/);
    return match ? match[1] : 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8" aria-labelledby="dashboard-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 id="dashboard-heading" className="text-3xl font-bold text-gray-800 mb-8">
          {t("title") || "Organizer Dashboard"}
        </h1>
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <Link href="/b2b/organizer/new-event">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label={t("createEvent") || "Create new event"}
            >
              {t("createEvent") || "Create Event"}
            </button>
          </Link>
          <Link href="/b2b/organizer/verify-ticket">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label={t("verifyTickets") || "Verify tickets"}
            >
              {t("verifyTickets") || "Verify Tickets"}
            </button>
          </Link>
          <Link href="/b2b/organizer/promo-codes">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label={t("managePromoCodes") || "Manage promo codes"}
            >
              {t("managePromoCodes") || "Manage Promo Codes"}
            </button>
          </Link>
          <Link href="/b2b/organizer/analytics">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label={t("viewAnalytics") || "View analytics"}
            >
              {t("viewAnalytics") || "View Analytics"}
            </button>
          </Link>
          <Link href="/b2b/organizer/tickets">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label={t("manageTickets") || "Manage Tickets"}
            >
              {t("manageTickets") || "Manage Tickets"}
            </button>
          </Link>
        </div>
        <div className="mb-8">
          <label htmlFor="event-select" className="block text-gray-700 mb-2">
            {t("selectEvent") || "Select Event"}
          </label>
          <select
            id="event-select"
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full max-w-xs p-2 border rounded"
            aria-label={t("selectEvent") || "Select event for dashboard"}
          >
            <option value="">{t("selectEvent") || "Select an event"}</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>
        {analytics && scanningStats && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">{analytics.eventName}</h2>
            <p className="text-gray-700">{t("totalSales") || "Total Sales"}: KSH {analytics.totalSales}</p>
            <p className="text-gray-700">{t("ticketsSold") || "Tickets Sold"}: {analytics.ticketCount}</p>
            <p className="text-gray-700">{t("ticketsScanned") || "Tickets Scanned"}: {scanningStats.scannedTickets}</p>
            <p className="text-gray-700">{t("scanRate") || "Scan Rate"}: {scanningStats.scanRate.toFixed(2)}%</p>
            <h3 className="text-lg font-semibold text-gray-700 mt-4">
              {t("waitlistNotifications") || "Waitlist Notifications"}
            </h3>
            {notifications
              .filter((n) => n.type === "waitlist_trigger" && n.message.includes(analytics.eventName))
              .map((n) => {
                const ticketType = extractTicketTypeFromMessage(n.message);
                return (
                  <div key={n._id} className="mt-2">
                    <p>{n.message}</p>
                    <button
                      onClick={() => handleNotifyWaitlist(ticketType)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                      aria-label={t("notifyWaitlist") || `Notify waitlist for ${ticketType}`}
                    >
                      {t("notifyWaitlist") || "Notify Waitlist"}
                    </button>
                  </div>
                );
              })}
            <h3 className="text-lg font-semibold text-gray-700 mt-4">
              {t("hourlyScans") || "Hourly Ticket Scans"}
            </h3>
            <div className="h-64">
              <Bar data={hourlyScansData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}