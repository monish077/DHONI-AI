// dhoni-ai-web/src/app/api/token/route.ts
// This runs on Vercel. It gives the user a LiveKit token AND
// dispatches the agent job to your laptop via LiveKit Cloud.

import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { NextResponse } from "next/server";

const API_KEY = process.env.LIVEKIT_API_KEY!;
const API_SECRET = process.env.LIVEKIT_API_SECRET!;
const LIVEKIT_URL = process.env.LIVEKIT_URL!; // wss://...
const HTTP_URL = LIVEKIT_URL.replace("wss://", "https://");
const ROOM_NAME = "dhoni-room";
const AGENT_NAME = "dhoni-ai";

export async function GET() {
  if (!API_KEY || !API_SECRET || !LIVEKIT_URL) {
    return NextResponse.json(
      { error: "LiveKit env vars not configured on Vercel" },
      { status: 500 }
    );
  }

  const identity = `user-${Math.random().toString(36).slice(2, 8)}`;

  // 1. Generate user token
  const at = new AccessToken(API_KEY, API_SECRET, { identity, ttl: "1h" });
  at.addGrant({
    roomJoin: true,
    room: ROOM_NAME,
    canPublish: true,
    canSubscribe: true,
  });
  const token = await at.toJwt(); // ← Bug D fix: await the JWT

  // 2. Dispatch agent to the room (Bug C fix — THE missing piece)
  // This tells LiveKit Cloud: "send a job to the worker named 'dhoni-ai'"
  // That worker is your laptop running agent.py
  try {
    const svc = new RoomServiceClient(HTTP_URL, API_KEY, API_SECRET);
    await svc.createJob({
      agentName: AGENT_NAME,
      room: { name: ROOM_NAME },
    });
    console.log(`✅ Agent dispatched → ${AGENT_NAME} @ ${ROOM_NAME}`);
  } catch (err: unknown) {
    // Don't block the user — they join, but agent may not appear
    // This can also fail if agent is already in the room (that's fine)
    console.warn("Agent dispatch warning:", err instanceof Error ? err.message : err);
  }

  return NextResponse.json({ token, url: LIVEKIT_URL });
}
