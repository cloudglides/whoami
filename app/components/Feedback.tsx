"use client";

import { useState } from "react";

export default function Feedback() {
  const [submitted, setSubmitted] = useState(false);

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
        <div className="mt-2 flex gap-3">
          <button
            onClick={() => setSubmitted(true)}
            className="govuk-button govuk-button--small"
          >
            Yes
          </button>
          <button
            onClick={() => setSubmitted(true)}
            className="govuk-button govuk-button--secondary govuk-button--small"
          >
            No
          </button>
        </div>
      )}
    </div>
  );
}
