import { useState, useEffect } from "react";
import { Moon, Sun, Mail, Volume2, VolumeX, Menu, X } from "lucide-react";
import { isAudioEnabled, setAudioEnabled } from "@/lib/audio-engine";

interface SideMenuProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function SideMenu({ darkMode, onToggleDark }: SideMenuProps) {
  const [open, setOpen] = useState(false);
  const [audioOn, setAudioOn] = useState(() => isAudioEnabled());

  const toggleAudio = () => {
    const next = !audioOn;
    setAudioOn(next);
    setAudioEnabled(next);
  };

  return (
    <>
      {/* Floating menu button — left side, vertically centered */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-[9999] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          width: 36,
          height: 60,
          background: "linear-gradient(135deg, #00008B, #0000cd)",
          borderRadius: "0 10px 10px 0",
          boxShadow: "3px 0 18px rgba(0,0,139,0.55), 2px 0 6px rgba(0,0,0,0.4)",
          border: "none",
        }}
        title="Menu"
      >
        {open
          ? <X size={16} color="rgba(255,255,255,0.9)" />
          : <Menu size={16} color="rgba(255,255,255,0.9)" />
        }
      </button>

      {/* Slide-out panel */}
      <div
        className="fixed left-0 top-1/2 -translate-y-1/2 z-[9998] transition-all duration-300"
        style={{
          transform: `translateX(${open ? "36px" : "-240px"}) translateY(-50%)`,
          width: 240,
          borderRadius: "0 16px 16px 0",
          background: "linear-gradient(160deg, #00006e 0%, #000055 60%, #00003a 100%)",
          boxShadow: "4px 0 32px rgba(0,0,80,0.7), 2px 0 8px rgba(0,0,0,0.5)",
          padding: "24px 20px",
          backdropFilter: "blur(12px)",
        }}
      >
        <p className="text-xs font-semibold mb-5" style={{ color: "rgba(180,190,255,0.7)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Settings
        </p>

        {/* Dark Mode */}
        <button
          onClick={onToggleDark}
          className="w-full flex items-center justify-between rounded-xl px-3 py-3 mb-3 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="flex items-center gap-2.5">
            {darkMode ? <Sun size={16} color="#fcd34d" /> : <Moon size={16} color="#a5b4fc" />}
            <span className="text-sm font-medium" style={{ color: "rgba(220,225,255,0.9)" }}>
              {darkMode ? "Light Mode" : "Dark Mode"}
            </span>
          </div>
          {/* Toggle pill */}
          <div
            className="relative transition-all duration-200"
            style={{
              width: 36, height: 20, borderRadius: 10,
              background: darkMode ? "#6366f1" : "rgba(255,255,255,0.15)",
              boxShadow: darkMode ? "0 0 8px rgba(99,102,241,0.5)" : "none",
            }}
          >
            <div
              className="absolute top-0.5 transition-all duration-200"
              style={{
                width: 16, height: 16, borderRadius: "50%",
                background: "#fff",
                left: darkMode ? 18 : 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            />
          </div>
        </button>

        {/* Audio toggle */}
        <button
          onClick={toggleAudio}
          className="w-full flex items-center justify-between rounded-xl px-3 py-3 mb-3 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="flex items-center gap-2.5">
            {audioOn
              ? <Volume2 size={16} color="#34d399" />
              : <VolumeX size={16} color="#f87171" />
            }
            <span className="text-sm font-medium" style={{ color: "rgba(220,225,255,0.9)" }}>
              {audioOn ? "Audio On" : "Audio Off"}
            </span>
          </div>
          <div
            className="relative transition-all duration-200"
            style={{
              width: 36, height: 20, borderRadius: 10,
              background: audioOn ? "#10b981" : "rgba(255,255,255,0.15)",
              boxShadow: audioOn ? "0 0 8px rgba(16,185,129,0.4)" : "none",
            }}
          >
            <div
              className="absolute top-0.5 transition-all duration-200"
              style={{
                width: 16, height: 16, borderRadius: "50%",
                background: "#fff",
                left: audioOn ? 18 : 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            />
          </div>
        </button>

        {/* Contact Us */}
        <a
          href="mailto:support@elitedealshub.com"
          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-3 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none" }}
        >
          <Mail size={16} color="#93c5fd" />
          <span className="text-sm font-medium" style={{ color: "rgba(220,225,255,0.9)" }}>
            Contact Us
          </span>
        </a>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[9997]"
          onClick={() => setOpen(false)}
          style={{ background: "rgba(0,0,0,0.15)" }}
        />
      )}
    </>
  );
}
