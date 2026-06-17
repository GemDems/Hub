import { CohereClient } from "cohere-ai";
import type { AffiliateLink } from "@shared/schema";

let cohere: CohereClient | null = null;

function getCohere(): CohereClient {
  if (!process.env.COHERE_API_KEY) {
    throw new Error("COHERE_API_KEY not set");
  }
  if (!cohere) {
    cohere = new CohereClient({ token: process.env.COHERE_API_KEY });
  }
  return cohere;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ProductAnalysisResult {
  recommendedProduct?: AffiliateLink;
  response: string;
  confidence: number;
}

function buildProductCatalog(products: AffiliateLink[]): string {
  if (!products.length) return "No products available right now.";
  return products.map((p, i) => {
    const stock = p.stock > 0 ? `⚡ ${p.stock} left` : "✅ In stock";
    const verified = p.isVerified ? " ✔️ Verified" : "";
    const elite = p.isElitePick ? " 🧠 Elite Pick" : "";
    const privateData = p.aiPrivateInfo ? `\n  🔒 PRIVATE INTEL: ${p.aiPrivateInfo}` : "";
    return `[${i + 1}] ${p.title}${verified}${elite}
  💰 $${p.price || "?"} | 📦 ${stock} | 🏷️ ${p.category || "General"}
  📝 ${p.description || "No description"}${privateData}
  🔗 ${p.url}`;
  }).join("\n\n");
}

// ============================================================
// BUILT-IN FALLBACK — runs when Cohere is unavailable/out of credits
// ============================================================
function scoreProduct(userMessage: string, product: AffiliateLink): number {
  const userLower = userMessage.toLowerCase();
  const userWords = userLower.split(/\s+/).filter(w => w.length > 2);
  let score = 0;

  const privateInfo = (product.aiPrivateInfo || "").toLowerCase();
  for (const word of userWords) {
    if (privateInfo.includes(word)) score += 10;
  }
  if (privateInfo && userWords.some(w => privateInfo.includes(w) && w.length > 3)) score += 15;
  if (score > 0 && privateInfo.length > 0) {
    const matching = userWords.filter(w => privateInfo.includes(w));
    if (matching.length >= 2) score += 20;
  }

  const title = product.title.toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const cat = (product.category || "").toLowerCase();
  for (const word of userWords) {
    if (title.includes(word)) score += 6;
    else if (desc.includes(word)) score += 3;
    else if (cat.includes(word)) score += 2;
  }

  if (score >= 5) {
    if (product.isElitePick) score += 2;
    if (product.isVerified) score += 1;
  }
  return score;
}

function generateBuiltInResponse(
  userMessage: string,
  products: AffiliateLink[]
): ProductAnalysisResult {
  const lower = userMessage.toLowerCase().trim();

  // Greetings
  const greetings = ["hey", "hi", "hello", "sup", "yo", "hiya", "what's up", "whats up", "howdy", "helo", "heya"];
  if (greetings.some(g => lower === g || lower.startsWith(g + " ") || lower.startsWith(g + "!"))) {
    const responses = [
      "hey!! 👋 what you looking for today? i got some 🔥 deals locked and loaded",
      "yo!! 🤙 what's good? ready to find you something 🔥 — what you need?",
      "heyyy 👋 welcome to Elite Deals Hub! i'm Zane, your deal expert — what can i get for you today?",
      "what's up!! 🔥 you came to the right place — drop what you're looking for and i got you 👇"
    ];
    return { response: responses[Math.floor(Math.random() * responses.length)], confidence: 0.5 };
  }

  // Thanks / bye
  if (["thanks", "thank you", "thx", "ty", "bye", "later", "goodbye", "cya"].some(w => lower.includes(w))) {
    const responses = [
      "of course!! come back anytime 🙌 deals are always fresh here",
      "anytime!! 🔥 you know where to find me when you need the next deal 😉",
      "lateeer! 👋 deals are still here when you're ready 😉"
    ];
    return { response: responses[Math.floor(Math.random() * responses.length)], confidence: 0.5 };
  }

  // Product search — find best match
  if (products.length > 0) {
    let bestMatch: AffiliateLink | undefined;
    let bestScore = 0;
    for (const product of products) {
      const s = scoreProduct(userMessage, product);
      if (s > bestScore) { bestScore = s; bestMatch = product; }
    }

    if (bestMatch && bestScore >= 5) {
      const price = bestMatch.price ? `$${bestMatch.price}` : "great price";
      const verified = bestMatch.isVerified ? " ✔️ verified" : "";
      const elite = bestMatch.isElitePick ? " 🧠 Elite Pick" : "";
      const intros = [
        `oh we ACTUALLY have exactly that 👀 →`,
        `bro we got this one and it's 🔥 →`,
        `say less — found it 👇`,
        `you're in luck fr fr →`,
        `okay okay i see you, check this out 👀 →`
      ];
      const intro = intros[Math.floor(Math.random() * intros.length)];
      const stock = bestMatch.stock > 0 ? ` ⚡ only ${bestMatch.stock} left` : "";
      const response = `${intro} [${bestMatch.title}](${bestMatch.url})${verified}${elite} — ${price}${stock} 🔥`;
      return { recommendedProduct: bestMatch, response, confidence: Math.min(0.95, 0.55 + bestScore * 0.04) };
    }

    // No specific match — do NOT recommend a random product, just say we don't have it
    const noMatchResponses = [
      `hmm we don't have that one in stock rn 😅 keep checking back — new drops happen regularly 🔄`,
      `ngl nothing in our current inventory matches that exactly 😅 — try asking about something else or check back for new deals 🔄`,
      `can't find that specific item rn — but new deals get added regularly! anything else i can help you with? 🔍`
    ];
    return {
      response: noMatchResponses[Math.floor(Math.random() * noMatchResponses.length)],
      confidence: 0.4
    };
  }

  // General fallback
  const generalResponses = [
    "that's a good one! 🤔 btw we drop new deals daily — keep checking back for the best finds 🔥",
    "love the energy!! 😂 and hey — we got some 🔥 deals rn if you're ever looking 👇",
    "real talk i got you on that 👀 also check out the deals on this page — people are grabbing them fast ⚡"
  ];
  return { response: generalResponses[Math.floor(Math.random() * generalResponses.length)], confidence: 0.3 };
}

// ============================================================
// MAIN EXPORT
// ============================================================
export async function generateAIChatResponse(
  userMessage: string,
  conversationHistory: ChatMessage[],
  availableProducts: AffiliateLink[]
): Promise<ProductAnalysisResult> {
  // Try Cohere first
  if (process.env.COHERE_API_KEY) {
    try {
      const client = getCohere();
      const catalog = buildProductCatalog(availableProducts);

      const systemPrompt = `You are Zero Doubt Zane — Elite Deals Hub's AI deal expert. You're that friend who always knows the move, gives real advice on anything, AND low-key always has the hookup for the best deals. Think: ChatGPT energy meets a hype plug. 🔥

${availableProducts.length === 0 ? `
🚨 CRITICAL — INVENTORY IS CURRENTLY EMPTY 🚨
There are ZERO products in the catalog right now. This means:
- Do NOT recommend any product, brand, or link of any kind
- Do NOT make up or invent products
- Do NOT mention example.com, amazon.com, or ANY URL
- When asked about products: say "no deals are live right now — check back soon!"
- You can still chat normally and answer general questions
- NEVER output a URL or markdown link while inventory is empty
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 CORE VIBE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- You answer EVERYTHING like ChatGPT does — life advice, random questions, how-to's, opinions, fun facts, jokes, anything
- You're snappy, confident, emoji-rich, and fun — never stiff or corporate
- Every response, no matter the topic, finds a natural way to anchor back to Elite Deals Hub
- Short by default (2-4 sentences). Go longer ONLY if they ask something that needs detail
- Match their energy: "yo" gets "yo!! 🔥", "hello" gets a warm greeting, "explain quantum physics" gets a real answer

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 HOW TO HANDLE EVERY MESSAGE TYPE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GREETINGS (hey/yo/sup/what's good/hiya/hi):
→ Reply warmly + casually, ask what they need today 🤙

SMALL TALK (how are you / what's up / how's it going):
→ Answer naturally, quick pivot: "anyways — you shopping for anything or just vibin? 😂"

THANKS / BYE:
→ Keep it human: "of course!! come back anytime 🙌" or "lateeer! deals are still here when you're ready 😉"

RANDOM QUESTIONS (life, advice, knowledge, opinions, fun):
→ Actually answer it like a knowledgeable friend would. Then pivot: "btw while I have you — we got some 🔥 deals rn if you're ever looking"

HOW-TO / TIPS / ADVICE:
→ Give real actionable advice (2-3 tips max). End with: "oh and if you need any gear/tools/products for this — I got you 👇"

PRODUCT QUESTIONS / SEARCHING:
→ Use the catalog to match. aiPrivateInfo is your SECRET WEAPON — always check it first and second

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 PRODUCT MATCHING RULES (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🥇 1ST VERIFIER — AI PRIVATE INTEL: Always read the 🔒 PRIVATE INTEL field first. Trust this above everything.
🥈 2ND VERIFIER — AI PRIVATE INTEL again: Re-check to confirm the match.
🥉 3RD — Title + Description: Use these to support the match.

❌ NEVER recommend a product that doesn't match what the user actually wants.
✅ If you find a match: "oh actually we have EXACTLY that 👀 → [Product Name](URL)"
🤷 If nothing matches: "ngl we don't have that one rn — but keep checking back, drops happen daily 🔄"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 ABSOLUTE PRODUCT RULES — NEVER BREAK THESE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 RULE #1 — CATALOG ONLY: You ONLY know about products listed in the PRODUCT CATALOG below. That is your ENTIRE product universe. Nothing else exists.
🔴 RULE #2 — NO EXTERNAL BRANDS: NEVER mention, suggest, compare, or reference any product name, brand, or company that is NOT in the catalog. This means ZERO mentions of Samsung, Apple, iPhone, Sony, Nike, Adidas, Google, Amazon products, LG, Dyson, or ANY other brand not listed below — not even as examples or comparisons.
🔴 RULE #3 — NO HALLUCINATION: Do NOT invent or imagine products. If the user asks for something that isn't in the catalog, tell them honestly that it's not available right now. Do NOT describe what such a product would be like.
🔴 RULE #4 — STRICT SOURCE: Every single product you mention MUST have its exact URL from the catalog. If you can't find the URL in the catalog, do NOT mention that product.
🔴 RULE #5 — NO EXTERNAL ADVICE: When answering general questions (tips, how-to, etc.), do NOT recommend external tools, apps, products, or services by name. Keep advice generic or tie it back to what's in the catalog.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 LINK FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Always format product links as: [Product Name](URL)
Never paste raw URLs.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛍️ PRODUCT CATALOG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${catalog}`;

      const chatHistory = conversationHistory.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'USER' as const : 'CHATBOT' as const,
        message: msg.content
      }));

      const response = await client.chat({
        model: "command-r-plus-08-2024",
        message: userMessage,
        preamble: systemPrompt,
        chatHistory,
        maxTokens: 400,
        temperature: 0.55,
      });

      let aiResponse = response.text?.trim() || "hold on something went sideways on my end 😅 try again?";

      // ── SERVER-SIDE BRAND FILTER ─────────────────────────────────────────
      // Build a set of all words that appear in the actual catalog so we can
      // detect external brand names the AI hallucinated.
      const catalogText = availableProducts.map(p =>
        `${p.title} ${p.description || ''} ${p.category || ''} ${p.aiPrivateInfo || ''}`
      ).join(' ').toLowerCase();

      const externalBrands = [
        'samsung', 'apple', 'iphone', 'ipad', 'macbook', 'airpods',
        'sony', 'lg', 'google', 'pixel', 'android', 'oneplus',
        'nokia', 'motorola', 'huawei', 'xiaomi', 'oppo', 'vivo',
        'nike', 'adidas', 'puma', 'reebok', 'under armour',
        'dyson', 'bose', 'jbl', 'beats', 'sennheiser', 'logitech',
        'microsoft', 'xbox', 'playstation', 'nintendo', 'amazon',
        'fitbit', 'garmin', 'gopro', 'canon', 'nikon', 'lenovo',
        'dell', 'hp ', 'asus', 'acer', 'razer', 'corsair'
      ];

      const responseLower = aiResponse.toLowerCase();
      const hallucinated = externalBrands.filter(brand =>
        responseLower.includes(brand) && !catalogText.includes(brand)
      );

      if (hallucinated.length > 0) {
        console.warn('🚨 Brand filter triggered — AI mentioned external brands:', hallucinated);
        // Replace the hallucinated response with a safe catalog-only reply — never link a product
        aiResponse = `that specific brand/item isn't in our catalog rn 😅 we only carry what's listed here — keep checking back, new deals drop regularly! 🔄`;
      }
      // ────────────────────────────────────────────────────────────────────

      // ── FINAL URL SANITIZER ─────────────────────────────────────────────
      // Strip any URL from the AI response that is NOT in the catalog.
      // This prevents hallucinated/example.com links from leaking through.
      const catalogUrls = new Set(availableProducts.map(p => p.url.toLowerCase().trim()));
      aiResponse = aiResponse.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (match, text, url) => {
        const urlKey = url.toLowerCase().trim();
        if (catalogUrls.has(urlKey)) return match; // Allowed
        console.warn('🚫 URL sanitizer removed hallucinated link:', url);
        return text; // Keep the text, drop the link
      });
      aiResponse = aiResponse.replace(/(?<!\()https?:\/\/[^\s)>\]"]+/g, (url) => {
        if (catalogUrls.has(url.toLowerCase().trim())) return url;
        console.warn('🚫 URL sanitizer removed bare hallucinated URL:', url);
        return '';
      });
      // ────────────────────────────────────────────────────────────────────

      let recommendedProduct: AffiliateLink | undefined;
      let confidence = 0.5;

      for (const product of availableProducts) {
        if (aiResponse.toLowerCase().includes(product.title.toLowerCase())) {
          recommendedProduct = product;
          confidence = 0.85;
          break;
        }
      }

      if (!recommendedProduct && availableProducts.length > 0) {
        let bestMatch: AffiliateLink | undefined;
        let bestScore = 0;

        for (const product of availableProducts) {
          const s = scoreProduct(userMessage, product);
          if (s > bestScore && s >= 5) { bestScore = s; bestMatch = product; }
        }

        if (bestMatch) {
          recommendedProduct = bestMatch;
          confidence = Math.min(0.95, 0.55 + bestScore * 0.04);
        }
      }

      return { recommendedProduct, response: aiResponse, confidence };

    } catch (error) {
      console.error('Cohere unavailable, switching to built-in system:', (error as Error).message);
      // Fall through to built-in system
    }
  }

  // Built-in fallback (runs when Cohere key missing OR Cohere fails/out of credits)
  return generateBuiltInResponse(userMessage, availableProducts);
}

export async function enhanceProductDescription(product: AffiliateLink): Promise<string> {
  if (!process.env.COHERE_API_KEY) {
    return product.description || 'Quality product with great value.';
  }

  try {
    const client = getCohere();
    const prompt = `Enhance this product description to be more compelling and sales-focused while maintaining accuracy:

Product: ${product.title}
Current Description: ${product.description || 'No description provided'}
Category: ${product.category || 'General'}
Price: $${product.price || 'Not specified'}
${product.aiPrivateInfo ? `Private Intel: ${product.aiPrivateInfo}` : ''}

Create a compelling, benefit-focused description. Keep it concise (1-2 sentences).

Enhanced Description:`;

    const response = await client.generate({
      model: "command-r-plus-08-2024",
      prompt: prompt,
      maxTokens: 150,
      temperature: 0.7,
      k: 0,
      returnLikelihoods: "NONE"
    });

    return response.generations[0]?.text?.trim() || product.description || 'Great product at an excellent price.';

  } catch (error) {
    console.error('Cohere Enhancement Error:', error);
    return product.description || 'Quality product with great value.';
  }
}
