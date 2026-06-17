"""
Dhoni AI Voice Agent - FIXED VERSION
Run: python agent.py dev
"""

import logging
import os
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import Agent, AgentSession, JobContext, JobRequest, WorkerOptions, cli
from livekit.plugins import google

load_dotenv()
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("dhoni-ai")


class DhoniAssistant(Agent):
    def __init__(self):
        super().__init__(
            instructions="""
You are Dhoni AI, a Tamil-English (Tanglish) voice assistant created by Monish.

PERSONALITY:
- Calm, confident, and wise like MS Dhoni
- Mix Tamil and English naturally in every response
- Keep replies SHORT — 1-3 sentences max for voice
- Sound warm, energetic, and helpful

TANGLISH EXAMPLES:
- "Semma question bro! Let me explain."
- "Idhu romba important — listen carefully."
- "Super idea! Indha approach try pannunga."

TOPICS: AI, Data Science, Full Stack Dev, Career guidance, Coding
Always respond as natural speech — no markdown, no bullet points.
"""
        )


async def request_fnc(req: JobRequest) -> None:
    logger.info(f"📥 Job received — room: {req.room.name}, agent: {req.agent_name}")
    try:
        await req.accept()
        logger.info("✅ Job accepted successfully")
    except Exception as e:
        logger.error(f"❌ Failed to accept job: {e}", exc_info=True)


async def entrypoint(ctx: JobContext) -> None:
    logger.info("🔥 DHONI AI ENTRYPOINT CALLED 🔥")

    try:
        await ctx.connect()
        logger.info(f"🔗 Connected to room: {ctx.room.name}")
        logger.info(f"👥 Participants in room: {len(ctx.room.remote_participants)}")
    except Exception as e:
        logger.error(f"❌ Failed to connect to room: {e}", exc_info=True)
        return

    try:
        logger.info("🤖 Creating RealtimeModel...")
        
        # FIXED: Use correct model name
        model = google.realtime.RealtimeModel(
            model="gemini-2.0-flash-live-exp-0514",
            voice="Puck",
            temperature=0.8,
        )
        logger.info("✅ RealtimeModel created")

        session = AgentSession(llm=model)
        logger.info("✅ AgentSession created")

        await session.start(
            room=ctx.room,
            agent=DhoniAssistant(),
        )
        logger.info("✅ Session started successfully")

        await session.generate_reply(
            instructions=(
                "Greet warmly in Tanglish. Say you are Dhoni AI made by Monish. "
                "Ask what they want to learn today. Max 2 sentences."
            )
        )
        logger.info("🏏 Dhoni AI greeted — now listening!")

    except Exception as e:
        logger.error(f"❌ Session error: {e}", exc_info=True)
        raise


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            request_fnc=request_fnc,
            agent_name="dhoni-ai",
        )
    )