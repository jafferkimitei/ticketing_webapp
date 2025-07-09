import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useClerk } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

export default function FeedbackPage() {
  const t = useTranslations("FeedbackPage");
  const { user } = useClerk();
  const submitFeedback = useMutation(api.functions.submitFeedback);
  const [formData, setFormData] = useState({ subject: "", message: "", category: "general" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError(t("loginRequired") || "Please log in to submit feedback");
      return;
    }
    try {
      await submitFeedback({
        userId: user.id,
        subject: formData.subject,
        message: formData.message,
        category: formData.category,
      });
      setFormData({ subject: "", message: "", category: "general" });
      setError("");
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8" aria-labelledby="feedback-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 id="feedback-heading" className="text-3xl font-bold text-gray-800 mb-8">
          {t("title") || "Submit Feedback"}
        </h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <label htmlFor="category" className="block text-gray-700 mb-2">
              {t("category") || "Category"}
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border rounded"
              aria-label={t("category") || "Select feedback category"}
            >
              <option value="general">{t("general") || "General"}</option>
              <option value="bug">{t("bug") || "Bug Report"}</option>
              <option value="feature">{t("feature") || "Feature Request"}</option>
              <option value="event">{t("event") || "Event Issue"}</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="subject" className="block text-gray-700 mb-2">
              {t("subject") || "Subject"}
            </label>
            <input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full p-2 border rounded"
              required
              aria-label={t("subject") || "Enter feedback subject"}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block text-gray-700 mb-2">
              {t("message") || "Message"}
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full p-2 border rounded"
              rows={6}
              required
              aria-label={t("message") || "Enter your feedback"}
            />
          </div>
          {error && (
            <p className="text-red-600 mb-4" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-600 mb-4" role="alert">
              {t("success") || "Feedback submitted successfully!"}
            </p>
          )}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label={t("submit") || "Submit Feedback"}
          >
            {t("submit") || "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}