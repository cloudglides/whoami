import { NextRequest, NextResponse } from "next/server";
import { redis, getClientIdentifier } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const { useful, page } = await req.json();
    const identifier = getClientIdentifier(req);
    const key = `feedback:${identifier}`;

    const existing = await redis.get(key);
    if (existing) {
      return NextResponse.json(
        { error: "Feedback already submitted" },
        { status: 409 }
      );
    }

    const entry = {
      useful: Boolean(useful),
      page: page || "unknown",
      timestamp: Date.now(),
    };

    await redis.set(key, JSON.stringify(entry), { ex: 60 * 60 * 24 * 30 });

    await redis.lpush("feedback:all", JSON.stringify(entry));
    await redis.ltrim("feedback:all", 0, 999);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Feedback error:", e);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const entries = await redis.lrange("feedback:all", 0, 99);
    const parsed = entries.map((e) => JSON.parse(e as string));
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("Feedback fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}