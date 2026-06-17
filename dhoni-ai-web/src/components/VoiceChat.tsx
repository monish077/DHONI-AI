"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  ParticipantEvent,
  Track,
  ConnectionState,
} from "livekit-client";

type Phase =
  | "idle"
  | "connecting"
  | "waiting"
  | "live"
  | "error";

const PHASE_LABELS: Record<Phase, string> = {
  idle: "Ready to talk",
  connecting: "Joining room…",
  waiting: "Waiting for Dhoni AI…",
  live: "Live — Dhoni AI is here!",
  error: "Connection failed",
};

export default function VoiceChat() {
  const roomRef = useRef<Room | null>(null);
  const audioEls = useRef<HTMLAudioElement[]>([]);

  const [phase, setPhase] = useState<Phase>("idle");
  const [muted, setMuted] = useState(false);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [error, setError] = useState("");

  const cleanup = useCallback(() => {
    roomRef.current?.disconnect();
    roomRef.current = null;
    audioEls.current.forEach((el) => { el.pause(); el.remove(); });
    audioEls.current = [];
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const start = useCallback(async () => {
    setPhase("connecting");
    setError("");

    try {
      const res = await fetch("/api/token");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Token API returned ${res.status}`);
      }
      const { token, url } = await res.json();
      if (!token || !url) throw new Error("Invalid token response from server");

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      // Agent joins → attach their audio (Bug E fix)
      room.on(RoomEvent.ParticipantConnected, (p: RemoteParticipant) => {
        console.log("Participant joined:", p.identity, p.kind);
        // kind === 3 is "agent" in livekit-client
        if ((p.kind as number) === 3 || p.identity.startsWith("agent")) {
          setPhase("live");
        }

        p.on(ParticipantEvent.TrackSubscribed, (track) => {
          if (track.kind === Track.Kind.Audio) {
            const el = track.attach() as HTMLAudioElement;
            el.autoplay = true;
            el.style.display = "none";
            document.body.appendChild(el);
            audioEls.current.push(el);
          }
        });

        // Detect agent speaking for visual feedback
        p.on(ParticipantEvent.IsSpeakingChanged, (speaking) => {
          setAgentSpeaking(speaking);
        });
      });

      room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        if (state === ConnectionState.Connected) setPhase("waiting");
        if (state === ConnectionState.Disconnected) {
          setPhase("idle");
          setAgentSpeaking(false);
        }
      });

      room.on(RoomEvent.Disconnected, () => {
        setPhase("idle");
        setAgentSpeaking(false);
        setMuted(false);
      });

      await room.connect(url, token);
      await room.localParticipant.setMicrophoneEnabled(true);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setPhase("error");
      cleanup();
    }
  }, [cleanup]);

  const stop = useCallback(() => {
    cleanup();
    setPhase("idle");
    setMuted(false);
    setAgentSpeaking(false);
  }, [cleanup]);

  const toggleMute = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !muted;
    await room.localParticipant.setMicrophoneEnabled(!next);
    setMuted(next);
  }, [muted]);

  const isActive = phase === "connecting" || phase === "waiting" || phase === "live";
  const canInteract = phase === "live";

  return (
    <div className="voice-chat">
      {/* Avatar / speaking indicator */}
      <div className={`avatar-ring ${agentSpeaking ? "speaking" : ""} ${phase === "live" ? "live" : ""}`}>
        <div className="avatar-inner">
          <span className="avatar-emoji">🏏</span>
        </div>
        {agentSpeaking && (
          <div className="sound-waves">
            <span /><span /><span /><span />
          </div>
        )}
      </div>

      {/* Status */}
      <p className={`status-text ${phase}`}>{PHASE_LABELS[phase]}</p>
      {phase === "waiting" && (
        <p className="hint">Your laptop must be running <code>python agent.py dev</code></p>
      )}
      {phase === "error" && error && (
        <p className="error-detail">{error}</p>
      )}

      {/* Controls */}
      <div className="controls">
        {!isActive ? (
          <button className="btn-start" onClick={start}>
            Start Conversation
          </button>
        ) : (
          <>
            <button
              className={`btn-mute ${muted ? "muted" : ""}`}
              onClick={toggleMute}
              disabled={!canInteract}
            >
              {muted ? "🔇 Unmute" : "🎤 Mute"}
            </button>
            <button className="btn-end" onClick={stop}>
              End Call
            </button>
          </>
        )}
      </div>

      {/* Tips shown while live */}
      {phase === "live" && (
        <div className="tips">
          <p>Try asking:</p>
          <div className="chips">
            <span>"Explain machine learning in Tanglish"</span>
            <span>"How do I prepare for interviews?"</span>
            <span>"What is React bro?"</span>
          </div>
        </div>
      )}

      <style>{`
        .voice-chat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          padding: 40px 20px;
        }

        /* Avatar */
        .avatar-ring {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a1a2e;
          border: 2px solid #2a2a4e;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .avatar-ring.live {
          border-color: #ffd700;
        }
        .avatar-ring.speaking {
          box-shadow: 0 0 0 4px rgba(255, 215, 0, 0.3), 0 0 0 8px rgba(255, 215, 0, 0.1);
          animation: pulse-ring 1.2s ease-in-out infinite;
        }
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 4px rgba(255,215,0,0.3), 0 0 0 8px rgba(255,215,0,0.08); }
          50% { box-shadow: 0 0 0 6px rgba(255,215,0,0.4), 0 0 0 14px rgba(255,215,0,0.12); }
        }
        .avatar-inner { font-size: 52px; line-height: 1; }

        /* Sound waves */
        .sound-waves {
          position: absolute;
          bottom: -28px;
          display: flex;
          gap: 4px;
          align-items: flex-end;
          height: 20px;
        }
        .sound-waves span {
          width: 4px;
          border-radius: 2px;
          background: #ffd700;
          animation: wave 0.8s ease-in-out infinite;
        }
        .sound-waves span:nth-child(1) { animation-delay: 0s;    height: 8px; }
        .sound-waves span:nth-child(2) { animation-delay: 0.15s; height: 16px; }
        .sound-waves span:nth-child(3) { animation-delay: 0.3s;  height: 12px; }
        .sound-waves span:nth-child(4) { animation-delay: 0.45s; height: 6px; }
        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); opacity: 0.6; }
          50% { transform: scaleY(1.2); opacity: 1; }
        }

        /* Status */
        .status-text {
          font-size: 15px;
          font-weight: 500;
          letter-spacing: 0.02em;
          color: #888;
          margin: 0;
          transition: color 0.3s;
        }
        .status-text.live { color: #ffd700; }
        .status-text.connecting, .status-text.waiting { color: #a0a0ff; }
        .status-text.error { color: #ff6b6b; }

        .hint {
          font-size: 12px;
          color: #555;
          margin: -12px 0 0;
          text-align: center;
        }
        .hint code {
          background: #1a1a1a;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 11px;
          color: #ffd700;
        }
        .error-detail {
          font-size: 12px;
          color: #ff6b6b;
          margin: -12px 0 0;
          max-width: 320px;
          text-align: center;
        }

        /* Controls */
        .controls { display: flex; gap: 12px; }

        .btn-start {
          padding: 14px 36px;
          background: #ffd700;
          color: #0a0a0a;
          border: none;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .btn-start:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255,215,0,0.35);
        }
        .btn-start:active { transform: translateY(0); }

        .btn-mute {
          padding: 12px 24px;
          background: #1e1e2e;
          color: #ccc;
          border: 1px solid #333;
          border-radius: 50px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .btn-mute:disabled { opacity: 0.4; cursor: default; }
        .btn-mute:not(:disabled):hover { background: #252538; }
        .btn-mute.muted { background: #2a1f1f; border-color: #ff6b6b; color: #ff6b6b; }

        .btn-end {
          padding: 12px 24px;
          background: transparent;
          color: #ff6b6b;
          border: 1px solid #ff6b6b;
          border-radius: 50px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-end:hover { background: rgba(255,107,107,0.1); }

        /* Tips */
        .tips { text-align: center; }
        .tips p { font-size: 12px; color: #555; margin: 0 0 10px; }
        .chips {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
        }
        .chips span {
          padding: 6px 14px;
          background: #111;
          border: 1px solid #2a2a2a;
          border-radius: 50px;
          font-size: 12px;
          color: #888;
          cursor: default;
        }
      `}</style>
    </div>
  );
}
