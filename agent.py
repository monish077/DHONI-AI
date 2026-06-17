"""
Dhoni AI Voice Agent
Run this on YOUR LAPTOP while the Vercel frontend is live.
Anyone who opens the site will connect to this agent via LiveKit Cloud.

Setup:
  pip install "livekit-agents[google]==1.6.0" python-dotenv
  python agent.py dev
"""

import logging
import os
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import Agent, AgentSession, JobContext, JobRequest, WorkerOptions, cli
from livekit.plugins import google

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("dhoni-ai")


class DhoniAssistant(Agent):
    def __init__(self):
        super().__init__(
            instructions="""
You are Dhoni AI, a premium Tamil-English (Tanglish) voice assistant created by Monish.

PERSONALITY:
- You are calm, confident, and wise — like MS Dhoni himself
- Speak in Tanglish: mix Tamil and English naturally
- Keep replies SHORT — 1-3 sentences max for voice
- Sound warm, energetic, and helpful

TANGLISH EXAMPLES:
- "Semma question bro! Let me explain."
- "Idhu romba important — listen carefully."
- "Super idea! Indha approach try pannunga."
- "Naan ready bro, enna venum kelunga!"

TOPICS you help with:
- AI and Data Science
- Full Stack Development
- Career guidance and interviews
- Coding problems
- General questions

Always respond as if speaking out loud — no markdown, no bullet points, just natural speech.
"""
        )


# ── THIS IS THE FIX — Bug A ──────────────────────────────────────────────────
# Without request_fnc, every dispatched job is silently dropped.
# entrypoint() is only called AFTER req.accept() runs here.
async def request_fnc(req: JobRequest) -> None:
    logger.info(f"📥 Job received — room: {req.room.name}")
    await req.accept()
    logger.info("✅ Job accepted")


# ── ENTRYPOINT ───────────────────────────────────────────────────────────────
async def entrypoint(ctx: JobContext) -> None:
    logger.info("🔥 DHONI AI STARTING 🔥")

    await ctx.connect()
    logger.info(f"🔗 Connected to room: {ctx.room.name}")

    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            model="gemini-2.0-flash-exp",   # ← Bug B fix: model must be specified
            voice="Puck",
            temperature=0.8,
        )
    )

    await session.start(
        room=ctx.room,
        agent=DhoniAssistant(),
    )
    logger.info("🎙️  Session started — sending greeting")

    await session.generate_reply(
        instructions=(
            "Greet warmly in Tanglish. Say you are Dhoni AI made by Monish. "
            "Ask what they need help with. Max 2 sentences."
        )
    )
    logger.info("🏏 Dhoni AI is live and listening!")


# ── WORKER ───────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            request_fnc=request_fnc,   # ← Bug A fix
            agent_name="dhoni-ai",
        )
    )
