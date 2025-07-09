import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import EventCard from "../../../components/EventCard";

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ location: "", date: "", category: "", search: "" });
  const pageSize = 6;
  const events = useQuery(
    filters.search ? api.functions.searchEvents : api.functions.getEventsWithFilters,
    filters.search
      ? { query: filters.search, skip: (page - 1) * pageSize, limit: pageSize }
      : {
          location: filters.location,
          date: filters.date,
          category: filters.category,
          skip: (page - 1) * pageSize,
          limit: pageSize,
        }
  ) || { events: [], total: 0 };
  const totalPages = Math.ceil(events.total / pageSize);
  const categories = ["Concert", "Conference", "Workshop", "Festival", "Sports"];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Browse Events</h1>
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div>
            <label htmlFor="search" className="block text-gray-700 mb-2">Search</label>
            <input
              id="search"
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="p-2 border rounded"
              placeholder="Search events..."
              aria-label="Search events by name, description, or location"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-gray-700 mb-2">Location</label>
            <input
              id="location"
              type="text"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="p-2 border rounded"
              placeholder="e.g., Nairobi"
              aria-label="Filter events by location"
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-gray-700 mb-2">Date</label>
            <input
              id="date"
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="p-2 border rounded"
              aria-label="Filter events by date"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-gray-700 mb-2">Category</label>
            <select
              id="category"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="p-2 border rounded"
              aria-label="Filter events by category"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.events.map((event) => (
            <EventCard key={event._id} event={{ id: event._id, ...event }} />
          ))}
        </div>
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="text-gray-700">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}