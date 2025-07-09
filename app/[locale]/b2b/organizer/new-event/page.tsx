import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api"; 
import { useClerk } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
  const t = useTranslations("CreateEventPage");
  const { user } = useClerk();
  const userData = useQuery(api.functions.getUser, { clerkId: user?.id }) || null;
  const createEvent = useMutation(api.functions.createEvent);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    category: "",
    ticketTypes: [{ type: "", price: 0, quantity: 0 }],
    surgeSettings: {
      disabled: false,
      velocityThreshold: 10,
      velocitySurge: 20,
      availabilityThreshold: 20,
      availabilitySurge: 30,
    },
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || userData.role !== "organizer") {
      setError(t("unauthorized") || "Unauthorized");
      return;
    }
    try {
      await createEvent({
        ...formData,
        organizerId: userData._id,
        createdAt: new Date().toISOString(),
      });
      router.push("/b2b/organizer/dashboard");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const addTicketType = () => {
    setFormData({
      ...formData,
      ticketTypes: [...formData.ticketTypes, { type: "", price: 0, quantity: 0 }],
    });
  };

  if (!userData || userData.role !== "organizer") return <div>{t("unauthorized") || "Unauthorized"}</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8" aria-labelledby="create-event-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 id="create-event-heading" className="text-3xl font-bold text-gray-800 mb-8">
          {t("title") || "Create Event"}
        </h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 mb-2">
              {t("name") || "Event Name"}
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="p-2 border rounded w-full"
              required
              aria-label={t("name") || "Event Name"}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 mb-2">
              {t("description") || "Description"}
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="p-2 border rounded w-full"
              rows={4}
              required
              aria-label={t("description") || "Description"}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="date" className="block text-gray-700 mb-2">
              {t("date") || "Date"}
            </label>
            <input
              id="date"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="p-2 border rounded w-full"
              required
              aria-label={t("date") || "Date"}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="location" className="block text-gray-700 mb-2">
              {t("location") || "Location"}
            </label>
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="p-2 border rounded w-full"
              required
              aria-label={t("location") || "Location"}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="category" className="block text-gray-700 mb-2">
              {t("category") || "Category"}
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="p-2 border rounded w-full"
              required
              aria-label={t("category") || "Category"}
            >
              <option value="">{t("selectCategory") || "Select a category"}</option>
              <option value="concert">{t("concert") || "Concert"}</option>
              <option value="conference">{t("conference") || "Conference"}</option>
              <option value="workshop">{t("workshop") || "Workshop"}</option>
            </select>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {t("ticketTypes") || "Ticket Types"}
            </h2>
            {formData.ticketTypes.map((ticket, index) => (
              <div key={index} className="flex gap-4 mb-2">
                <input
                  type="text"
                  value={ticket.type}
                  onChange={(e) => {
                    const newTicketTypes = [...formData.ticketTypes];
                    newTicketTypes[index].type = e.target.value;
                    setFormData({ ...formData, ticketTypes: newTicketTypes });
                  }}
                  placeholder={t("ticketType") || "Ticket Type"}
                  className="p-2 border rounded"
                  required
                  aria-label={t("ticketType") || "Ticket Type"}
                />
                <input
                  type="number"
                  value={ticket.price}
                  onChange={(e) => {
                    const newTicketTypes = [...formData.ticketTypes];
                    newTicketTypes[index].price = Number(e.target.value);
                    setFormData({ ...formData, ticketTypes: newTicketTypes });
                  }}
                  placeholder={t("price") || "Price"}
                  className="p-2 border rounded"
                  required
                  aria-label={t("price") || "Price"}
                />
                <input
                  type="number"
                  value={ticket.quantity}
                  onChange={(e) => {
                    const newTicketTypes = [...formData.ticketTypes];
                    newTicketTypes[index].quantity = Number(e.target.value);
                    newTicketTypes[index].available = Number(e.target.value);
                    setFormData({ ...formData, ticketTypes: newTicketTypes });
                  }}
                  placeholder={t("quantity") || "Quantity"}
                  className="p-2 border rounded"
                  required
                  aria-label={t("quantity") || "Quantity"}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addTicketType}
              className="mt-2 text-blue-600 hover:underline"
              aria-label={t("addTicketType") || "Add another ticket type"}
            >
              {t("addTicketType") || "Add another ticket type"}
            </button>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {t("surgeSettings") || "Surge Pricing Settings"}
            </h2>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={formData.surgeSettings.disabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    surgeSettings: { ...formData.surgeSettings, disabled: e.target.checked },
                  })
                }
                className="h-5 w-5 text-blue-600"
                aria-label={t("disableSurge") || "Disable surge pricing"}
              />
              <span className="ml-2 text-gray-700">{t("disableSurge") || "Disable surge pricing"}</span>
            </label>
            {!formData.surgeSettings.disabled && (
              <>
                <div className="mb-2">
                  <label htmlFor="velocityThreshold" className="block text-gray-700 mb-1">
                    {t("velocityThreshold") || "Velocity Threshold (tickets/hour)"}
                  </label>
                  <input
                    id="velocityThreshold"
                    type="number"
                    value={formData.surgeSettings.velocityThreshold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        surgeSettings: {
                          ...formData.surgeSettings,
                          velocityThreshold: Number(e.target.value),
                        },
                      })
                    }
                    className="p-2 border rounded w-full"
                    required
                    aria-label={t("velocityThreshold") || "Velocity Threshold"}
                  />
                </div>
                <div className="mb-2">
                  <label htmlFor="velocitySurge" className="block text-gray-700 mb-1">
                    {t("velocitySurge") || "Velocity Surge (% increase)"}
                  </label>
                  <input
                    id="velocitySurge"
                    type="number"
                    value={formData.surgeSettings.velocitySurge}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        surgeSettings: {
                          ...formData.surgeSettings,
                          velocitySurge: Number(e.target.value),
                        },
                      })
                    }
                    className="p-2 border rounded w-full"
                    required
                    aria-label={t("velocitySurge") || "Velocity Surge"}
                  />
                </div>
                <div className="mb-2">
                  <label htmlFor="availabilityThreshold" className="block text-gray-700 mb-1">
                    {t("availabilityThreshold") || "Availability Threshold (% remaining)"}
                  </label>
                  <input
                    id="availabilityThreshold"
                    type="number"
                    value={formData.surgeSettings.availabilityThreshold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        surgeSettings: {
                          ...formData.surgeSettings,
                          availabilityThreshold: Number(e.target.value),
                        },
                      })
                    }
                    className="p-2 border rounded w-full"
                    required
                    aria-label={t("availabilityThreshold") || "Availability Threshold"}
                  />
                </div>
                <div className="mb-2">
                  <label htmlFor="availabilitySurge" className="block text-gray-700 mb-1">
                    {t("availabilitySurge") || "Availability Surge (% increase)"}
                  </label>
                  <input
                    id="availabilitySurge"
                    type="number"
                    value={formData.surgeSettings.availabilitySurge}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        surgeSettings: {
                          ...formData.surgeSettings,
                          availabilitySurge: Number(e.target.value),
                        },
                      })
                    }
                    className="p-2 border rounded w-full"
                    required
                    aria-label={t("availabilitySurge") || "Availability Surge"}
                  />
                </div>
              </>
            )}
          </div>
          {error && (
            <p className="text-red-600 mb-4" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label={t("createEvent") || "Create Event"}
          >
            {t("createEvent") || "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}