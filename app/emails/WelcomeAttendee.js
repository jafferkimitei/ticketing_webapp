import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Container, Head, Heading, Html, Text } from "@react-email/components";
export default function WelcomeAttendee({ name }) {
    return (_jsxs(Html, { children: [_jsx(Head, {}), _jsxs(Container, { className: "max-w-2xl mx-auto p-4 bg-gray-100", children: [_jsxs(Heading, { className: "text-2xl font-bold text-blue-600", children: ["\uD83C\uDF9F\uFE0F Welcome to [Brand Name], ", name, "!"] }), _jsx(Text, { className: "text-gray-700 mt-4", children: "You\u2019re now part of an event-loving community. Browse events, book your tickets, and manage them all from your profile. Let\u2019s make memories!" }), _jsx(Button, { href: `${process.env.NEXT_PUBLIC_DOMAIN}/b2c/events`, className: "mt-4 bg-blue-600 text-white px-4 py-2 rounded", children: "Browse Events" })] })] }));
}
