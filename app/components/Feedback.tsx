"use client";

import { useState } from "react";

export default function Feedback() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFeedback(useful: boolean) {
    if (submitted || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useful, page: window.location.pathname }),
      });

      if (res.status === 409) {
        setError("You've already submitted feedback for this page.");
        return;
      }

      if (!res.ok) throw new Error("Failed to submit");

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="govuk-feedback">
      <p className="text-base font-bold text-govuk-black">
        Is this page useful?
      </p>
      {submitted ? (
        <p className="mt-2 text-sm text-govuk-grey-4">
          Thank you for your feedback.
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-3">
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => handleFeedback(true)}
              disabled={loading}
              className="govuk-button govuk-button--small"
            >
              {loading ? "Sending..." : "Yes"}
            </button>
            <button
              onClick={() => handleFeedback(false)}
              disabled={loading}
              className="govuk-button govuk-button--secondary govuk-button--small"
            >
              {loading ? "Sending..." : "No"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}