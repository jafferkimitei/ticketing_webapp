import Link from "next/link";

interface EventCardProps {
  event: {
    id: string;
    name: string;
    description: string;
    date: string;
    location: string;
    ticketTypes: { type: string; price: number; available: number }[];
  };
}

export default function EventCard({ event }: EventCardProps) {
  const shareUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/b2c/events/${event.id}`;
  const shareText = `Check out ${event.name} on ${new Date(event.date).toLocaleDateString()} at ${event.location}!`;

  const shareLinks = {
    twitter: `https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
  };

  return (
    <article
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
      aria-labelledby={`event-${event.id}-title`}
    >
      <h2 id={`event-${event.id}-title`} className="text-xl font-semibold text-gray-800 mb-2">
        {event.name}
      </h2>
      <p className="text-gray-600 mb-4">{event.description}</p>
      <p className="text-gray-600 mb-2">Date: {new Date(event.date).toLocaleDateString()}</p>
      <p className="text-gray-600 mb-4">Location: {event.location}</p>
      <div className="mb-4">
        {event.ticketTypes.map((ticket) => (
          <p key={ticket.type} className="text-gray-600">
            {ticket.type}: KSH {ticket.price} ({ticket.available} available)
          </p>
        ))}
      </div>
      <div className="flex gap-4 mb-4">
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
          aria-label={`Share ${event.name} on Twitter/X`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:text-green-800"
          aria-label={`Share ${event.name} on WhatsApp`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.074-.149-.669-.669-.916-.919-.247-.25-.446-.447-.644-.645-.197-.198-.099-.348.05-.497.149-.149.676-.668 1.02-1.015.344-.347.694-.297 1.041-.198.347.099 1.086.645 1.283.943.198.297.297.645.297.992 0 .348-.099.694-.297.992-.198.297-.496.595-.793.892zM12 4.5C7.305 4.5 3.5 8.305 3.5 13s3.305 8.5 8.5 8.5 8.5-3.305 8.5-8.5S16.695 4.5 12 4.5zm0 15.25c-3.866 0-7-3.134-7-7s3.134-7 7-7 7 3.134 7 7-3.134 7-7 7z" />
          </svg>
        </a>
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-800 hover:text-blue-900"
          aria-label={`Share ${event.name} on Facebook`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
          </svg>
        </a>
      </div>
      <Link href={`/b2c/checkout/${event.id}`}>
        <button
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          aria-label={`Buy tickets for ${event.name}`}
        >
          Buy Tickets
        </button>
      </Link>
    </article>
  );
}