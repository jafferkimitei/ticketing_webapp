import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useClerk } from "@clerk/nextjs";

export default function PromoCodesPage() {
  const { user } = useClerk();
  const createPromoCode = useMutation(api.functions.createPromoCode);
  const events = useQuery(api.functions.getEvents, { organizerId: user?.id }) || [];
  const [formData, setFormData] = useState({
    code: "",
    eventId: "",
    discount: 0,
    maxUses: 0,
    validUntil: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPromoCode({
        ...formData,
        discount: Number(formData.discount),
        maxUses: Number(formData.maxUses),
        organizerId: user!.id,
      });
      alert("Promo code created!");
      setFormData({ code: "", eventId: "", discount: 0, maxUses: 0, validUntil: "" });
    } catch (error) {
      alert(`Error: ${(error as Error).message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 flex flex-col items-center">
      <div className="w-full max-w-md px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Create Promo Code</h1>
        <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="code" className="block text-gray-700 mb-2">Promo Code</label>
            <input
              id="code"
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="p-2 border rounded"
              required
              aria-label="Enter promo code"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="eventId" className="block text-gray-700 mb-2">Event</label>
            <select
              id="eventId"
              value={formData.eventId}
              onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
              className="p-2 border rounded"
              required
              aria-label="Select event for promo code"
            >
              <option value="">Select an event</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>{event.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="discount" className="block text-gray-700 mb-2">Discount (%)</label>
            <input
              id="discount"
              type="number"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
              className="p-2 border rounded"
              required
              min="0"
              max="100"
              aria-label="Enter discount percentage"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="maxUses" className="block text-gray-700 mb-2">Max Uses</label>
            <input
              id="maxUses"
              type="number"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) })}
              className="p-2 border rounded"
              required
              min="1"
              aria-label="Enter maximum uses for promo code"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="validUntil" className="block text-gray-700 mb-2">Valid Until</label>
            <input
              id="validUntil"
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              className="p-2 border rounded"
              required
              aria-label="Enter promo code expiration date"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            aria-label="Create promo code"
          >
            Create Promo Code
          </button>
        </form>
      </div>
    </div>
  );
}