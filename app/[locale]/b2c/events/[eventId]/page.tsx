import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useClerk } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import Link from "next/link";
import EventCard from "../../../components/EventCard";

export default function EventDetailsPage({ params }: { params: { eventId: string } }) {
  const t = useTranslations("EventDetailsPage");
  const { user } = useClerk();
  const userData = useQuery(api.functions.getUser, { clerkId: user?.id }) || null;
  const event = useQuery(api.functions.getEvent, { eventId: params.eventId });
  const reviews = useQuery(api.functions.getEventReviews, { eventId: params.eventId }) || [];
  const calendarLinks = useQuery(api.functions.generateCalendarLink, { eventId: params.eventId });
  const submitReview = useMutation(api.functions.submitReview);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [responseForm, setResponseForm] = useState({ reviewId: "", comment: "" });
  const [error, setError] = useState("");

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) {
      setError(t("loginRequired") || "Please log in to submit a review");
      return;
    }
    try {
      await submitReview({
        userId: userData._id,
        eventId: params.eventId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setReviewForm({ rating: 0, comment: "" });
      setError("");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent, reviewId: string) => {
    e.preventDefault();
    if (!userData || userData.role !== "organizer") {
      setError(t("organizerRequired") || "Only organizers can respond to reviews");
      return;
    }
    try {
      await submitResponse({
        reviewId,
        organizerId: userData._id,
        comment: responseForm.comment,
      });
      setResponseForm({ reviewId: "", comment: "" });
      setError("");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDownloadIcs = () => {
    if (!calendarLinks) return;
    const blob = new Blob([calendarLinks.icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = calendarLinks.icsFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!event || !calendarLinks) return <div>{t("loading") || "Loading..."}</div>;

  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "No reviews";

  return (
    <div className="min-h-screen bg-gray-100 py-8" aria-labelledby="event-details-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EventCard event={{ id: event._id, ...event }} />
        <div className="mt-4 flex gap-4">
          <a
            href={calendarLinks.googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600"
            aria-label={t("addToGoogleCalendar") || "Add to Google Calendar"}
          >
            {t("addToGoogleCalendar") || "Add to Google Calendar"}
          </a>
          <button
            onClick={handleDownloadIcs}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label={t("downloadIcs") || "Download iCal"}
          >
            {t("downloadIcs") || "Download iCal"}
          </button>
        </div>
        <div className="mt-8">
          <h2 id="event-details-heading" className="text-2xl font-bold text-gray-800 mb-4">
            {t("reviews") || "Reviews"} ({averageRating} {t("stars") || "stars"})
          </h2>
          {reviews.length > 0 ? (
            <ul className="space-y-4">
              {reviews.map((review) => (
                <li key={review.id} className="bg-white p-4 rounded-lg shadow-md">
                  <p className="text-gray-800 font-semibold">{review.userName}</p>
                  <p className="text-gray-600">Rating: {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
                  <p className="text-gray-600">{review.comment}</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                  {userData?.role === "organizer" && event.organizerId === userData._id && (
                    <form
                      onSubmit={(e) => handleSubmitResponse(e, review.id)}
                      className="mt-4"
                    >
                      <textarea
                        value={responseForm.reviewId === review.id ? responseForm.comment : ""}
                        onChange={(e) =>
                          setResponseForm({ reviewId: review.id, comment: e.target.value })
                        }
                        className="p-2 border rounded w-full"
                        rows={3}
                        placeholder={t("responsePlaceholder") || "Enter your response..."}
                        aria-label={t("responsePlaceholder") || "Enter your response"}
                      />
                      <button
                        type="submit"
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        aria-label={t("submitResponse") || "Submit Response"}
                      >
                        {t("submitResponse") || "Submit Response"}
                      </button>
                    </form>
                  )}
                  {(useQuery(api.functions.getResponse, { reviewId: review.id }) || []).map((response) => (
                    <div key={response.id} className="mt-2 pl-4 border-l-4 border-blue-600">
                      <p className="text-gray-800 font-semibold">{t("organizerResponse") || "Organizer Response"}:</p>
                      <p className="text-gray-600">{response.comment}</p>
                      <p className="text-gray-500 text-sm">
                        {new Date(response.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">{t("noReviews") || "No reviews yet. Be the first to review!"}</p>
          )}
          {userData && (
            <form onSubmit={handleSubmitReview} className="mt-6 bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                {t("submitReview") || "Submit a Review"}
              </h3>
              <div className="mb-4">
                <label htmlFor="rating" className="block text-gray-700 mb-2">
                  {t("rating") || "Rating"}
                </label>
                <select
                  id="rating"
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  className="p-2 border rounded"
                  required
                  aria-label={t("rating") || "Select rating"}
                >
                  <option value="0">{t("selectRating") || "Select a rating"}</option>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <option key={r} value={r}>
                      {r} {t("stars") || "stars"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="comment" className="block text-gray-700 mb-2">
                  {t("comment") || "Comment"}
                </label>
                <textarea
                  id="comment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="p-2 border rounded w-full"
                  rows={4}
                  required
                  aria-label={t("comment") || "Enter your review"}
                />
              </div>
              {error && (
                <p className="text-red-600 mb-4" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                aria-label={t("submitReview") || "Submit Review"}
              >
                {t("submit") || "Submit"}
              </button>
            </form>
          )}
          <div className="mt-4">
            <Link href={`/b2c/checkout/${event._id}`}>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                aria-label={t("buyTickets") || "Buy Tickets"}
              >
                {t("buyTickets") || "Buy Tickets"}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}