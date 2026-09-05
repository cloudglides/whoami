import type { EmailSendOptions } from "../send";

// Loops transactional email — activated when LOOPS_API_KEY is set.
// Docs: https://loops.so/docs/api/transactional
export async function sendLoops(
  opts: EmailSendOptions
): Promise<{ id: string }> {
  const apiKey = process.env.LOOPS_API_KEY;
  if (!apiKey) throw new Error("LOOPS_API_KEY not set");
  const res = await fetch("https://app.loops.so/api/v1/transactional", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transactionalId: process.env.LOOPS_TX_RECIPIENT_FORM_ID ?? "",
      email: opts.to,
      dataVariables: opts.meta ?? {},
    }),
  });
  if (!res.ok) throw new Error(`Loops send failed: ${res.status}`);
  const json = (await res.json()) as { messageId?: string };
  return { id: json.messageId ?? "unknown" };
}
