import { useState, useEffect } from "react";

interface LiveStats {
  viewers: number;
  hourlyBuyers: number;
  timestamp: number;
}

export default function Header() {
  const [viewers, setViewers] = useState(1035);
  const [orders, setOrders] = useState(708);

  useEffect(() => {
    const iv = setInterval(() => {
      setViewers(v => Math.max(980, Math.min(1200, v + Math.floor(Math.random() * 5) - 2)));
      setOrders(o => Math.max(650, Math.min(820, o + Math.floor(Math.random() * 3) - 1)));
    }, 3500);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch("/api/live-stats");
        if (!res.ok) return;
        const s = await res.json();
        setViewers(s.viewers);
        setOrders(s.hourlyBuyers);
      } catch {}
    };
    fetch_();
    const iv = setInterval(fetch_, 8000);
    return () => clearInterval(iv);
  }, []);

  return (
    <header className="w-full bg-white overflow-hidden">
      {/* Flash ticker */}
      <div style={{ background: "linear-gradient(90deg,#e63946,#9b2dca)" }} className="w-full py-2 text-center text-xs font-semibold tracking-widest text-white">
        ⚡ Flash sale ending soon — {viewers.toLocaleString()} members active today &nbsp;|&nbsp; Spots filling fast ⚡
      </div>

      {/* Hero — matching attached image style */}
      <div className="text-center px-6 pt-10 pb-6">
        <h1 className="font-extrabold text-[#1a237e] leading-tight" style={{ fontSize: "clamp(48px,8vw,80px)", letterSpacing: "-0.01em" }}>
          Elite Deals Hub
        </h1>
        <p className="mt-3 text-gray-800" style={{ fontSize: "clamp(16px,2.5vw,22px)" }}>
          <strong>Curated deals</strong> by industry experts.{" "}
          <strong>Limited quantities·</strong> <strong>Act fast!</strong>
        </p>

        {/* Trust pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-5 max-w-lg mx-auto">
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold border bg-amber-50 border-amber-300 text-amber-800">
            Curated by experts
          </span>
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold border bg-green-50 border-green-300 text-green-700">
            Verified authentic
          </span>
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold border bg-blue-50 border-blue-300 text-blue-700">
            Trusted by thousands
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto px-4">
        {[
          { icon: "✅", label: "Verified", desc: "Every product vetted", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
          { icon: "⭐", label: "4.9/5 Rating", desc: "78K+ reviews", color: "#92400e", bg: "#fefce8", border: "#fde68a" },
          { icon: "🏆", label: "#1 Marketplace", desc: "Industry leader", color: "#5b21b6", bg: "#faf5ff", border: "#ddd6fe" },
          { icon: "🔒", label: "Bank-Level", desc: "256-bit encryption", color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 text-center border" style={{ background: s.bg, borderColor: s.border }}>
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-sm font-bold mb-0.5" style={{ color: s.color }}>{s.label}</div>
            <div className="text-xs text-gray-500">{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Live bar */}
      <div className="max-w-lg mx-auto px-4 mt-4">
        <div className="rounded-xl px-6 py-3.5 flex justify-around items-center bg-gray-50 border border-gray-200">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
            <span className="font-bold text-gray-900">{viewers.toLocaleString()}</span>
            <span className="text-gray-500">live viewers</span>
          </div>
          <div className="w-px bg-gray-200 h-7"></div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full animate-pulse bg-blue-500" style={{ animationDelay: "0.4s" }}></div>
            <span className="font-bold text-gray-900">{orders.toLocaleString()}</span>
            <span className="text-gray-500">orders this hour</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center px-4 mt-7 pb-2">
        <div className="inline-block text-2xl font-extrabold px-7 py-2 rounded-xl mb-1.5 bg-green-50 border border-green-200 text-green-700">
          $6.2M+ Saved by Members
        </div>
        <div className="text-xs mb-5 text-gray-500">this month alone</div>
        <button
          className="text-white text-base font-bold px-12 py-4 rounded-full cursor-pointer transition-transform hover:scale-105 shadow-lg"
          style={{ background: "linear-gradient(135deg,#1a237e,#3949ab)", border: "none", animation: "ctapulse 2.5s infinite" }}
          onClick={() => { const b = document.querySelector('[data-chat-button]') as HTMLElement; if (b) b.click(); }}
        >
          Claim My Exclusive Access →
        </button>
        <div className="mt-3 text-xs text-gray-500">
          <span className="text-green-600 font-semibold">98.7%</span> of members got more than they expected &nbsp;|&nbsp; No credit card required
        </div>
      </div>

      {/* Guarantee */}
      <div className="max-w-lg mx-auto px-4 mt-6">
        <div className="rounded-xl px-5 py-4 flex gap-4 items-start bg-amber-50 border border-amber-200">
          <div className="text-2xl flex-shrink-0 mt-0.5">🏅</div>
          <div>
            <div className="text-sm font-bold mb-1 text-amber-800">100% Satisfaction Guarantee</div>
            <div className="text-xs leading-relaxed text-gray-600">
              Not happy? We'll make it right — full refund, zero questions asked. We take on all the risk so you don't have to.
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="max-w-2xl mx-auto px-4 mt-5 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { text: `"Saved $340 on my first order. Everything arrived exactly as described — total game changer."`, author: "James T. — Verified Buyer" },
            { text: `"Best marketplace I've used. The curation is insane — every deal is actually worth it."`, author: "Priya M. — Member since 2024" },
            { text: `"Saved over $1,200 this year. The security and authenticity checks give me total peace of mind."`, author: "Marcus R. — Elite Member" },
          ].map((r) => (
            <div key={r.author} className="rounded-xl p-4 bg-gray-50 border border-gray-200">
              <div className="text-xs mb-1.5 text-yellow-500">★★★★★</div>
              <div className="text-xs leading-relaxed mb-2 text-gray-700">{r.text}</div>
              <div className="text-xs font-medium text-gray-500">{r.author}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer strip */}
      <div className="text-center py-2.5 text-xs bg-gray-50 border-t border-gray-200 text-gray-500">
        <span className="text-green-600">✓</span> Every Deal Verified &nbsp;•&nbsp; No Fake Offers &nbsp;•&nbsp; Secure Checkout &nbsp;•&nbsp; 24/7 Support
      </div>

      <style>{`
        @keyframes ctapulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(26,35,126,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(26,35,126,0); }
        }
      `}</style>
    </header>
  );
}
