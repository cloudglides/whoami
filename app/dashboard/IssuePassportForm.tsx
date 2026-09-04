"use client";

import { useActionState } from "react";
import { issuePassportAction } from "../actions/org";

export default function IssuePassportForm() {
  const [state, formAction, pending] = useActionState(issuePassportAction, undefined);

  return (
    <form action={formAction} className="mt-4 space-y-6" noValidate>
      <div>
        <label htmlFor="recipientName" className="mb-2 block font-bold">
          Participant name
        </label>
        <p className="mb-2 text-sm text-govuk-grey-4">
          The name to print on the PASSPORT/ID.
        </p>
        <input
          id="recipientName"
          name="recipientName"
          type="text"
          required
          className="w-full max-w-xl border-2 border-govuk-black px-3 py-2 text-base"
        />
      </div>

      <div>
        <label htmlFor="recipientEmail" className="mb-2 block font-bold">
          Their email{" "}
          <span className="font-normal text-govuk-grey-4">(optional)</span>
        </label>
        <p className="mb-2 text-sm text-govuk-grey-4">
          If they have an account here, we will link the passport to them.
          Leave blank if they don&apos;t have an account yet.
        </p>
        <input
          id="recipientEmail"
          name="recipientEmail"
          type="text"
          className="w-full max-w-xl border-2 border-govuk-black px-3 py-2 text-base"
        />
      </div>

      <div>
        <label htmlFor="note" className="mb-2 block font-bold">
          Note{" "}
          <span className="font-normal text-govuk-grey-4">(optional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={2}
          placeholder="Anything we should know for this passport"
          className="w-full max-w-xl border-2 border-govuk-black px-3 py-2 text-base"
        />
      </div>

      {state?.error && (
        <p role="alert" className="border-l-4 border-hc-red px-3 py-2 font-semibold">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="border-l-4 border-govuk-green px-3 py-2 font-semibold">
          {state.ok}
        </p>
      )}

      <button type="submit" disabled={pending} className="govuk-button">
        {pending ? "Issuing..." : "Issue passport"}
      </button>
    </form>
  );
}
