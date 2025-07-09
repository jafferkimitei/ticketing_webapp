import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Container, Head, Heading, Html, Text } from "@react-email/components";
export default function RefundProcessed({ name, eventName, amount }) {
    return (_jsxs(Html, { children: [_jsx(Head, {}), _jsxs(Container, { className: "max-w-2xl mx-auto p-4 bg-gray-100", children: [_jsxs(Heading, { className: "text-2xl font-bold text-green-600", children: ["\uD83D\uDCB8 Refund Processed for ", eventName] }), _jsxs(Text, { className: "text-gray-700 mt-4", children: ["Hi ", name, ", your refund of KSH ", amount, " for ", eventName, " has been processed to your M-Pesa account. Expect funds within 5-7 business days."] }), _jsx(Button, { href: `${process.env.NEXT_PUBLIC_DOMAIN}/b2c/my-tickets`, className: "mt-4 bg-blue-600 text-white px-4 py-2 rounded", children: "View Tickets" })] })] }));
}
