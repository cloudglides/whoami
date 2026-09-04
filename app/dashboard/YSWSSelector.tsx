"use client";

import { useRouter, useSearchParams } from "next/navigation";

type YSWS = {
  yswsId: string;
  yswsName: string;
  yswsSlug: string;
  yswsApiKey: string | null;
  orgName: string;
  orgSlug: string;
  role: string;
  orderCount: number;
  isActive: boolean;
};

export default function YSWSSelector({
  yswsList,
  currentYswsId,
}: {
  yswsList: YSWS[];
  currentYswsId: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (yswsList.length <= 1) {
    return null;
  }

  const current = yswsList.find((y) => y.yswsId === currentYswsId);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYswsId = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (newYswsId) {
      params.set("ysws", newYswsId);
    } else {
      params.delete("ysws");
    }
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="mb-6">
      <label htmlFor="ysws-selector" className="mb-2 block font-bold">
        Active YSWS
      </label>
      <select
        id="ysws-selector"
        value={currentYswsId ?? ""}
        onChange={handleChange}
        className="w-full max-w-xs border-2 border-govuk-black px-3 py-2 text-base bg-white"
      >
        <option value="">Select a YSWS</option>
        {yswsList.map((ysws) => (
          <option key={ysws.yswsId} value={ysws.yswsId}>
            {ysws.yswsName} ({ysws.orgName}) — {ysws.orderCount} orders
          </option>
        ))}
      </select>
      {current && (
        <p className="mt-2 text-sm text-govuk-grey-4">
          API key: <code className="font-mono">{current.yswsApiKey ?? "—"}</code>
        </p>
      )}
    </div>
  );
}