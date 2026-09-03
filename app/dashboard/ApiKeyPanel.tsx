"use client";

import { useActionState, useState } from "react";
import { regenerateApiKeyAction } from "../actions/org";

export default function ApiKeyPanel({ orgId, apiKey }: { orgId: string; apiKey: string | null }) {
  const [revealed, setRevealed] = useState(false);
  const [state, formAction, pending] = useActionState(
    regenerateApiKeyAction,
    undefined
  );

  const shown = apiKey ? (revealed ? apiKey : "wom_".concat("•".repeat(24))) : "";

  async function copy() {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
    } catch {
      // Clipboard API can be unavailable in non-secure contexts.
    }
  }

  const curl = `curl -X POST https://<your-domain>/api/orders \\
  -H "Authorization: Bearer ${apiKey ?? "<your-api-key>"}" \\
  -H "Content-Type: application/json" \\
  -d '{"quantity": 50, "note": "Spring event"}'`;

  const script = `// On your YSWS shop, when someone checks out:
const key = "${apiKey ?? "<your-api-key>"}";

const res = await fetch("https://<your-domain>/api/orders", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${key}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ quantity: 1, note: "Shop order" })
});
const json = await res.json();
console.log(json.order); // the created PASSPORT order`;

  const [tab, setTab] = useState<"curl" | "js">("curl");

  return (
    <div className="mt-6 border-2 border-govuk-black bg-govuk-grey-1 p-5">
      <h3 className="mb-2 text-lg font-bold">API key</h3>
      <p className="mb-3 text-sm text-govuk-grey-4">
        Order passports from your YSWS shop website. Keep this secret.
      </p>

      <div className="mb-3 flex max-w-xl items-center gap-2">
        <code className="flex-1 break-all border-2 border-govuk-black bg-govuk-white px-3 py-2 text-sm">
          {shown || "No key yet — generate one below."}
        </code>
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          disabled={!apiKey}
          className="govuk-button govuk-button--secondary"
        >
          {revealed ? "Hide" : "Reveal"}
        </button>
        <button
          type="button"
          onClick={copy}
          disabled={!apiKey}
          className="govuk-button govuk-button--secondary"
        >
          Copy
        </button>
      </div>

      <details className="mb-4">
        <summary className="cursor-pointer font-bold">Order from your shop</summary>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setTab("curl")}
            className={tab === "curl" ? "govuk-button govuk-button--secondary" : "govuk-button govuk-button--secondary govuk-button--inactive"}
          >
            curl
          </button>
          <button
            type="button"
            onClick={() => setTab("js")}
            className={tab === "js" ? "govuk-button govuk-button--secondary" : "govuk-button govuk-button--secondary govuk-button--inactive"}
          >
            Website (JS)
          </button>
        </div>
        <pre className="mt-3 overflow-x-auto border-2 border-govuk-black bg-govuk-black p-3 text-sm text-govuk-white">
          {tab === "curl" ? curl : script}
        </pre>
        <p className="mt-2 text-sm text-govuk-grey-4">
          You can also pass the key as an{" "}
          <code className="border border-govuk-grey-3 px-1">x-api-key</code> header.
        </p>
      </details>

      <form action={formAction} className="mt-2">
        <input type="hidden" name="orgId" value={orgId} />
        {state?.error && (
          <p role="alert" className="mb-2 border-l-4 border-hc-red px-3 py-2 font-semibold">
            {state.error}
          </p>
        )}
        {state?.ok && (
          <p className="mb-2 border-l-4 border-govuk-green px-3 py-2 font-semibold">
            API key regenerated. Your old key no longer works.
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="govuk-button govuk-button--secondary"
        >
          {pending ? "Regenerating..." : "Regenerate key"}
        </button>
      </form>
    </div>
  );
}
