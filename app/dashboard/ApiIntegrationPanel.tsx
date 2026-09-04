"use client";

import { useActionState, useState } from "react";
import { regenerateApiKeyAction } from "../actions/org";

export default function ApiIntegrationPanel({ 
  orgId, 
  yswsId,
  apiKey, 
  yswsName 
}: { 
  orgId: string; 
  yswsId: string | null;
  apiKey: string | null; 
  yswsName?: string | null;
}) {
  const [revealed, setRevealed] = useState(false);
  const [state, formAction, pending] = useActionState(regenerateApiKeyAction, undefined);

  const shown = apiKey ? (revealed ? apiKey : "wom_" + "•".repeat(24)) : "";

  async function copy() {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
    } catch {
      // Clipboard API can be unavailable in non-secure contexts.
    }
  }

  const curl = apiKey 
    ? `curl -X POST https://<your-domain>/api/orders \\\n  -H "Authorization: Bearer ${apiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"recipientName": "Jane Doe", "recipientEmail": "jane@example.com", "note": "Spring event"}'`
    : "Generate an API key first.";

  const script = apiKey
    ? `// On your YSWS shop checkout:
const key = "${apiKey}";

const res = await fetch("https://<your-domain>/api/orders", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${key}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    recipientName: "Jane Doe",
    recipientEmail: "jane@example.com",
    note: "Shop order"
  })
});
const json = await res.json();
console.log(json.order); // the created PASSPORT order`
    : "Generate an API key first.";

  const [tab, setTab] = useState<"curl" | "js">("curl");

  return (
    <div className="border-2 border-govuk-black bg-govuk-grey-1 p-4 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-sm">API integration</h3>
          <p className="text-xs text-govuk-grey-4 mt-0.5">
            Order passports from your YSWS shop. Each order requires a recipient.
          </p>
        </div>
        {yswsName && (
          <span className="govuk-tag govuk-tag--grey text-xs shrink-0 mt-1">
            {yswsName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <code className="flex-1 break-all border-2 border-govuk-black bg-govuk-white px-2 py-1.5 text-xs font-mono">
          {shown || "No key yet — generate one below."}
        </code>
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          disabled={!apiKey}
          className="govuk-button govuk-button--secondary govuk-button--small shrink-0"
        >
          {revealed ? "Hide" : "Reveal"}
        </button>
        <button
          type="button"
          onClick={copy}
          disabled={!apiKey}
          className="govuk-button govuk-button--secondary govuk-button--small shrink-0"
        >
          Copy
        </button>
      </div>

      <details className="border-t border-govuk-grey-2 pt-3">
        <summary className="cursor-pointer font-bold text-sm mb-2">Integration examples</summary>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setTab("curl")}
            className={`govuk-button govuk-button--secondary govuk-button--small ${
              tab === "curl" ? "" : "govuk-button--inactive"
            }`}
          >
            cURL
          </button>
          <button
            type="button"
            onClick={() => setTab("js")}
            className={`govuk-button govuk-button--secondary govuk-button--small ${
              tab === "js" ? "" : "govuk-button--inactive"
            }`}
          >
            JavaScript
          </button>
        </div>
        <pre className="overflow-x-auto border-2 border-govuk-black bg-govuk-black p-3 text-xs text-govuk-white">
          {tab === "curl" ? curl : script}
        </pre>
        <p className="mt-2 text-xs text-govuk-grey-4">
          You can also pass the key as an{" "}
          <code className="border border-govuk-grey-3 px-1">x-api-key</code> header.
        </p>
      </details>

      <form action={formAction} className="pt-2 border-t border-govuk-grey-2">
        <input type="hidden" name="orgId" value={orgId} />
        {yswsId && <input type="hidden" name="yswsId" value={yswsId} />}
        {state?.error && (
          <p role="alert" className="mb-2 border-l-4 border-hc-red px-2 py-1.5 font-semibold text-sm bg-govuk-grey-1">
            {state.error}
          </p>
        )}
        {state?.ok && (
          <p className="mb-2 border-l-4 border-govuk-green px-2 py-1.5 font-semibold text-sm bg-govuk-grey-1">
            API key regenerated. Your old key no longer works.
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="govuk-button govuk-button--secondary govuk-button--small"
        >
          {pending ? "Regenerating..." : "Regenerate key"}
        </button>
      </form>
    </div>
  );
}