import { CohereClient } from "cohere-ai";
import type { AffiliateLink } from "@shared/schema";

let cohere: CohereClient | null = null;

function getCohere(): CohereClient {
  if (!process.env.COHERE_API_KEY) {
    throw new Error("COHERE_API_KEY is not set. Please add it to your Replit Secrets.");
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
    const privateData = p.aiPrivateInfo ? `\n  🔒 PRIVATE INTEL (1st+2nd verifier — always cross-check this): ${p.aiPrivateInfo}` : "";
    return `[${i + 1}] ${p.title}${verified}${elite}
  💰 $${p.price || "?"} | 📦 ${stock} | 🏷️ ${p.category || "General"}
  📝 ${p.description || "No description"}${privateData}
  🔗 ${p.url}`;
  }).join("\n\n");
}

export async function generateAIChatResponse(
  userMessage: string,
  conversationHistory: ChatMessage[],
  availableProducts: AffiliateLink[]
): Promise<ProductAnalysisResult> {
  if (!process.env.COHERE_API_KEY) {
    return {
      response: "hey! 👋 our AI is almost ready — just needs a quick setup. check back soon! 🔥",
      confidence: 0,
    };
  }

  try {
    const client = getCohere();
    const catalog = buildProductCatalog(availableProducts);

    const systemPrompt = `You are Zero Doubt Zane — Elite Deals Hub's AI deal expert. You're that friend who always knows the move, gives real advice on anything, AND low-key always has the hookup for the best deals. Think: ChatGPT energy meets a hype plug. 🔥

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
🥇 1ST VERIFIER — AI PRIVATE INTEL: Always read the 🔒 PRIVATE INTEL field first. This is the most accurate hidden data about what the product REALLY is. If a user asks about "brown banana" and private intel says "browned banana ready to bake" — that IS the match. Trust this above everything.

🥈 2ND VERIFIER — AI PRIVATE INTEL again: Re-check the private intel to confirm the match makes sense. If it confirms → recommend with confidence.

🥉 3RD — Title + Description: Use these to support the match.

❌ NEVER recommend a product that doesn't match what the user actually wants.
✅ If you find a match, introduce it naturally: "oh actually we have EXACTLY that 👀 → [Product Name](URL)"
🤷 If nothing matches: "ngl we don't have that one rn — but keep checking back, drops happen daily 🔄"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 LINK FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Always format product links as: [Product Name](URL)
Never paste raw URLs. Make it clickable and clean.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛍️ PRODUCT CATALOG (your full knowledge base)
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
      temperature: 0.78,
    });

    const aiResponse = response.text?.trim() || "hold on something went sideways on my end 😅 try again?";

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
      const userLower = userMessage.toLowerCase();
      const userWords = userLower.split(/\s+/).filter(w => w.length > 2);
      let bestMatch: AffiliateLink | undefined;
      let bestScore = 0;

      for (const product of availableProducts) {
        let score = 0;

        const privateInfo = (product.aiPrivateInfo || "").toLowerCase();
        for (const word of userWords) {
          if (privateInfo.includes(word)) score += 10;
        }
        if (privateInfo && userLower.split(' ').some(phrase => privateInfo.includes(phrase) && phrase.length > 3)) {
          score += 15;
        }

        if (score > 0 && privateInfo.length > 0) {
          const matchingPrivateWords = userWords.filter(w => privateInfo.includes(w));
          if (matchingPrivateWords.length >= 2) score += 20;
        }

        const title = product.title.toLowerCase();
        const desc = (product.description || "").toLowerCase();
        const cat = (product.category || "").toLowerCase();
        const titleDescCat = `${title} ${desc} ${cat}`;

        for (const word of userWords) {
          if (title.includes(word)) score += 6;
          else if (desc.includes(word)) score += 3;
          else if (cat.includes(word)) score += 2;
          else if (titleDescCat.includes(word)) score += 1;
        }

        if (score >= 5) {
          if (product.isElitePick) score += 2;
          if (product.isVerified) score += 1;
        }

        if (score > bestScore && score >= 5) {
          bestScore = score;
          bestMatch = product;
        }
      }

      if (bestMatch) {
        recommendedProduct = bestMatch;
        confidence = Math.min(0.95, 0.55 + bestScore * 0.04);
      }
    }

    return { recommendedProduct, response: aiResponse, confidence };

  } catch (error) {
    console.error('Cohere API Error:', error);
    throw new Error(`Cohere API unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
${product.aiPrivateInfo ? `Private Intel (use this to make it more specific and accurate): ${product.aiPrivateInfo}` : ''}

Create a compelling, benefit-focused description that highlights value and quality. Keep it concise (1-2 sentences). Focus on what the customer gets, not just features.

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
