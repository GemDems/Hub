import { useState, useEffect } from "react";
import type { AffiliateLink } from "@shared/schema";
import StoryViewer from "./story-viewer";

interface ProductStoriesProps {
  products: AffiliateLink[];
}

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
  const published = products.filter((p) => !p.isDraft);

  const [viewedIds, setViewedIds] = useState<Set<number>>(new Set());
  const [openId, setOpenId] = useState<number | null>(null);
  const [displayList, setDisplayList] = useState<AffiliateLink[]>([]);

  useEffect(() => {
    if (openId === null) {
      if (published.length >= 3) {
        const unviewed = published.filter((p) => !viewedIds.has(p.id));
        const viewed = published.filter((p) => viewedIds.has(p.id));
        setDisplayList([...unviewed, ...viewed]);
      } else {
        setDisplayList(published);
      }
    }
  }, [published.length, viewedIds, openId]);

  if (published.length === 0) return null;

  const list = displayList.length > 0 ? displayList : published;

  const handleOpen = (product: AffiliateLink) => {
    setViewedIds((prev) => new Set([...prev, product.id]));
    setOpenId(product.id);
  };

  const handleClose = () => {
    setOpenId(null);
  };

  const openStartIndex = openId !== null ? list.findIndex((p) => p.id === openId) : -1;

  return (
    <>
      <div
        className="w-full overflow-x-auto"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}
      >
        <style>{`.stories-row::-webkit-scrollbar{display:none}`}</style>
        <div className="stories-row flex gap-4 px-2 py-2 w-max">
          {list.map((product, i) => {
            const img = getFirstImage(product);
            const isViewed = viewedIds.has(product.id);
            const ringStyle = isViewed
              ? "2px solid #a8a8a8"
              : undefined;

            return (
              <div
                key={product.id}
                className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0"
                style={{ width: 64 }}
                onClick={() => handleOpen(product)}
              >
                <div
                  style={{
                    background: isViewed ? "transparent" : RING_GRADIENTS[i % RING_GRADIENTS.length],
                    borderRadius: "50%",
                    padding: isViewed ? 0 : 2.5,
                    border: isViewed ? "2px solid #a8a8a8" : undefined,
                    boxShadow: isViewed ? "none" : "0 2px 12px rgba(0,0,0,0.18)",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: "#111",
                      border: isViewed ? "2px solid #1c1c1e" : "2px solid #fff",
                    }}
                  >
                    {img ? (
                      <img src={img} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: BG_GRADIENTS[i % BG_GRADIENTS.length] }} />
                    )}
                  </div>
                </div>
                <span
                  className="text-center leading-tight font-medium"
                  style={{ fontSize: 9, color: "#374151", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {product.title.split(" ").slice(0, 3).join(" ")}
                </span>
                {product.price && (
                  <span style={{ fontSize: 9, fontWeight: 800, color: "#16a34a" }}>{fmtPrice(product.price)}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {openId !== null && openStartIndex >= 0 && (
        <StoryViewer
          links={list}
          startIndex={openStartIndex}
          onClose={handleClose}
        />
      )}
    </>
  );
}
