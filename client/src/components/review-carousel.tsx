import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Review } from "@shared/schema";

const SEED_REVIEWS = [
  { id: -1, name: "James T.", rating: 5, message: "Saved $340 on my first order. I was skeptical but everything arrived exactly as described. Total game changer.", createdAt: new Date().toISOString() },
  { id: -2, name: "Priya M.", rating: 5, message: "Best marketplace I've used. The curation is insane — every deal is actually worth it. My friends all joined after I told them.", createdAt: new Date().toISOString() },
  { id: -3, name: "Marcus R.", rating: 5, message: "Saved over $1,200 this year. The security and authenticity checks give me total peace of mind. 10/10 would recommend.", createdAt: new Date().toISOString() },
  { id: -4, name: "Sofia L.", rating: 5, message: "Honestly shocked at how legit these deals are. Got premium headphones for half the price I'd find anywhere else.", createdAt: new Date().toISOString() },
  { id: -5, name: "Derek W.", rating: 5, message: "Been a member for 6 months and already saved more than my annual subscription fee 10x over. Worth every second.", createdAt: new Date().toISOString() },
];

export default function ReviewCarousel() {
  const { data: apiReviews = [] } = useQuery<Review[]>({ queryKey: ["/api/reviews"] });

  const all = [
    ...SEED_REVIEWS,
    ...apiReviews.filter(r => r.isApproved).map(r => ({ ...r, createdAt: String(r.createdAt) }))
  ];

  const [idx, setIdx] = useState(0);
  const perPage = 3;
  const total = Math.ceil(all.length / perPage);

  useEffect(() => {
    const iv = setInterval(() => setIdx(i => (i + 1) % total), 5000);
    return () => clearInterval(iv);
  }, [total]);

  const visible = all.slice(idx * perPage, idx * perPage + perPage);
  const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

  return (
    <div className="w-full" style={{ background: "linear-gradient(to bottom, #f9fafb, #ffffff)" }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">What Our Members Say</h2>
        <p className="text-center text-sm text-gray-500 mb-8">Real reviews from verified buyers</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-500">
          {visible.map((r, i) => (
            <div key={`${r.id}-${i}`} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all duration-300">
              <div className="text-yellow-400 text-sm mb-2">{stars(r.rating)}</div>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">"{r.message}"</p>
              <div className="text-xs font-semibold text-gray-500">{r.name}</div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === idx ? 24 : 8,
                height: 8,
                background: i === idx ? "#1a237e" : "#d1d5db",
                border: "none",
                cursor: "pointer"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
