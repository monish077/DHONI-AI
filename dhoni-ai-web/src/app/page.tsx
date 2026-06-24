import type { Metadata } from "next";
import VoiceChat from "@/components/VoiceChat";

export const metadata: Metadata = {
  title: "Dhoni AI — Tanglish Voice Assistant",
  description: "Talk to Dhoni AI — your Tamil + English voice companion for AI, coding, and career guidance. Built by Monish.",
  openGraph: {
    title: "Dhoni AI — Tanglish Voice Assistant",
    description: "An AI voice companion that speaks Tanglish. Ask anything about AI, coding, and career growth.",
  },
};

export default function Home() {
  return (
    <main className="page">
      {/* Header */}
      <header className="header">
        <div className="badge">BETA</div>
        <h1 className="title">Dhoni <span className="gold">AI</span></h1>
        <p className="subtitle">Tamil + English voice companion</p>
      </header>

      {/* Voice interface */}
      <section className="chat-section">
        <VoiceChat />
      </section>

      <section className="demo-section">
  <div className="demo-header">
    <h2>🎬 See Dhoni AI in Action</h2>

    <p>
      Experience real-time voice conversations powered by
      Gemini Flash Live, LiveKit, and a custom AI agent.
    </p>
  </div>

  <video
    className="demo-video"
    controls
    preload="metadata"
    playsInline
  >
    <source src="/dhoni-demo.mp4.mov" type="video/mp4" />
  </video>
</section>



      {/* Feature pills */}
      <section className="features">
        {[
          { icon: "🤖", label: "AI & ML" },
          { icon: "💻", label: "Full Stack" },
          { icon: "📊", label: "Data Science" },
          { icon: "🎯", label: "Interviews" },
          { icon: "🚀", label: "Careers" },
        ].map(({ icon, label }) => (
          <div key={label} className="feature-pill">
            <span>{icon}</span>
            <span>{label}</span>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>Powered by <span className="gold">Gemini Realtime</span> · <span className="gold">LiveKit</span></p>
        <p className="built-by">Built with ❤️ by Monish</p>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #080810;
          color: #e0e0e0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          min-height: 100vh;
        }

        /* Subtle grid background */
        body::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,215,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,215,0,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .page {
          max-width: 600px;
          margin: 0 auto;
          padding: 48px 24px 40px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 48px;
          position: relative;
        }

        /* Header */
        .header { text-align: center; }
        .badge {
          display: inline-block;
          padding: 3px 10px;
          background: rgba(255,215,0,0.1);
          border: 1px solid rgba(255,215,0,0.3);
          border-radius: 50px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #ffd700;
          margin-bottom: 16px;
        }
        .title {
          font-size: clamp(40px, 10vw, 64px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
          color: #fff;
        }
        .gold { color: #ffd700; }
        .subtitle {
          margin-top: 10px;
          font-size: 15px;
          color: #555;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          font-size: 12px;
          font-weight: 500;
        }

        /* Chat section */
        .chat-section {
          width: 100%;
          background: #0d0d1a;
          border: 1px solid #1e1e3a;
          border-radius: 24px;
          overflow: hidden;
        }

        .demo-section {
  width: 100%;
}

.demo-header {
  text-align: center;
  margin-bottom: 18px;
}

.demo-header h2 {
  color: #fff;
  margin-bottom: 10px;
}

.demo-header p {
  color: #888;
  line-height: 1.7;
  font-size: 14px;
  max-width: 520px;
  margin: 0 auto;
}

.demo-video {
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  background: #000;
  border: 1px solid rgba(255,215,0,0.15);

  box-shadow:
    0 0 0 1px rgba(255,215,0,0.05),
    0 20px 60px rgba(0,0,0,0.45);

  transition: all 0.3s ease;
}

.demo-video:hover {
  transform: translateY(-3px);
  box-shadow:
    0 0 0 1px rgba(255,215,0,0.08),
    0 30px 80px rgba(0,0,0,0.55);
}

        /* Features */
        .features {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
        }
        .feature-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #0d0d1a;
          border: 1px solid #1e1e3a;
          border-radius: 50px;
          font-size: 13px;
          color: #666;
        }

        /* Footer */
        .footer { text-align: center; }
        .footer p { font-size: 12px; color: #444; line-height: 2; }
        .built-by { color: #333; }

        @media (max-width: 480px) {
          .page { padding: 32px 16px 32px; gap: 32px; }
        }
      `}</style>
    </main>
  );
}
