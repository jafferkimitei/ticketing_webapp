import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Container, Head, Heading, Html, Text } from "@react-email/components";
export default function WelcomeOrganizer({ name }) {
    return (_jsxs(Html, { children: [_jsx(Head, {}), _jsxs(Container, { className: "max-w-2xl mx-auto p-4 bg-gray-100", children: [_jsxs(Heading, { className: "text-2xl font-bold text-blue-600", children: ["\uD83D\uDE80 Welcome Organizer, ", name, "!"] }), _jsx(Text, { className: "text-gray-700 mt-4", children: "Create, promote, and sell tickets effortlessly. Your organizer dashboard is live. We\u2019ll handle payments, refunds, and QR delivery. You focus on the show." }), _jsx(Button, { href: `${process.env.NEXT_PUBLIC_DOMAIN}/b2b/organizer/dashboard`, className: "mt-4 bg-blue-600 text-white px-4 py-2 rounded", children: "Go to Dashboard" })] })] }));
}
