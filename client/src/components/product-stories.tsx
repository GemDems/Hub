import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import type { AffiliateLink } from "@shared/schema";

interface ProductStoriesProps {
  products: AffiliateLink[];
}

const STORY_DURATION = 6000;

const RING_GRADIENTS = [
  "linear-gradient(135deg,#f59e0b,#ef4444,#8b5cf6)",
  "linear-gradient(135deg,#06b6d4,#3b82f6,#8b5cf6)",
  "linear-gradient(135deg,#10b981,#06b6d4,#3b82f6)",
  "linear-gradient(135deg,#f97316,#ef4444,#ec4899)",
  "linear-gradient(135deg,#8b5cf6,#ec4899,#f59e0b)",
];

const BG_GRADIENTS = [
  "linear-gradient(135deg,#f59e0b,#ef4444)",
  "linear-gradient(135deg,#8b5cf6,#ec4899)",
  "linear-gradient(135deg,#06b6d4,#3b82f6)",
  "linear-gradient(135deg,#10b981,#059669)",
  "linear-gradient(135deg,#f97316,#eab308)",
];

function getFirstImage(link: AffiliateLink): string | null {
  if (link.imageUrls && link.imageUrls.length > 0) return link.imageUrls[0];
  return link.imageUrl || null;
}

function fmtPrice(price: string | null | undefined): string {
  if (!price) return "";
  const n = parseFloat(price.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? price : `$${n.toFixed(2)}`;
}

export default function ProductStories({ products }: ProductStoriesProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progRef = useRef(0);

  const published = products.filter((p) => !p.isDraft);
  const publishedLen = published.length;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const startTimer = useCallback(
    (idx: number) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      progRef.current = 0;
      setProgress(0);
      intervalRef.current = setInterval(() => {
        progRef.current += 100 / (STORY_DURATION / 100);
        const clamped = Math.min(progRef.current, 100);
        setProgress(clamped);
        if (clamped >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setOpenIndex((prev) => {
            if (prev === null) return null;
            return prev < publishedLen - 1 ? prev + 1 : null;
          });
        }
      }, 100);
    },
    [publishedLen]
  );

  useEffect(() => {
    if (openIndex !== null && !paused) {
      startTimer(openIndex);
    } else if (paused) {
      clearTimer();
    }
    return clearTimer;
  }, [openIndex, paused, startTimer, clearTimer]);

  if (publishedLen === 0) return null;

  const open = (i: number) => {
    setPaused(false);
    setOpenIndex(i);
  };

  const goNext = () => {
    if (openIndex === null) return;
    if (openIndex < published.length - 1) open(openIndex + 1);
    else setOpenIndex(null);
  };

  const goPrev = () => {
    if (openIndex === null) return;
    if (openIndex > 0) open(openIndex - 1);
  };

  const close = () => {
    clearTimer();
    setOpenIndex(null);
  };

  const current = openIndex !== null ? published[openIndex] : null;

  return (
    <>
      {/* ── Stories Row ─────────────────────────────────── */}
      <div
        className="w-full overflow-x-auto"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}
      >
        <style>{`.stories-row::-webkit-scrollbar{display:none}`}</style>
        <div className="stories-row flex gap-4 px-2 py-2 w-max">
          {published.map((product, i) => {
            const img = getFirstImage(product);
            return (
              <div
                key={product.id}
                className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0"
                style={{ width: 64 }}
                onClick={() => open(i)}
              >
                {/* Gradient ring */}
                <div
                  style={{
                    background: RING_GRADIENTS[i % RING_GRADIENTS.length],
                    borderRadius: "50%",
                    padding: 2.5,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: "#111",
                      border: "2px solid #fff",
                    }}
                  >
                    {img ? (
                      <img src={img} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: BG_GRADIENTS[i % BG_GRADIENTS.length] }} />
                    )}
                  </div>
                </div>
                {/* Name */}
                <span
                  className="text-center leading-tight font-medium"
                  style={{ fontSize: 9, color: "#374151", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {product.title.split(" ").slice(0, 3).join(" ")}
                </span>
                {/* Price */}
                {product.price && (
                  <span style={{ fontSize: 9, fontWeight: 800, color: "#16a34a" }}>{fmtPrice(product.price)}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Full-screen Story Viewer ─────────────────────── */}
      {openIndex !== null && current && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.97)" }}
        >
          <div
            className="relative flex flex-col w-full"
            style={{ maxWidth: 390, height: "100dvh", maxHeight: 820, margin: "auto" }}
          >
            {/* Progress bars */}
            <div className="flex gap-1 px-3 pt-5 pb-2">
              {published.map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full overflow-hidden"
                  style={{ height: 2.5, background: "rgba(255,255,255,0.25)" }}
                >
                  <div
                    style={{
                      height: "100%",
                      background: "white",
                      borderRadius: "9999px",
                      width:
                        i < openIndex
                          ? "100%"
                          : i === openIndex
                          ? `${progress}%`
                          : "0%",
                      transition: i === openIndex ? "none" : undefined,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header strip */}
            <div className="flex items-center justify-between px-4 pb-2">
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: BG_GRADIENTS[openIndex % BG_GRADIENTS.length],
                    flexShrink: 0,
                  }}
                >
                  {getFirstImage(current) && (
                    <img
                      src={getFirstImage(current)!}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </div>
                <span
                  style={{ color: "white", fontSize: 13, fontWeight: 700, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {current.title}
                </span>
              </div>
              <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <X style={{ width: 20, height: 20, color: "white" }} />
              </button>
            </div>

            {/* Image */}
            <div
              className="relative mx-3 rounded-2xl overflow-hidden"
              style={{ flex: 1, minHeight: 0 }}
              onMouseDown={() => setPaused(true)}
              onMouseUp={() => setPaused(false)}
              onTouchStart={() => setPaused(true)}
              onTouchEnd={() => setPaused(false)}
            >
              {getFirstImage(current) ? (
                <img
                  src={getFirstImage(current)!}
                  alt={current.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", background: BG_GRADIENTS[openIndex % BG_GRADIENTS.length] }} />
              )}

              {/* Invisible tap zones */}
              <div
                className="absolute inset-y-0 left-0"
                style={{ width: "40%", cursor: "pointer", zIndex: 2 }}
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
              />
              <div
                className="absolute inset-y-0 right-0"
                style={{ width: "40%", cursor: "pointer", zIndex: 2 }}
                onClick={(e) => { e.stopPropagation(); goNext(); }}
              />

              {/* Price tag */}
              {current.price && (
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(6px)",
                    borderRadius: 999,
                    padding: "4px 12px",
                    color: "#4ade80",
                    fontWeight: 800,
                    fontSize: 14,
                    zIndex: 3,
                  }}
                >
                  {fmtPrice(current.price)}
                </div>
              )}

              {/* Category badge */}
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  background: "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(6px)",
                  borderRadius: 999,
                  padding: "3px 10px",
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 10,
                  fontWeight: 600,
                  zIndex: 3,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {current.category}
              </div>
            </div>

            {/* Bottom info */}
            <div className="px-4 pt-3 pb-5 flex flex-col gap-2">
              <p style={{ color: "white", fontWeight: 800, fontSize: 16, lineHeight: 1.3, margin: 0 }}>
                {current.title}
              </p>
              {current.description && (
                <p
                  style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, lineHeight: 1.5, margin: 0 }}
                  className="line-clamp-2"
                >
                  {current.description}
                </p>
              )}
              <button
                onClick={() => window.open(current.url, "_blank")}
                style={{
                  width: "100%",
                  padding: "13px 0",
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 14,
                  color: "white",
                  background: "linear-gradient(135deg,#1d4ed8,#7c3aed)",
                  border: "none",
                  cursor: "pointer",
                  marginTop: 4,
                  letterSpacing: "0.01em",
                }}
              >
                🛒 Get This Deal Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
