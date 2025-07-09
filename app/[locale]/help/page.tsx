import { useTranslations } from "next-intl";
import Link from "next/link";

export default function HelpPage() {
  const t = useTranslations("HelpPage");

  return (
    <div className="min-h-screen bg-gray-100 py-8" aria-labelledby="help-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 id="help-heading" className="text-3xl font-bold text-gray-800 mb-8">
          {t("title") || "Help Center"}
        </h1>
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              {t("eventReviews.title") || "Submitting Event Reviews"}
            </h2>
            <p className="text-gray-600">{t("eventReviews.description") || "After attending an event, you can share your experience by submitting a review. Here's how:"}</p>
            <ol className="list-decimal ml-6 mt-2 text-gray-600">
              <li>{t("eventReviews.step1") || "Purchase a ticket and attend the event."}</li>
              <li>{t("eventReviews.step2") || "Go to the event page at /b2c/events/[eventId]."}</li>
              <li>{t("eventReviews.step3") || "Find the review section, select a rating (1–5 stars), and write your comment."}</li>
              <li>{t("eventReviews.step4") || "Submit your review. It will appear on the event page after moderation."}</li>
            </ol>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              {t("calendarIntegration.title") || "Adding Events to Your Calendar"}
            </h2>
            <p className="text-gray-600">{t("calendarIntegration.description") || "Add events to Google Calendar or download an iCal file to stay organized:"}</p>
            <ol className="list-decimal ml-6 mt-2 text-gray-600">
              <li>{t("calendarIntegration.step1") || "Visit the event page at /b2c/events/[eventId]."}</li>
              <li>{t("calendarIntegration.step2") || "Click 'Add to Google Calendar' to open Google Calendar with pre-filled event details."}</li>
              <li>{t("calendarIntegration.step3") || "Alternatively, click 'Download iCal' to save a .ics file for other calendar apps like Outlook or Apple Calendar."}</li>
            </ol>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              {t("surgePricing.title") || "Understanding Surge Pricing"}
            </h2>
            <p className="text-gray-600">{t("surgePricing.description") || "Ticket prices may increase based on demand or limited availability:"}</p>
            <ul className="list-disc ml-6 mt-2 text-gray-600">
              <li>{t("surgePricing.point1") || "High demand (e.g., many tickets sold quickly) may add a 20% price increase."}</li>
              <li>{t("surgePricing.point2") || "Low availability (less than 20% tickets remaining) may add a 30% price increase."}</li>
              <li>{t("surgePricing.point3") || "Check the checkout page for current prices, marked with '(Surge Pricing Applied)' when applicable."}</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              {t("bulkRefunds.title") || "Managing Bulk Ticket Refunds (Organizers)"}
            </h2>
            <p className="text-gray-600">{t("bulkRefunds.description") || "Organizers can refund multiple tickets at once:"}</p>
            <ol className="list-decimal ml-6 mt-2 text-gray-600">
              <li>{t("bulkRefunds.step1") || "Go to /b2b/organizer/tickets in the organizer dashboard."}</li>
              <li>{t("bulkRefunds.step2") || "Select an event and view its tickets."}</li>
              <li>{t("bulkRefunds.step3") || "Check the boxes next to tickets you want to refund."}</li>
              <li>{t("bulkRefunds.step4") || "Click 'Refund Selected Tickets' to process refunds via M-Pesa."}</li>
              <li>{t("bulkRefunds.step5") || "Waitlist users will be notified if tickets become available."}</li>
            </ol>
          </section>
          <p className="text-gray-600 mt-4">
            {t("contactSupport") || "Need more help?"} <Link href="/b2c/feedback" className="text-blue-600 hover:underline">{t("submitFeedback") || "Submit feedback"}</Link> {t("orEmail") || "or email us at support@yourdomain.com."}
          </p>
        </div>
      </div>
    </div>
  );
}