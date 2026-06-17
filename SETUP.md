# Dhoni AI — Complete Setup Guide
## "My laptop is the server" architecture

```
Anyone's browser → LiveKit Cloud → YOUR LAPTOP (Python agent)
      ↕
Vercel (Next.js frontend + token API)
```

---

## STEP 1 — Get your LiveKit credentials

1. Go to https://cloud.livekit.io and sign up (free)
2. Create a new project (any name)
3. Click "Settings" → copy:
   - Project URL (starts with `wss://`)
   - API Key
   - API Secret

---

## STEP 2 — Get your Google AI key

1. Go to https://aistudio.google.com/apikey
2. Create a new API key (free)
3. Copy it

---

## STEP 3 — Set up your laptop (Python agent)

```bash
# In the root folder (where agent.py is)
cp .env.example .env
# Fill in .env with your LiveKit and Google keys

pip install -r requirements.txt

# Test it works:
python agent.py dev
```

You should see:
```
INFO  worker registered  agent_name=dhoni-ai
```

**Leave this terminal running whenever you want the agent to be live.**

---

## STEP 4 — Deploy frontend to Vercel

```bash
cd dhoni-ai-web
npm install
npm run build          # make sure it compiles cleanly
```

Then push `dhoni-ai-web/` to GitHub and:

1. Go to https://vercel.com → "New Project"
2. Import your GitHub repo
3. Set **Root Directory** to `dhoni-ai-web`
4. Add Environment Variables (Settings → Environment Variables):
   ```
   LIVEKIT_URL     = wss://your-project.livekit.cloud
   LIVEKIT_API_KEY = your_api_key
   LIVEKIT_API_SECRET = your_api_secret
   ```
   (NOT the Google key — that stays on your laptop only)
5. Deploy!

---

## STEP 5 — Demo flow

1. **Start your laptop agent first:**
   ```bash
   python agent.py dev
   # Wait for: "worker registered agent_name=dhoni-ai"
   ```

2. **Share your Vercel URL** with anyone

3. **When someone clicks "Start Conversation":**
   - Browser connects to LiveKit room
   - Vercel API calls `createJob()` → LiveKit routes it to your laptop
   - `request_fnc` accepts → `entrypoint()` runs
   - Dhoni AI speaks the greeting
   - Two-way voice conversation works!

4. **When you close the laptop / stop the script:**
   - Frontend still loads (it's on Vercel)
   - But agent won't join (shows "Waiting for Dhoni AI…")
   - Just restart `python agent.py dev` to bring it back

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Waiting for Dhoni AI…" forever | Is `agent.py dev` running? Check terminal for "worker registered" |
| Token API error on Vercel | Check all 3 env vars are set in Vercel dashboard |
| No audio from agent | Check browser allows microphone; check Google API key in `.env` |
| Agent joins but silent | Gemini API might be rate-limited; try again in 30s |
| `createJob is not a function` | Run `npm install livekit-server-sdk@latest` |

---

## Architecture summary

| Component | Where it runs | What it does |
|-----------|--------------|--------------|
| `dhoni-ai-web/` | Vercel (free) | Serves the UI, generates tokens, dispatches agent jobs |
| `agent.py` | Your laptop | Connects to LiveKit Cloud, handles voice AI, talks via Gemini |
| LiveKit Cloud | LiveKit's servers (free tier) | Routes audio between browser and your laptop |
