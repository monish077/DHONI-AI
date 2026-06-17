import { AccessToken } from "livekit-server-sdk";
import { RoomAgentDispatch, RoomConfiguration } from "@livekit/protocol";
import { NextResponse } from "next/server";

const API_KEY = process.env.LIVEKIT_API_KEY!;
const API_SECRET = process.env.LIVEKIT_API_SECRET!;
const LIVEKIT_URL = process.env.LIVEKIT_URL!;
const ROOM_NAME = "dhoni-room";
const AGENT_NAME = "dhoni-ai";

export async function GET() {
  if (!API_KEY || !API_SECRET || !LIVEKIT_URL) {
    return NextResponse.json(
      { error: "LiveKit env vars not set in Vercel dashboard" },
      { status: 500 }
    );
  }

  const identity = `user-${Math.random().toString(36).slice(2, 8)}`;

  const at = new AccessToken(API_KEY, API_SECRET, { identity, ttl: "1h" });
  at.addGrant({
    roomJoin: true,
    room: ROOM_NAME,
    canPublish: true,
    canSubscribe: true,
  });

  at.roomConfig = new RoomConfiguration({
    agents: [
      new RoomAgentDispatch({
        agentName: AGENT_NAME,
      }),
    ],
  });

  const token = await at.toJwt();

  return NextResponse.json({ token, url: LIVEKIT_URL });
}