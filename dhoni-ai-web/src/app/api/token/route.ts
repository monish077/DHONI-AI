import { AccessToken } from "livekit-server-sdk";
import { RoomAgentDispatch, RoomConfiguration } from "@livekit/protocol";
import { NextResponse } from "next/server";

const API_KEY = process.env.LIVEKIT_API_KEY!;
const API_SECRET = process.env.LIVEKIT_API_SECRET!;
const LIVEKIT_URL = process.env.LIVEKIT_URL!;
const AGENT_NAME = "dhoni-ai";

export async function GET() {
  if (!API_KEY || !API_SECRET || !LIVEKIT_URL) {
    return NextResponse.json(
      { error: "LiveKit env vars not set" },
      { status: 500 }
    );
  }

  // Unique room per session — fixes stale room dispatch problem
  const roomName = `dhoni-room-${Date.now()}`;
  const identity = `user-${Math.random().toString(36).slice(2, 8)}`;

  const at = new AccessToken(API_KEY, API_SECRET, { identity, ttl: "1h" });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    roomCreate: true, // ensure the room is created fresh
  });

  at.roomConfig = new RoomConfiguration({
    agents: [
      new RoomAgentDispatch({
        agentName: AGENT_NAME,
      }),
    ],
  });

  const token = await at.toJwt();

  console.log(`[token] room=${roomName} identity=${identity}`);

  return NextResponse.json({ token, url: LIVEKIT_URL });
}