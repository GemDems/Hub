import { useState, useEffect } from "react";

interface LiveStats {
  viewers: number;
  hourlyBuyers: number;
  timestamp: number;
}

export default function Header() {
  const [liveStats, setLiveStats] = useState<LiveStats>({ viewers: 1035, hourlyBuyers: 708, timestamp: Date.now() });
  const [viewers, setViewers] = useState(1035);
  const [orders, setOrders] = useState(708);

  // Live viewers/orders drift
  useEffect(() => {
    const iv = setInterval(() => {
      setViewers(v => Math.max(980, Math.min(1200, v + Math.floor(Math.random() * 5) - 2)));
      setOrders(o => Math.max(650, Math.min(820, o + Math.floor(Math.random() * 3) - 1)));
    }, 3500);
    return () => clearInterval(iv);
  }, []);

  // Fetch live stats
  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch("/api/live-stats");
        if (!res.ok) return;
        const s = await res.json();
        setLiveStats(s);
        setViewers(s.viewers);
        setOrders(s.hourlyBuyers);
      } catch {}
    };
    fetch_();
    const iv = setInterval(fetch_, 8000);
    return () => clearInterval(iv);
  }, []);

  return (
    <header style={{ background: "#0d0f1a" }} className="w-full overflow-hidden">
      {/* Flash sale ticker */}
      <div style={{ background: "linear-gradient(90deg,#e63946,#9b2dca)" }} className="w-full py-2.5 text-center text-xs font-semibold tracking-widest text-white">
        ⚡ FLASH SALE ENDING SOON — {viewers.toLocaleString()} MEMBERS ACTIVE TODAY &nbsp;|&nbsp; SPOTS FILLING FAST ⚡
      </div>
      {/* Hero */}
      <div className="text-center pt-10 pb-2 px-4">
        <div className="text-xs font-semibold tracking-[0.18em] mb-3" style={{ color: "#9b8fcb" }}>
          THE #1 PREMIUM MARKETPLACE
        </div>
        <h1 className="font-extrabold leading-none tracking-tight text-white" style={{ fontSize: "clamp(52px,9vw,88px)", letterSpacing: "-0.02em" }}>
          ELITE<br />
          <span style={{ color: "#7c3aed" }} className="text-[#00008B]">DEALS</span>
        </h1>
        <div className="mt-2 text-sm font-normal tracking-[0.2em]" style={{ color: "#9ca3af" }}>
          PREMIUM MARKETPLACE
        </div>

        {/* Trust pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-5 max-w-lg mx-auto">
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold border" style={{ background: "rgba(251,191,36,0.1)", borderColor: "rgba(251,191,36,0.3)", color: "#fbbf24" }}>
            Curated by experts
          </span>
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold border" style={{ background: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.3)", color: "#22c55e" }}>
            Verified authentic
          </span>
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold border" style={{ background: "rgba(96,165,250,0.1)", borderColor: "rgba(96,165,250,0.3)", color: "#60a5fa" }}>
            Trusted by thousands
          </span>
        </div>
      </div>
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto px-4 mt-5">
        {[
          { icon: "✅", label: "Verified", desc: "Every product vetted", color: "#4ade80", bg: "rgba(34,197,94,0.15)" },
          { icon: "⭐", label: "4.9/5 Rating", desc: "78K+ reviews", color: "#fbbf24", bg: "rgba(251,191,36,0.15)" },
          { icon: "🏆", label: "#1 Marketplace", desc: "Industry leader", color: "#a78bfa", bg: "rgba(139,92,246,0.15)" },
          { icon: "🔒", label: "Bank-Level", desc: "256-bit encryption", color: "#60a5fa", bg: "rgba(96,165,250,0.15)" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: "#151929", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-2 text-xl" style={{ background: s.bg }}>
              {s.icon}
            </div>
            <div className="text-sm font-bold mb-0.5" style={{ color: s.color }}>{s.label}</div>
            <div className="text-xs" style={{ color: "#6b7280" }}>{s.desc}</div>
          </div>
        ))}
      </div>
      {/* Live bar */}
      <div className="max-w-lg mx-auto px-4 mt-4">
        <div className="rounded-xl px-6 py-3.5 flex justify-around items-center" style={{ background: "#151929", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22c55e" }}></div>
            <span className="font-bold text-white">{viewers.toLocaleString()}</span>
            <span style={{ color: "#9ca3af" }}>live viewers</span>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.07)", height: 28 }}></div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#60a5fa", animationDelay: "0.4s" }}></div>
            <span className="font-bold text-white">{orders.toLocaleString()}</span>
            <span style={{ color: "#9ca3af" }}>orders this hour</span>
          </div>
        </div>
      </div>
      {/* CTA */}
      <div className="text-center px-4 mt-7 pb-2">
        <div className="inline-block text-3xl font-extrabold px-8 py-2.5 rounded-xl mb-1.5"
          style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80" }}>
          $6.2M+ SAVED
        </div>
        <div className="text-xs mb-6" style={{ color: "#6b7280" }}>by our members this month alone</div>
        <button
          className="text-white text-lg font-bold px-14 py-5 rounded-full cursor-pointer transition-transform hover:scale-105"
          style={{
            background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
            border: "none",
            animation: "ctapulse 2.5s infinite",
            letterSpacing: "0.02em"
          }}
          onClick={() => {
            const chatBtn = document.querySelector('[data-chat-button]') as HTMLElement;
            if (chatBtn) chatBtn.click();
          }}
        >
          CLAIM MY EXCLUSIVE ACCESS →
        </button>
        <div className="mt-3 text-xs" style={{ color: "#6b7280" }}>
          <span style={{ color: "#4ade80" }}>98.7%</span> of members got more than they expected &nbsp;|&nbsp; No credit card required to start
        </div>
      </div>
      {/* Guarantee */}
      <div className="max-w-lg mx-auto px-4 mt-6">
        <div className="rounded-xl px-5 py-4 flex gap-4 items-start"
          style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
          <div className="text-3xl flex-shrink-0 mt-0.5">🏅</div>
          <div>
            <div className="text-sm font-bold mb-1" style={{ color: "#fbbf24" }}>100% Satisfaction Guarantee</div>
            <div className="text-xs leading-relaxed" style={{ color: "#9ca3af" }}>Not happy? We'll make it right — If the deal isnt real, I'll personally find you a better one — or send it to you for free. We're so confident in Elite Deals that we take on all the risk so you don't have to.</div>
          </div>
        </div>
      </div>
      {/* Reviews */}
      <div className="max-w-2xl mx-auto px-4 mt-5 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { text: `"Saved $340 on my first order. I was skeptical but this is the real deal — everything arrived exactly as described."`, author: "James T. — Verified Buyer" },
            { text: `"Best marketplace I've used. The curation is insane — every deal is actually worth it. My friends all joined after I told them."`, author: "Priya M. — Member since 2024" },
            { text: `"Legit saved over $1,200 this year. The security and authenticity checks give me total peace of mind. 10/10."`, author: "Marcus R. — Elite Member" },
          ].map((r) => (
            <div key={r.author} className="rounded-xl p-4" style={{ background: "#151929", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-xs mb-1.5" style={{ color: "#fbbf24" }}>★★★★★</div>
              <div className="text-xs leading-relaxed mb-2" style={{ color: "#d1d5db" }}>{r.text}</div>
              <div className="text-xs font-medium" style={{ color: "#6b7280" }}>{r.author}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Footer strip */}
      <div className="text-center py-3 text-xs" style={{ background: "#0a0c14", borderTop: "1px solid rgba(255,255,255,0.05)", color: "#4b5563" }}>
        <span style={{ color: "#22c55e" }}>✓</span> Every Deal Verified &nbsp;•&nbsp; No Fake Offers &nbsp;•&nbsp; Secure Checkout &nbsp;•&nbsp; 24/7 Support
      </div>
      <style>{`
        @keyframes ctapulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.5); }
          50% { box-shadow: 0 0 0 14px rgba(124,58,237,0); }
        }
      `}</style>
    </header>
  );
}
