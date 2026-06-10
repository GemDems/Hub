import { useState, useEffect, useRef, useCallback } from "react";
import { X, ShoppingCart, Zap, Lock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { AffiliateLink } from "@shared/schema";

interface Props {
  links: AffiliateLink[];
  startIndex: number;
  onClose: () => void;
}

function getFirstImage(link: AffiliateLink): string | null {
  if (link.imageUrls && link.imageUrls.length > 0) {
    const filtered = link.imageUrls.filter(u => u?.trim());
    if (filtered.length > 0) return filtered[0];
  }
  if (link.imageUrl?.trim()) return link.imageUrl;
  return null;
}

function SideCard({ link }: { link: AffiliateLink }) {
  const img = getFirstImage(link);
  const price = link.price?.trim() || "$99";
  return (
    <div
      className="rounded-3xl overflow-hidden bg-gray-900 shadow-2xl w-full"
      style={{ aspectRatio: "9/16" }}
    >
      {img ? (
        <div className="relative w-full h-full">
          <img src={img} alt={link.title} className="w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 40%, transparent 75%)" }}
          />
          <div className="absolute bottom-4 left-3 right-3">
            <div className="text-white text-xs font-bold truncate">{link.title}</div>
            <div className="text-green-400 text-xs font-semibold">{price}</div>
          </div>
        </div>
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center gap-2 p-3"
          style={{ background: "linear-gradient(135deg, #1e3a8a, #7c3aed)" }}
        >
          <span className="text-4xl">💎</span>
          <span className="text-white text-[11px] font-bold text-center line-clamp-3">{link.title}</span>
        </div>
      )}
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
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goTo(idx + 1);
      if (e.key === "ArrowLeft") goTo(idx - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [idx, goTo]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleCTA = () => {
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
      style={{ zIndex: 9999, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
      onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        const dx = touchX.current - e.changedTouches[0].clientX;
        if (Math.abs(dx) < 8) { onClose(); return; }
        if (dx > 40) goTo(idx + 1);
        else if (dx < -40) goTo(idx - 1);
      }}
    >
      {hasPrev && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            width: "min(82vw, 380px)",
            transform: "translateY(-50%) translateX(-65%)",
            filter: "brightness(0.28) blur(2px)",
            transformOrigin: "right center",
            cursor: "pointer",
            zIndex: 1,
          }}
          onClick={e => { e.stopPropagation(); goTo(idx - 1); }}
        >
          <SideCard link={links[idx - 1]} />
        </div>
      )}

      {hasNext && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            width: "min(82vw, 380px)",
            transform: "translateY(-50%) translateX(65%)",
            filter: "brightness(0.28) blur(2px)",
            transformOrigin: "left center",
            cursor: "pointer",
            zIndex: 1,
          }}
          onClick={e => { e.stopPropagation(); goTo(idx + 1); }}
        >
          <SideCard link={links[idx + 1]} />
        </div>
      )}

      <div
        className="relative flex flex-col"
        style={{ width: "min(88vw, 390px)", maxHeight: "94vh", zIndex: 10 }}
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
        <div className="flex gap-[3px] mb-2 px-0.5">
          {segments.map(si => (
            <div
              key={si}
              className="flex-1 h-[3px] rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.25)" }}
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

        <button
          onClick={onClose}
          className="absolute top-5 right-1 z-50 w-9 h-9 flex items-center justify-center rounded-full text-white transition-all hover:scale-110 active:scale-95"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          <X className="w-5 h-5" />
        </button>

        <div
          className="rounded-3xl overflow-hidden bg-white shadow-2xl flex flex-col"
          style={{ maxHeight: "88vh" }}
        >
          <div className="relative flex-shrink-0" style={{ height: "min(58vw, 310px)", minHeight: 190 }}>
            <div className="absolute top-3 left-3 z-10">
              <span
                className="text-[11px] font-bold px-3 py-1.5 rounded-full text-white"
                style={{ background: "rgba(0,0,0,0.68)" }}
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

          <div className="p-5 flex flex-col gap-3 overflow-y-auto" style={{ flex: 1 }}>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{current.title}</h2>
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{current.description}</p>

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
    </div>
  );
}
