import { useState, useEffect, useRef, useCallback } from "react";

interface LiveStats {
  viewers: number;
  hourlyBuyers: number;
  timestamp: number;
}

const ALL_REVIEWS = [
  { text: `"Saved $340 on my first order. Was skeptical at first but this is the real deal — everything arrived exactly as described."`, author: "tyler", badge: "Verified Buyer" },
  { text: `"Best marketplace I've used. The curation is insane — every deal is actually worth it. My friends all joined after I told them."`, author: "brittany", badge: "Member since 2023" },
  { text: `"Legit saved over $1,200 this year. The security and authenticity checks give me total peace of mind. 10/10."`, author: "nathan", badge: "Elite Member" },
  { text: `"I don't usually leave reviews but this place genuinely surprised me. Got a $200 item for $58. No catches."`, author: "ashley", badge: "Verified Buyer" },
  { text: `"Scored noise-cancelling headphones for basically nothing. My coworkers keep asking where I got them lol."`, author: "derek", badge: "Member since 2024" },
  { text: `"Thought it was too good to be true. It's not. Third order and everything's been perfect."`, author: "kayla", badge: "Verified Buyer" },
  { text: `"The AI assistant helped me find exactly what I needed in like 30 seconds. Low-key the best feature."`, author: "mike", badge: "Elite Member" },
  { text: `"Got my whole Christmas shopping done for half price. Everyone was asking where I found this stuff."`, author: "sarah", badge: "Member since 2023" },
  { text: `"Wasn't sure about signing up but the guarantee made me feel safe. Glad I did — absolute steal."`, author: "jake", badge: "Verified Buyer" },
  { text: `"Used to spend hours looking for deals. This just shows me the good ones. My time is worth something."`, author: "amanda", badge: "Member since 2024" },
  { text: `"Omar vouched for this and now I'm vouching for it. Saved $80 my first week."`, author: "chris", badge: "Verified Buyer" },
  { text: `"Finally a marketplace that doesn't feel sketchy. Everything is legit and the prices are wild."`, author: "omar", badge: "Elite Member" },
  { text: `"Bought gym equipment at 60% off. Quality is exactly as listed. Zero complaints."`, author: "jessica", badge: "Member since 2024" },
  { text: `"My boyfriend sent me the link and I've been hooked since. Found stuff I didn't even know I needed."`, author: "megan", badge: "Verified Buyer" },
  { text: `"Three orders in, three wins. This thing is consistent which is rare."`, author: "ryan", badge: "Elite Member" },
];

export default function Header() {
  const getInitialCounts = () => {
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    const stored = localStorage.getItem("edh_live_counts");
    if (stored) {
      const { viewers, orders, resetAt } = JSON.parse(stored);
      if (Date.now() - resetAt < TWELVE_HOURS) {
        return { viewers, orders, resetAt };
      }
    }
    const base = Math.floor(Math.random() * 9000) + 1000;
    const counts = { viewers: base, orders: Math.floor(base * 0.35), resetAt: Date.now() };
    localStorage.setItem("edh_live_counts", JSON.stringify(counts));
    return counts;
  };

  const initial = getInitialCounts();
  const [viewers, setViewers] = useState(initial.viewers);
  const [orders, setOrders] = useState(initial.orders);
  const [reviewPage, setReviewPage] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const totalPages = Math.ceil(ALL_REVIEWS.length / 3);

  const goToPage = (next: number) => {
    setFadeIn(false);
    setTimeout(() => {
      setReviewPage(next);
      setFadeIn(true);
    }, 250);
  };

  const handleReviewScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      goToPage((reviewPage + 1) % totalPages);
    } else {
      goToPage((reviewPage - 1 + totalPages) % totalPages);
    }
  };

  const currentReviews = ALL_REVIEWS.slice(reviewPage * 3, reviewPage * 3 + 3);

  useEffect(() => {
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;

    const save = (v: number, o: number) => {
      const stored = localStorage.getItem("edh_live_counts");
      const resetAt = stored ? JSON.parse(stored).resetAt : Date.now();
      localStorage.setItem("edh_live_counts", JSON.stringify({ viewers: v, orders: o, resetAt }));
    };

    const checkReset = () => {
      const stored = localStorage.getItem("edh_live_counts");
      if (!stored) return;
      const { resetAt } = JSON.parse(stored);
      if (Date.now() - resetAt >= TWELVE_HOURS) {
        const base = Math.floor(Math.random() * 9000) + 1000;
        const newOrders = Math.floor(base * 0.35);
        localStorage.setItem("edh_live_counts", JSON.stringify({ viewers: base, orders: newOrders, resetAt: Date.now() }));
        setViewers(base);
        setOrders(newOrders);
      }
    };

    let tickCount = 0;

    const iv = setInterval(() => {
      tickCount++;
      checkReset();

      const isBigJump = tickCount % (Math.floor(Math.random() * 4) + 6) === 0;

      setViewers(v => {
        const bump = isBigJump
          ? Math.floor(Math.random() * 60) + 20
          : Math.floor(Math.random() * 3) + 1;
        const next = v + bump;
        setOrders(o => {
          const obump = isBigJump
            ? Math.floor(Math.random() * 12) + 4
            : (Math.random() < 0.65 ? 1 : 0);
          const onext = o + obump;
          save(next, onext);
          return onext;
        });
        return next;
      });
    }, 4000);

    return () => clearInterval(iv);
  }, []);

  const [topQuery, setTopQuery] = useState("");

  const handleTopSearch = () => {
    if (!topQuery.trim()) return;
    const input = document.querySelector('[data-chat-input]') as HTMLInputElement;
    const btn = document.querySelector('[data-chat-button]') as HTMLElement;
    if (input && btn) {
      input.value = topQuery;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      btn.click();
    } else {
      const mainInput = document.querySelector('input[placeholder="Search for deals..."]') as HTMLInputElement;
      if (mainInput) {
        mainInput.value = topQuery;
        mainInput.dispatchEvent(new Event("input", { bubbles: true }));
        mainInput.dispatchEvent(new KeyboardEvent("keypress", { key: "Enter", bubbles: true }));
      }
    }
  };

  return (
    <header style={{ background: "#0d0f1a" }} className="w-full overflow-hidden">
      {/* Flash sale ticker — untouched */}
      <div className="relative">
        <div style={{ background: "linear-gradient(90deg,#e63946,#9b2dca)" }} className="w-full py-2.5 text-center text-xs font-semibold tracking-widest text-white opacity-[0.01]">
          ⚡ FLASH SALE ENDING SOON — {viewers.toLocaleString()} MEMBERS ACTIVE TODAY &nbsp;|&nbsp; SPOTS FILLING FAST ⚡
        </div>
        {/* Conversion search bar overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center px-3"
          style={{ opacity: 0.93 }}
        >
          <div className="flex items-center w-full max-w-2xl rounded-full overflow-hidden"
            style={{
              background: "linear-gradient(135deg,#1a0533,#0d1a3a)",
              border: "1.5px solid rgba(124,58,237,0.55)",
              boxShadow: "0 0 18px rgba(124,58,237,0.25)",
            }}
          >
            <span className="pl-4 text-sm" style={{ color: "#a78bfa" }}>🔥</span>
            <input
              type="text"
              value={topQuery}
              onChange={e => setTopQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleTopSearch()}
              placeholder="Find your next deal — type anything..."
              className="flex-1 bg-transparent outline-none text-xs font-medium px-3 py-2.5"
              style={{ color: "#f3f4f6", caretColor: "#a78bfa" }}
            />
            <button
              onClick={handleTopSearch}
              className="px-5 py-2.5 text-xs font-bold text-white flex-shrink-0 transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
              FIND DEALS →
            </button>
          </div>
        </div>
      </div>
      {/* Hero */}
      <div className="text-center pt-10 pb-2 px-4">
        <div className="text-xs font-semibold tracking-[0.18em] mb-3" style={{ color: "#9b8fcb" }}>
          THE #1 PREMIUM MARKETPLACE
        </div>
        <h1 className="font-extrabold leading-none tracking-tight text-white" style={{ fontSize: "clamp(52px,9vw,88px)", letterSpacing: "-0.02em" }}>
          ELITE<br />
          <span style={{ color: "#00008B" }}>DEALS</span>
        </h1>
        <div className="mt-2 text-sm font-normal tracking-[0.2em]" style={{ color: "#9ca3af" }}>
          PREMIUM MARKETPLACE
        </div>
        {/* Trust pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-5 max-w-lg mx-auto">
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold border" style={{ background: "rgba(251,191,36,0.1)", borderColor: "rgba(251,191,36,0.3)", color: "#fbbf24" }}></span>
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold border" style={{ background: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.3)", color: "#22c55e" }}></span>
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold border" style={{ background: "rgba(96,165,250,0.1)", borderColor: "rgba(96,165,250,0.3)", color: "#60a5fa" }}></span>
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
            <div className="text-xs leading-relaxed" style={{ color: "#9ca3af" }}>Not happy? We'll make it right — If the deal isn't real, I'll personally find you a better one — or send it to you for free. We're so confident in Elite Deals that we take on all the risk so you don't have to. —elitedeals.edh@gmail.com</div>
          </div>
        </div>
      </div>
      {/* Reviews — 3 shown at a time, scroll to fade through all */}
      <div
        className="max-w-2xl mx-auto px-4 mt-5 pb-8"
        onWheel={handleReviewScroll}
        style={{ cursor: "ns-resize" }}
      >
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
          style={{
            opacity: fadeIn ? 1 : 0,
            transition: "opacity 0.25s ease",
          }}
        >
          {currentReviews.map((r) => (
            <div key={r.author + r.badge} className="rounded-xl p-4" style={{ background: "#151929", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-xs mb-1.5" style={{ color: "#fbbf24" }}>★★★★★</div>
              <div className="text-xs leading-relaxed mb-2" style={{ color: "#d1d5db" }}>{r.text}</div>
              <div className="text-xs font-medium" style={{ color: "#6b7280" }}>{r.author} — {r.badge}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              style={{
                width: i === reviewPage ? "18px" : "6px",
                height: "4px",
                borderRadius: "2px",
                background: i === reviewPage ? "#7c3aed" : "rgba(255,255,255,0.15)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            />
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
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </header>
  );
}
