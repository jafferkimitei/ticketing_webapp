import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Container, Head, Heading, Html, Img, Text } from "@react-email/components";
export default function TicketConfirmation({ name, eventName, ticketType, qrCode }) {
    return (_jsxs(Html, { children: [_jsx(Head, {}), _jsxs(Container, { className: "max-w-2xl mx-auto p-4 bg-gray-100", children: [_jsxs(Heading, { className: "text-2xl font-bold text-blue-600", children: ["\uD83C\uDFAB Your Ticket for ", eventName] }), _jsxs(Text, { className: "text-gray-700 mt-4", children: ["Hi ", name, ", your ticket for ", eventName, " (", ticketType, ") is ready! Present the QR code below at the event."] }), _jsx(Img, { src: qrCode, alt: "Ticket QR Code", className: "mt-4 mx-auto", width: "150", height: "150" }), _jsx(Button, { href: `${process.env.NEXT_PUBLIC_DOMAIN}/b2c/my-tickets`, className: "mt-4 bg-blue-600 text-white px-4 py-2 rounded", children: "View My Tickets" })] })] }));
}
