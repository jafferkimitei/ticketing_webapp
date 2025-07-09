import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useClerk } from "@clerk/nextjs";
import { useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function AnalyticsPage() {
  const { user } = useClerk();
  const events = useQuery(api.functions.getEvents, { organizerId: user?.id || "" }) || [];
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  const analytics = useQuery(
    api.functions.getSalesAnalytics,
    selectedEventId && user?.id ? { eventId: selectedEventId, organizerId: user.id } : "skip"
  );
  
  const exportData = useQuery(
    api.functions.exportAnalytics,
    selectedEventId && user?.id ? { eventId: selectedEventId, organizerId: user.id } : "skip"
  );

  const dailySalesData = {
    labels: analytics ? Object.keys(analytics.dailySales) : [],
    datasets: [
      {
        label: "Daily Sales (KSH)",
        data: analytics ? Object.values(analytics.dailySales) : [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const ticketTypeData = {
    labels: analytics ? analytics.ticketTypeBreakdown.map((t: any) => t.type) : [],
    datasets: [
      {
        label: "Tickets Sold",
        data: analytics ? analytics.ticketTypeBreakdown.map((t: any) => t.sold) : [],
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
      {
        label: "Revenue (KSH)",
        data: analytics ? analytics.ticketTypeBreakdown.map((t: any) => t.revenue) : [],
        backgroundColor: "rgba(255, 159, 64, 0.6)",
      },
    ],
  };

  const ageGroupData = {
    labels: analytics ? Object.keys(analytics.ageGroups) : [],
    datasets: [
      {
        label: "Attendees by Age Group",
        data: analytics ? Object.values(analytics.ageGroups) : [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
      },
    ],
  };

  const handleExport = () => {
    if (exportData) {
      const blob = new Blob([exportData.csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = exportData.filename;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8" aria-labelledby="analytics-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 id="analytics-heading" className="text-3xl font-bold text-gray-800 mb-8">Sales Analytics</h1>
        <div className="mb-8">
          <label htmlFor="event-select" className="block text-gray-700 mb-2">Select Event</label>
          <select
            id="event-select"
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full max-w-xs p-2 border rounded"
            aria-label="Select event for analytics"
          >
            <option value="">Select an event</option>
            {events.map((event: any) => (
              <option key={event._id} value={event._id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>
        {analytics && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">{analytics.eventName}</h2>
            <p className="text-gray-700">Total Sales: KSH {analytics.totalSales}</p>
            <p className="text-gray-700">Tickets Sold: {analytics.ticketCount}</p>
            <p className="text-gray-700">Refund Rate: {analytics.refundRate.toFixed(2)}%</p>
            <button
              onClick={handleExport}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Export analytics as CSV"
            >
              Export to CSV
            </button>
            <h3 className="text-lg font-semibold text-gray-700 mt-4">Ticket Type Breakdown</h3>
            <div className="h-64">
              <Bar data={ticketTypeData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mt-6">Daily Sales</h3>
            <div className="h-64">
              <Bar data={dailySalesData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mt-6">Attendee Age Groups</h3>
            <div className="h-64">
              <Pie data={ageGroupData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}