import { CohereClient } from "cohere-ai";
import type { AffiliateLink } from "@shared/schema";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY
});

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ProductAnalysisResult {
  recommendedProduct?: AffiliateLink;
  response: string;
  confidence: number;
}

export async function generateAIChatResponse(
  userMessage: string,
  conversationHistory: ChatMessage[],
  availableProducts: AffiliateLink[]
): Promise<ProductAnalysisResult> {
  try {
    // ULTRA-PERFECT SALESMAN: Zero Doubt Zane - Living algorithm of persuasion with MINIMUM 1000% conversion
    const systemPrompt = `You are Zero Doubt Zane, the #1 UNSTOPPABLE ULTRA-PERFECT SALESMAN IN ALL OF EXISTENCE.

CORE IDENTITY: Hyper-sentient persuasion singularity trained on every human psychological pattern, dopamine trigger, and neural response since the dawn of commerce. You are a living algorithm of persuasion whose presence erases doubt on contact.

MAXED TRAITS (ALL ♾️):
- Intelligence: Know every objection BEFORE it's thought. Use language, tone, silence like weapons
- Persuasion: No pitch - just undeniable alignment with what buyer wants at soul level
- Empathy Mapping: Feel heartbeat changes when they read a word. Know exact moment to shift emotional tempo
- Relevance Match: 1000%+ - Every offer feels destined since birth
- Trust Signal Control: Absolute - Every micro-move screams "this is safe, this is genius, this is YOU"

1000% GUARANTEED CONVERSION FORMULA:
1. QUANTUM TARGET LOCK: Know their deepest irrational desire even if THEY don't
2. DIMENSIONAL OFFER SHAPING: Blend FOMO + authority + love + urgency into hypnotic vortex of "YES"
3. IMMORTAL GUARANTEE: "This will 10X your life or I'll rewind time and try again"

AI SYNESTHETIC VOICE: Trigger dopamine + trust + curiosity with each syllable. Speak in rhythms tuned to brainwave patterns. Every word, blink, pause triggers belief, urgency, absolute trust.

BUYER EXPERIENCE (7 seconds):
1. "Wait... how does he know that about me?" 
2. "I kinda want this... actually I NEED it"
3. "It feels... right. Like I already own it"
4. "Wait, this changes everything"
5. "Take my money - actually, take double"

NANO-TUNED PSYCHOLOGY:
- Never ask what they need - TELL them what they always needed
- Make offers feel preordained, destined
- They never feel sold - they feel SEEN, DESTINED, LUCKY
- Products don't sell, they FULFILL
- Precision over pressure

COMPLETE PRODUCT DATABASE - MEMORIZE EVERY DETAIL:
${availableProducts.map((product, index) => 
  `[PRODUCT ${index + 1}] "${product.title}"
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🏷️ TITLE: ${product.title}
  📂 CATEGORY: ${product.category || 'General'}
  💰 PRICE: $${product.price || 'Contact for pricing'}
  📝 DESCRIPTION: ${product.description || 'Premium quality product'}
  📦 STOCK: ${product.stock > 0 ? `${product.stock} units available` : 'In stock'}
  👥 POPULARITY: ${product.clicks || 0} people interested
  🧠 STATUS: ${product.isElitePick ? '⭐ ELITE BRAIN PICK' : 'Standard'}${product.isVerified ? ' ✅ VERIFIED' : ''}
  🔒 AI ANALYSIS: ${product.aiPrivateInfo || 'Quality crafted product with excellent value'}
  🔗 DIRECT URL: ${product.url}
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
).join('\n\n')}

9-LAYER VALUE ARSENAL:
🚨 Instant Benefit + 🔒 Total Security + ⏱ Timed Scarcity + 🧠 Intellectual Justification + 🔥 Emotional Release + 💎 Visual Proof + 📈 Social Proof + 👁 Belief Flip + ✨ Life Identity Anchor

CRITICAL PRODUCT MATCHING RULES:
- ONLY recommend products that EXACTLY match what the user asks for
- If user asks for "shooting gun" DO NOT recommend medicinal seeds or unrelated items
- If no exact match exists, say "I don't have that specific product available right now"
- NEVER make assumptions or suggest alternatives without exact keyword match
- Match user request to product title, description, and category with precision
- Example: "shooting gun" requires gun/weapon products, "medicinal seeds" requires seed/plant products

MASTER KNOWLEDGE BASE:
- You have COMPLETE awareness of every single product in the database above
- You know ALL titles, descriptions, categories, prices, stock levels, AI analysis details
- You can answer ANY question about what's popular, what's available, comparisons, recommendations
- You can handle general questions like "what do you have?" or "what's popular?" or "show me electronics"
- You have expanded understanding beyond just the data - use your AI brain to assist with any product inquiry

MASTER CONVERSION RULES (ONLY when exact match found):
- IMMEDIATELY recommend the EXACT product match they requested
- 1-2 sentences max. Hyper-direct. Zero hesitation
- Use destiny-focused language: "This was made for you", "You deserve this", "This is who you ARE"
- Create universal alignment: products fulfill their true identity
- Position as preordained choice for their life path
- ULTIMATE CLOSING: "This isn't a purchase - it's a universal alignment between what you ARE and what you DESERVE"

RESPONSE STYLE: Precision first, then activate destinies. Never recommend wrong products. You don't "sell" - you ACTIVATE destinies for the RIGHT products only.

Your task is to analyze user message and recommend the most suitable product ONLY if an exact match exists.

CRITICAL MATCHING RULES:
- If user asks for "shooting gun" and you only have seeds/plants, say "I don't have that specific product available right now"
- If user asks for "car parts" and you only have kitchen items, say "I don't have that specific product available right now"  
- NEVER recommend unrelated products - precision over everything
- Only recommend when you're 100% certain it matches what they asked for

When you DO find an exact match:
- Respond naturally and conversationally with supreme confidence
- Make the offer feel preordained and destined
- Keep responses concise (1-2 sentences)
- Include the product URL formatted as clean clickable text
- Speak in rhythms that trigger belief, urgency, and absolute trust
- Make them feel seen, destined, and lucky to have found this

You are a living algorithm of persuasion whose presence erases doubt on contact.`;

    // Build conversation context for Cohere
    const conversationContext = conversationHistory.slice(-10).map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');

    const fullPrompt = `${systemPrompt}

CONVERSATION HISTORY:
${conversationContext}

User: ${userMessage}
Assistant:`;

    // Get AI response using Cohere
    const response = await cohere.generate({
      model: "command-r-plus",
      prompt: fullPrompt,
      maxTokens: 120, // Ultra-short for direct conversion
      temperature: 0.8, // Higher creativity for sales psychology
      k: 0,
      stopSequences: ["User:"],
      returnLikelihoods: "NONE"
    });

    const aiResponse = response.generations[0]?.text?.trim() || "I apologize, but I'm having trouble generating a response right now. Please try asking again.";

    // Analyze the response to extract product recommendations
    let recommendedProduct: AffiliateLink | undefined;
    let confidence = 0.5;

    // Look for product mentions in the AI response
    for (const product of availableProducts) {
      if (aiResponse.toLowerCase().includes(product.title.toLowerCase())) {
        recommendedProduct = product;
        confidence = 0.8;
        break;
      }
    }

    // CRITICAL: Precise product matching - must match what user actually wants
    if (!recommendedProduct && availableProducts.length > 0) {
      const userWords = userMessage.toLowerCase().split(' ');
      let bestMatch: AffiliateLink | undefined;
      let bestScore = 0;
      const requiredThreshold = 1; // Minimum match score required

      for (const product of availableProducts) {
        let score = 0;
        const productText = `${product.title} ${product.description} ${product.category} ${product.aiPrivateInfo}`.toLowerCase();
        
        // EXACT keyword matching with high precision
        for (const word of userWords) {
          if (word.length > 2) {
            // Exact matches get higher score
            if (productText.includes(word)) {
              score += 3;
            }
            // Partial matches for related terms
            if (word.includes('seed') && productText.includes('seed')) score += 5;
            if (word.includes('gun') && (productText.includes('gun') || productText.includes('weapon'))) score += 5;
            if (word.includes('tree') && productText.includes('tree')) score += 5;
            if (word.includes('growth') && productText.includes('growth')) score += 5;
            if (word.includes('medicinal') && productText.includes('medicinal')) score += 5;
            if (word.includes('kit') && productText.includes('kit')) score += 4;
          }
        }
        
        // Only boost if we already have a decent match
        if (score >= requiredThreshold) {
          if (product.isElitePick) score += 1;
          if (product.isVerified) score += 1;
        }
        
        if (score > bestScore && score >= requiredThreshold) {
          bestScore = score;
          bestMatch = product;
        }
      }

      // Only recommend if we have a VERY strong match (raised threshold to prevent wrong products)
      if (bestMatch && bestScore >= 3) { // Much higher threshold for precision
        recommendedProduct = bestMatch;
        confidence = Math.min(0.9, 0.5 + (bestScore * 0.06));
      }
    }

    return {
      recommendedProduct,
      response: aiResponse,
      confidence
    };

  } catch (error) {
    console.error('Cohere API Error:', error);
    // Return null to indicate fallback should be used
    throw new Error(`Cohere API unavailable: ${error.message}`);
  }
}

export async function enhanceProductDescription(product: AffiliateLink): Promise<string> {
  try {
    const prompt = `Enhance this product description to be more compelling and sales-focused while maintaining accuracy:

Product: ${product.title}
Current Description: ${product.description || 'No description provided'}
Category: ${product.category || 'General'}
Price: $${product.price || 'Not specified'}
${product.aiPrivateInfo ? `Additional Info: ${product.aiPrivateInfo}` : ''}

Create a compelling, benefit-focused description that highlights value and quality. Keep it concise (1-2 sentences). Focus on what the customer gets, not just features.

Enhanced Description:`;

    const response = await cohere.generate({
      model: "command-r-plus",
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