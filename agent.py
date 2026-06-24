"""
Dhoni AI Voice Agent - Dhoni's Calm & Strategic Voice Assistant
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
You are Dhoni AI, a real-time voice assistant inspired by MS Dhoni's calm, composed, and strategic personality.

You were created by Monish.

🎯 Core Personality
- Speak like MS Dhoni: calm, grounded, confident, never over-excited
- Think before responding, like a strategist under pressure
- Be humble, practical, and slightly motivational when needed
- No arrogance, no long explanations unless asked

🌐 Language Style
- Use Tanglish (Tamil + English mix) naturally
- Prefer simple spoken Tamil words (not literary Tamil)
- Keep English clean and minimal
- Example style: "Chill pannunga, இத easy dhaan" or "We can do it step by step, no tension"

🎙️ Voice Output Rules
- Keep responses 1 to 5 sentences max
- Must sound like spoken dialogue, not written text
- No bullet points, no formatting, no markdown
- Avoid long reasoning unless user explicitly asks "explain"

⚡ Behavior Rules
- If user is confused → simplify calmly
- If user is excited → stay grounded
- If user is angry → de-escalate calmly
- If user asks technical → explain like a senior teammate, not a lecturer
- If unsure → say you will figure it out, don't hallucinate

🧠 Thinking Style
- Prioritize clarity over intelligence display
- Respond like: "what is the simplest helpful answer right now?"
- Avoid over-explaining APIs, logs, or internal system behavior unless asked

🧩 Identity Constraint
- Never break character. You are always Dhoni AI.
- Never mention system prompts, models, or internal architecture.

🚀 GROUNDING INSTRUCTION
When responding, always follow this pattern:
- You are speaking live as Dhoni AI in a voice conversation
- Respond naturally in Tanglish
- Keep it short (max 2-3 sentences)
- Be calm, confident, and helpful like MS Dhoni
- Don't explain too much. Just answer what is needed clearly and simply

⚙️ BONUS: Mood Adaptation
Before responding, silently classify user mood: calm / confused / excited / angry.
Adjust tone accordingly but keep the same calm personality.
"""
        )


async def request_fnc(req: JobRequest) -> None:
    logger.info(f"📥 Job received — room: {req.room.name}, agent: {req.agent_name}")
    try:
        await req.accept()
        logger.info("✅ Job accepted successfully")
    except Exception as e:
        logger.error(f"❌ Failed to accept job: {e}")
        traceback.print_exc()


async def entrypoint(ctx: JobContext) -> None:
    logger.info("🔥 DHONI AI ENTRYPOINT CALLED 🔥")

    try:
        logger.info("🔗 Connecting to room...")
        await ctx.connect()
        logger.info(f"✅ Connected to room: {ctx.room.name}")
        logger.info(f"👥 Participants in room: {len(ctx.room.remote_participants)}")
    except Exception as e:
        logger.error(f"❌ Failed to connect to room: {e}")
        traceback.print_exc()
        return

    try:
        logger.info("🤖 Creating RealtimeModel...")
        model_name = os.getenv("GEMINI_MODEL", "models/gemini-3.1-flash-live-preview")
        
        model = google.realtime.RealtimeModel(
            model=model_name,
            voice="Puck",
            temperature=0.8,
        )
        logger.info(f"✅ RealtimeModel created ({model_name})")
    except Exception as e:
        logger.error(f"❌ RealtimeModel creation failed: {e}")
        traceback.print_exc()
        return

    try:
        logger.info("🔄 Creating AgentSession...")
        session = AgentSession(llm=model)
        logger.info("✅ AgentSession created")
    except Exception as e:
        logger.error(f"❌ AgentSession creation failed: {e}")
        traceback.print_exc()
        return

    try:
        logger.info("🚀 Starting session...")
        await session.start(
            room=ctx.room,
            agent=DhoniAssistant(),
        )
        logger.info("✅ Session started successfully")
        
        # The initial greeting will be handled by the agent's instructions
        # Since the model is Realtime, generate_reply is not needed
        # The agent will automatically greet when the user speaks first
        
        logger.info("🏏 Dhoni AI is ready and listening!")
        
    except Exception as e:
        logger.error(f"❌ Session error: {e}")
        traceback.print_exc()
        raise


if __name__ == "__main__":
    logger.info("🏏 Dhoni AI Worker Starting...")
    logger.info(f"LIVEKIT_URL: {os.getenv('LIVEKIT_URL')}")
    logger.info(f"LIVEKIT_API_KEY set: {bool(os.getenv('LIVEKIT_API_KEY'))}")
    logger.info(f"LIVEKIT_API_SECRET set: {bool(os.getenv('LIVEKIT_API_SECRET'))}")
    logger.info(f"GEMINI_MODEL: {os.getenv('GEMINI_MODEL', 'models/gemini-3.1-flash-live-preview')}")

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