"use client";

import { useActionState } from "react";
import { issuePassportAdminAction } from "../actions/admin";

export default function IssuePassportAdminForm({
  orgs,
}: {
  orgs: { id: string; name: string; slug: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    issuePassportAdminAction,
    undefined
  );

  return (
    <form action={formAction} className="mt-4 space-y-6" noValidate>
      <div>
        <label htmlFor="orgId" className="mb-2 block font-bold">
          Org
        </label>
        <select
          id="orgId"
          name="orgId"
          required
          className="w-full max-w-xl border-2 border-govuk-black px-3 py-2 text-base"
        >
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name} ({org.slug})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="recipientEmail" className="mb-2 block font-bold">
          Recipient email
        </label>
        <p className="mb-2 text-sm text-govuk-grey-4">
          If this matches a registered participant, the passport is connected to
          their account.
        </p>
        <input
          id="recipientEmail"
          name="recipientEmail"
          type="email"
          className="w-full max-w-xl border-2 border-govuk-black px-3 py-2 text-base"
        />
      </div>

      <div>
        <label htmlFor="recipientName" className="mb-2 block font-bold">
          Recipient name{" "}
          <span className="font-normal text-govuk-grey-4">(optional)</span>
        </label>
        <input
          id="recipientName"
          name="recipientName"
          type="text"
          className="w-full max-w-xl border-2 border-govuk-black px-3 py-2 text-base"
        />
      </div>

      <div>
        <label htmlFor="quantity" className="mb-2 block font-bold">
          Quantity
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          max={1000}
          defaultValue={1}
          required
          className="w-full max-w-xs border-2 border-govuk-black px-3 py-2 text-base"
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
        {pending ? "Placing..." : "Trigger passport order"}
      </button>
    </form>
  );
}
