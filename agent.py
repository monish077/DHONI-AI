"""
Dhoni AI Voice Agent - DEBUG VERSION
Run: python agent.py dev
"""

import logging
import os
import traceback
from dotenv import load_dotenv
from livekit.agents import Agent, AgentSession, JobContext, JobRequest, WorkerOptions, cli
from livekit.plugins import google

load_dotenv()
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("dhoni-ai")


class DhoniAssistant(Agent):
    def __init__(self):
        super().__init__(
            instructions="""
You are Dhoni AI, a Tamil-English (Tanglish) voice assistant made by Monish.
Be calm, confident, and wise like MS Dhoni.
Mix Tamil and English naturally. Keep replies SHORT — 1-3 sentences for voice.
No markdown, no bullet points — just natural speech.
"""
        )


async def request_fnc(req: JobRequest) -> None:
    logger.info(f"📥 Job received — room: {req.room.name}")
    try:
        await req.accept()
        logger.info("✅ Job accepted")
    except Exception as e:
        logger.error(f"❌ Accept failed: {e}")
        traceback.print_exc()


async def entrypoint(ctx: JobContext) -> None:
    logger.info("=" * 50)
    logger.info("🔥 ENTRYPOINT CALLED")
    logger.info("=" * 50)

    try:
        logger.info("Step 1: Connecting to room...")
        await ctx.connect()
        logger.info(f"Step 1 OK — room: {ctx.room.name}")
    except Exception as e:
        logger.error(f"❌ ctx.connect() failed: {e}")
        traceback.print_exc()
        return

    try:
        logger.info("Step 2: Creating RealtimeModel...")
        model_name = os.getenv("GEMINI_MODEL", "models/gemini-3.1-flash-live-preview")

        # Use a supported Gemini live model name.
        # If this fails, run your model checker and set GEMINI_MODEL in .env.
        model = google.realtime.RealtimeModel(
            model=model_name,
            voice="Puck",
            temperature=0.8,
        )
        logger.info("Step 2 OK — RealtimeModel created (%s)", model_name)
    except Exception as e:
        logger.error(f"❌ RealtimeModel creation failed: {e}")
        traceback.print_exc()
        return

    try:
        logger.info("Step 3: Creating AgentSession...")
        session = AgentSession(llm=model)
        logger.info("Step 3 OK — AgentSession created")
    except Exception as e:
        logger.error(f"❌ AgentSession creation failed: {e}")
        traceback.print_exc()
        return

    try:
        logger.info("Step 4: Starting session...")
        await session.start(
            room=ctx.room,
            agent=DhoniAssistant(),
        )
        logger.info("Step 4 OK — Session started")
    except Exception as e:
        logger.error(f"❌ session.start() failed: {e}")
        traceback.print_exc()
        return

    try:
        logger.info("Step 5: Sending greeting...")
        await session.generate_reply(
            instructions="Greet in Tanglish. Say you are Dhoni AI by Monish. Ask what they need. Max 2 sentences."
        )
        logger.info("Step 5 OK — Greeting sent 🏏")
    except Exception as e:
        logger.error(f"❌ generate_reply failed: {e}")
        traceback.print_exc()


if __name__ == "__main__":
    logger.info("Starting Dhoni AI worker")
    logger.info("LIVEKIT_URL=%s", os.getenv("LIVEKIT_URL"))
    logger.info("LIVEKIT_API_KEY set=%s", bool(os.getenv("LIVEKIT_API_KEY")))
    logger.info("LIVEKIT_API_SECRET set=%s", bool(os.getenv("LIVEKIT_API_SECRET")))

    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            request_fnc=request_fnc,
            agent_name="dhoni-ai",
            api_key=os.getenv("LIVEKIT_API_KEY"),
            api_secret=os.getenv("LIVEKIT_API_SECRET"),
            ws_url=os.getenv("LIVEKIT_URL"),
        )
    )