import { useState, useEffect, useRef, useCallback } from "react";
import { X, ShoppingCart, Zap, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { AffiliateLink } from "@shared/schema";

interface Props {
  links: AffiliateLink[];
  startIndex: number;
  onClose: () => void;
}

function getFirstImage(link: AffiliateLink): string | null {
  if (link.imageUrls && link.imageUrls.length > 0) {
    const f = link.imageUrls.filter(u => u?.trim());
    if (f.length > 0) return f[0];
  }
  if (link.imageUrl?.trim()) return link.imageUrl;
  return null;
}

function SideCard({ link, onClick }: { link: AffiliateLink; onClick: () => void }) {
  const img = getFirstImage(link);
  const price = link.price?.trim() || "$99";
  return (
    <div
      onClick={e => { e.stopPropagation(); onClick(); }}
      className="rounded-2xl overflow-hidden relative cursor-pointer flex-shrink-0 transition-all hover:opacity-90 hover:scale-[1.02]"
      style={{
        width: 168,
        height: 295,
        background: "#111",
        boxShadow: "0 8px 40px rgba(0,0,0,0.55)",
        opacity: 0.80,
      }}
    >
      {img ? (
        <img src={img} alt={link.title} className="w-full h-full object-cover" />
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center gap-2 p-3"
          style={{ background: "linear-gradient(135deg,#1e3a8a,#7c3aed)" }}
        >
          <span className="text-4xl">💎</span>
          <span className="text-white text-[11px] font-bold text-center line-clamp-3">{link.title}</span>
        </div>
      )}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 35%, transparent 65%)" }}
      />
      <div className="absolute bottom-3 left-3 right-3">
        <div className="flex items-center gap-1.5 mb-1">
          <div
            className="w-6 h-6 rounded-full overflow-hidden border border-white/70 flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#f97316,#ec4899)" }}
          >
            {img && <img src={img} alt="" className="w-full h-full object-cover" />}
          </div>
          <span className="text-white text-[10px] font-bold truncate leading-tight">
            {link.title.split(" ").slice(0, 3).join(" ")}
          </span>
        </div>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
          style={{ background: "#16a34a" }}
        >
          {price}
        </span>
      </div>
    </div>
  );
}

const DURATION = 10000;

export default function StoryViewer({ links, startIndex, onClose }: Props) {
  const [idx, setIdx] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchX = useRef(0);

  const current = links[idx];
  const hasPrev = idx > 0;
  const hasNext = idx < links.length - 1;
  const img = getFirstImage(current);
  const price = current.price?.trim() || "$99";

  const goTo = useCallback((newIdx: number) => {
    if (newIdx < 0 || newIdx >= links.length) { onClose(); return; }
    setIdx(newIdx);
    setProgress(0);
  }, [links.length, onClose]);

  useEffect(() => {
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const pct = Math.min(((Date.now() - start) / DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (idx < links.length - 1) goTo(idx + 1); else onClose();
      }
    }, 40);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [idx]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goTo(idx + 1);
      if (e.key === "ArrowLeft") goTo(idx - 1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [idx, goTo]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleCTA = (e: React.MouseEvent) => {
    e.stopPropagation();
    apiRequest("POST", `/api/affiliate-links/${current.id}/click`).catch(() => {});
    if ((window as any).updateSavingsProgress) {
      const n = parseFloat(price.replace(/[^0-9.]/g, "")) || 99;
      (window as any).updateSavingsProgress(n);
    }
    window.open(current.url, "_blank");
  };

  const segStart = Math.max(0, Math.min(idx - 4, links.length - 9));
  const segEnd = Math.min(links.length, segStart + 9);
  const segments = Array.from({ length: segEnd - segStart }, (_, i) => segStart + i);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 9999, background: "rgba(0,0,0,0.90)" }}
      onClick={onClose}
    >
      {/* ── Row layout ─── */}
      <div
        className="flex items-center"
        style={{ gap: 10 }}
        onClick={e => e.stopPropagation()}
        onTouchStart={e => { touchX.current = e.touches[0].clientX; e.stopPropagation(); }}
        onTouchEnd={e => {
          const dx = touchX.current - e.changedTouches[0].clientX;
          if (Math.abs(dx) < 8) return;
          if (dx > 40) goTo(idx + 1);
          else if (dx < -40) goTo(idx - 1);
          e.stopPropagation();
        }}
      >

        {/* ── Left: side card + arrow ── */}
        <div className="hidden sm:flex items-center flex-shrink-0" style={{ gap: 10 }}>
          <div style={{ width: 168, flexShrink: 0 }}>
            {hasPrev && <SideCard link={links[idx - 1]} onClick={() => goTo(idx - 1)} />}
          </div>
          <button
            onClick={e => { e.stopPropagation(); goTo(idx - 1); }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 flex-shrink-0"
            style={{
              background: hasPrev ? "rgba(255,255,255,0.22)" : "transparent",
              border: hasPrev ? "1.5px solid rgba(255,255,255,0.35)" : "none",
              opacity: hasPrev ? 1 : 0,
              pointerEvents: hasPrev ? "auto" : "none",
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* ── Center story card ── */}
        <div
          className="relative flex flex-col flex-shrink-0"
          style={{ width: "min(88vw, 390px)", maxHeight: "96vh" }}
        >
          {/* Progress segments */}
          <div className="flex gap-[3px] mb-2 px-0.5">
            {segments.map(si => (
              <div
                key={si}
                className="flex-1 h-[3px] rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.28)" }}
              >
                <div
                  className="h-full rounded-full bg-white"
                  style={{
                    width: si < idx ? "100%" : si === idx ? `${progress}%` : "0%",
                    transition: si === idx ? "none" : undefined,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Story header (above card) */}
          <div className="flex items-center justify-between mb-2 px-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2"
                style={{
                  borderColor: "rgba(255,255,255,0.6)",
                  background: "linear-gradient(135deg,#f97316,#ec4899,#8b5cf6)",
                }}
              >
                {img && <img src={img} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-bold leading-tight truncate" style={{ maxWidth: 200 }}>
                  {current.title}
                </p>
                <p className="text-white/55 text-[10px]">{current.category || "Hot Deal"} · now</p>
              </div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onClose(); }}
              className="w-8 h-8 flex items-center justify-center rounded-full text-white transition-all hover:bg-white/15 flex-shrink-0 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* White card */}
          <div
            className="rounded-3xl overflow-hidden bg-white shadow-2xl flex flex-col"
            style={{ flex: 1, maxHeight: "82vh", overflowY: "hidden" }}
          >
            {/* Image */}
            <div
              className="relative flex-shrink-0"
              style={{ height: "min(62vw, 340px)", minHeight: 190 }}
            >
              <div className="absolute top-3 left-3 z-10">
                <span
                  className="text-[11px] font-bold px-3 py-1.5 rounded-full text-white"
                  style={{ background: "rgba(0,0,0,0.65)" }}
                >
                  {current.category?.toUpperCase() || "HOT DEALS"}
                </span>
              </div>
              <div className="absolute top-3 right-3 z-10">
                <span
                  className="text-sm font-bold px-3 py-1.5 rounded-full text-white"
                  style={{ background: "#16a34a" }}
                >
                  {price}
                </span>
              </div>
              {img ? (
                <img src={img} alt={current.title} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#1e3a8a,#7c3aed)" }}
                >
                  <span className="text-6xl">💎</span>
                </div>
              )}
            </div>

            {/* Info + CTA */}
            <div className="p-5 flex flex-col gap-3" style={{ flex: 1, overflowY: "auto" }}>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">{current.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{current.description}</p>
              <button
                onClick={handleCTA}
                className="w-full text-white font-bold py-4 rounded-2xl text-base shadow-lg flex items-center justify-center gap-2 mt-auto transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}
              >
                <ShoppingCart className="w-5 h-5" />
                Get This Deal Now
                <Zap className="w-5 h-5" />
              </button>
              <div className="flex items-center justify-center gap-1 text-xs text-gray-400 pb-1">
                <Lock className="w-3 h-3 text-green-500" />
                <span>Secure · Verified · Instant access</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: arrow + side card ── */}
        <div className="hidden sm:flex items-center flex-shrink-0" style={{ gap: 10 }}>
          <button
            onClick={e => { e.stopPropagation(); goTo(idx + 1); }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 flex-shrink-0"
            style={{
              background: hasNext ? "rgba(255,255,255,0.22)" : "transparent",
              border: hasNext ? "1.5px solid rgba(255,255,255,0.35)" : "none",
              opacity: hasNext ? 1 : 0,
              pointerEvents: hasNext ? "auto" : "none",
            }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div style={{ width: 168, flexShrink: 0 }}>
            {hasNext && <SideCard link={links[idx + 1]} onClick={() => goTo(idx + 1)} />}
          </div>
        </div>
      </div>

      {/* Mobile tap zones (hidden on sm+) */}
      <div
        className="sm:hidden absolute inset-y-0 left-0"
        style={{ width: "30%", zIndex: 10 }}
        onClick={e => { e.stopPropagation(); goTo(idx - 1); }}
      />
      <div
        className="sm:hidden absolute inset-y-0 right-0"
        style={{ width: "30%", zIndex: 10 }}
        onClick={e => { e.stopPropagation(); goTo(idx + 1); }}
      />
    </div>
  );
}
