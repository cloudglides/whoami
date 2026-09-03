"use client";

import { useActionState } from "react";
import { createOrderAction } from "../actions/org";

export default function OrderForm({ orgId }: { orgId: string }) {
  const [state, formAction, pending] = useActionState(createOrderAction, undefined);

  return (
    <form action={formAction} className="mt-6 space-y-6" noValidate>
      <input type="hidden" name="orgId" value={orgId} />

      <div>
        <label htmlFor="quantity" className="mb-2 block font-bold">
          How many passports?
        </label>
        <p className="mb-2 text-sm text-govuk-grey-4">
          Order enough to hand out at your event. We will print and ship them to
          you.
        </p>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          max={1000}
          required
          className="w-full max-w-xs border-2 border-govuk-black px-3 py-2 text-base"
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
          placeholder="Shipping address, dates, anything we should know"
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
          Order placed. We will be in touch.
        </p>
      )}

      <button type="submit" disabled={pending} className="govuk-button">
        {pending ? "Placing..." : "Place order"}
      </button>
    </form>
  );
}
