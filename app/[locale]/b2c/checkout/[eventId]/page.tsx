import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useClerk } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function CheckoutPage({ params }: { params: { eventId: string } }) {
  const t = useTranslations("CheckoutPage");
  const { user } = useClerk();
  const userData = useQuery(api.functions.getUser, { clerkId: user?.id }) || null;
  const event = useQuery(api.functions.getEvents, { eventId: params.eventId });
  const purchaseTickets = useMutation(api.functions.purchaseTicket);
  const joinWaitlist = useMutation(api.functions.joinWaitlist);
  const applyPromoCode = useMutation(api.functions.applyPromoCode);
  const [selectedTickets, setSelectedTickets] = useState<{ [key: string]: number }>({});
  const [phoneNumber, setPhoneNumber] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) {
      setError(t("loginRequired") || "Please log in to proceed");
      return;
    }
    if (!phoneNumber.match(/^\+254\d{9}$/)) {
      setError(t("invalidPhone") || "Invalid phone number. Please enter a valid number (e.g., +254700123456)");
      return;
    }
    if (Object.values(selectedTickets).every((qty) => qty === 0)) {
      setError(t("selectTickets") || "Please select at least one ticket");
      return;
    }
    try {
      await purchaseTickets({
        eventId: params.eventId,
        userId: userData._id,
        tickets: Object.entries(selectedTickets).map(([type, quantity]) => ({ type, quantity })),
        phoneNumber,
        promoCode,
      });
      setSuccess(t("purchaseSuccess") || "Tickets purchased successfully!");
      setTimeout(() => router.push("/b2c/my-tickets"), 2000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleJoinWaitlist = async (ticketType: string) => {
    if (!userData) {
      setError(t("loginRequired") || "Please log in to proceed");
      return;
    }
    try {
      await joinWaitlist({
        eventId: params.eventId,
        userId: userData._id,
        ticketType,
      });
      setSuccess(t("waitlistSuccess", { ticketType }) || `Joined waitlist for ${ticketType}!`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleApplyPromo = async () => {
    try {
      const discount = await applyPromoCode({ eventId: params.eventId, code: promoCode });
      setSuccess(t("promoApplied", { discount }) || `Promo code applied: ${discount}% off`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (!event) return <div>{t("loading") || "Loading..."}</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8" aria-labelledby="checkout-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 id="checkout-heading" className="text-3xl font-bold text-gray-800 mb-8">
          {t("title", { eventName: event.name }) || `Checkout for ${event.name}`}
        </h1>
        <form onSubmit={handlePurchase} className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            {t("ticketTypes") || "Ticket Types"}
          </h2>
          {event.ticketTypes.map((ticket) => {
            const { price, surgeApplied } = useQuery(api.functions.getDynamicPrice, {
              eventId: params.eventId,
              ticketType: ticket.type,
            }) || { price: ticket.price, surgeApplied: false };
            return (
              <div key={ticket.type} className="mb-4 flex justify-between items-center">
                <div>
                  <p className="text-gray-800">
                    {ticket.type} - KSH {price.toFixed(2)} {surgeApplied && t("surgeApplied")}
                  </p>
                  <p className="text-gray-600">
                    {t("available") || "Available"}: {ticket.available}
                  </p>
                </div>
                {ticket.available > 0 ? (
                  <select
                    value={selectedTickets[ticket.type] || 0}
                    onChange={(e) =>
                      setSelectedTickets({
                        ...selectedTickets,
                        [ticket.type]: Number(e.target.value),
                      })
                    }
                    className="p-2 border rounded"
                    aria-label={t("selectQuantity") || `Select quantity for ${ticket.type}`}
                  >
                    <option value={0}>{t("selectQuantity") || "Select quantity"}</option>
                    {[...Array(Math.min(ticket.available, 10) + 1).keys()].map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleJoinWaitlist(ticket.type)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-600"
                    aria-label={t("joinWaitlist") || `Join waitlist for ${ticket.type}`}
                  >
                    {t("joinWaitlist") || "Join Waitlist"}
                  </button>
                )}
              </div>
            );
          })}
          <div className="mb-4">
            <label htmlFor="phoneNumber" className="block text-gray-700 mb-2">
              {t("phoneNumber") || "Phone Number"}
            </label>
            <input
              id="phoneNumber"
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={t("phonePlaceholder") || "e.g., +254700123456"}
              className="p-2 border rounded w-full"
              required
              aria-label={t("phoneNumber") || "Phone Number"}
            />
          </div>
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <label htmlFor="promoCode" className="block text-gray-700 mb-2">
                {t("promoCode") || "Promo Code"}
              </label>
              <input
                id="promoCode"
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder={t("promoPlaceholder") || "Enter promo code"}
                className="p-2 border rounded w-full"
                aria-label={t("promoCode") || "Promo Code"}
              />
            </div>
            <button
              type="button"
              onClick={handleApplyPromo}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 mt-6"
              aria-label={t("applyPromo") || "Apply Promo Code"}
            >
              {t("applyPromo") || "Apply"}
            </button>
          </div>
          <p className="text-gray-800 font-semibold mb-4">
            {t("totalPrice", {
              price: Object.entries(selectedTickets)
                .reduce((total, [type, qty]) => {
                  const ticket = event.ticketTypes.find((t) => t.type === type);
                  const { price } = useQuery(api.functions.getDynamicPrice, {
                    eventId: params.eventId,
                    ticketType: type,
                  }) || { price: ticket?.price || 0 };
                  return total + price * qty;
                }, 0)
                .toFixed(2),
            }) || `Total Price: KSH ${Object.entries(selectedTickets).reduce((total, [type, qty]) => total + (event.ticketTypes.find((t) => t.type === type)?.price || 0) * qty, 0).toFixed(2)}`}
          </p>
          {error && (
            <p className="text-red-600 mb-4" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-600 mb-4" role="alert">
              {success}
            </p>
          )}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label={t("purchase") || "Purchase Tickets"}
          >
            {t("purchase") || "Purchase Tickets"}
          </button>
        </form>
      </div>
    </div>
  );
}