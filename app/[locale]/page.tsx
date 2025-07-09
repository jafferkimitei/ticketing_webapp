/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import EventCard from "./components/EventCard";
import { useClerk } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "./components/LocaleSwitcher";

export default function Home() {
  const t = useTranslations("Home");
  const { user } = useClerk();
  const userData = useQuery(api.functions.getUser, { clerkId: user?.id }) || null;
  const featuredEvents = useQuery(api.functions.getEventsWithFilters, {
    location: "",
    date: "",
    category: "",
    skip: 0,
    limit: 3,
  }) || { events: [], total: 0 };
  const recommendedEvents = useQuery(
    api.functions.getRecommendedEvents,
    userData ? { userId: userData._id, limit: 3 } : "skip"
  ) || { events: [] };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Language Switcher */}
      <div className="fixed top-4 right-4">
        <LocaleSwitcher />
      </div>

      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20" aria-labelledby="hero-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 id="hero-heading" className="text-4xl sm:text-5xl font-bold mb-4">{t("heroHeading")}</h1>
          <p className="text-lg sm:text-xl mb-8">{t("heroText")}</p>
          <Link href="/b2c/events">
            <button
              className="bg-white text-blue-600 px-6 py-3 rounded-full font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label={t("browseEvents")}
            >
              {t("browseEvents")}
            </button>
          </Link>
          {user && (
            <Link href="/b2c/preferences" className="ml-4">
              <button
                className="bg-white text-blue-600 px-6 py-3 rounded-full font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label={t("updatePreferences")}
              >
                {t("updatePreferences")}
              </button>
            </Link>
          )}
        </div>
      </section>

      {/* Recommended Events */}
      {userData && recommendedEvents.events.length > 0 && (
        <section className="py-12" aria-labelledby="recommended-events-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="recommended-events-heading" className="text-3xl font-bold text-gray-800 mb-8 text-center">
              {t("recommendedEvents")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedEvents.events.map((event: { _id: string; [key: string]: any }) => (
                <EventCard key={event._id} event={{
                  id: event._id,
                  name: event.name || "",
                  description: event.description || "",
                  date: event.date || "",
                  location: event.location || "",
                  ticketTypes: event.ticketTypes || []
                }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Events */}
      <section className="py-12" aria-labelledby="featured-events-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="featured-events-heading" className="text-3xl font-bold text-gray-800 mb-8 text-center">
            {t("featuredEvents")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.events.map((event: { _id: string; [key: string]: any }) => (
              <EventCard key={event._id} event={{
                id: event._id,
                name: event.name || "",
                description: event.description || "",
                date: event.date || "",
                location: event.location || "",
                ticketTypes: event.ticketTypes || []
              }} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/b2c/events">
              <button
                className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                aria-label={t("viewAllEvents")}
              >
                {t("viewAllEvents")}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-200 py-12" aria-labelledby="organizer-cta-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="organizer-cta-heading" className="text-2xl font-semibold text-gray-800 mb-4">
            {t("organizerCtaHeading")}
          </h2>
          <p className="text-gray-600 mb-6">{t("organizerCtaText")}</p>
          <Link href="/b2c/register">
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label={t("becomeOrganizer")}
            >
              {t("becomeOrganizer")}
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}