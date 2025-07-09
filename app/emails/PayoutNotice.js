import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Container, Head, Heading, Html, Text } from "@react-email/components";
export default function PayoutNotice({ name, eventName, amount }) {
    return (_jsxs(Html, { children: [_jsx(Head, {}), _jsxs(Container, { className: "max-w-2xl mx-auto p-4 bg-gray-100", children: [_jsxs(Heading, { className: "text-2xl font-bold text-green-600", children: ["\u2705 Payout Complete for ", eventName] }), _jsxs(Text, { className: "text-gray-700 mt-4", children: ["Hi ", name, ", your payout of KSH ", amount, " for ", eventName, " has been sent to your M-Pesa account. Funds should arrive within 1-2 business days."] }), _jsx(Button, { href: `${process.env.NEXT_PUBLIC_DOMAIN}/b2b/organizer/payouts`, className: "mt-4 bg-blue-600 text-white px-4 py-2 rounded", children: "View Payouts" })] })] }));
}
