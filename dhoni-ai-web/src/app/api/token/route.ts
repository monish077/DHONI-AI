import { AccessToken } from "livekit-server-sdk";
import { RoomAgentDispatch, RoomConfiguration } from "@livekit/protocol";
import { NextResponse } from "next/server";

const API_KEY = process.env.LIVEKIT_API_KEY!;
const API_SECRET = process.env.LIVEKIT_API_SECRET!;
const LIVEKIT_URL = process.env.LIVEKIT_URL!;
const AGENT_NAME = "dhoni-ai";

export async function GET() {
  if (!API_KEY || !API_SECRET || !LIVEKIT_URL) {
    return NextResponse.json({ error: "LiveKit env vars not set" }, { status: 500 });
  }

  // Fresh room every session — no stale participants
  const roomName = `dhoni-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const identity = `user-${Math.random().toString(36).slice(2, 8)}`;

  const at = new AccessToken(API_KEY, API_SECRET, {
    identity,
    ttl: "2h",
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    roomCreate: true,
  });

  const roomConfig = new RoomConfiguration();
  roomConfig.agents = [
    new RoomAgentDispatch({
      agentName: AGENT_NAME,
    }),
  ];
  at.roomConfig = roomConfig;

  const token = await at.toJwt();
  console.log(`[token] Generated — room: ${roomName}, user: ${identity}, agent: ${AGENT_NAME}`);
  console.log("[token] roomConfig agents:", roomConfig.agents.map((agent) => agent.agentName));

  return NextResponse.json({ token, url: LIVEKIT_URL });
}