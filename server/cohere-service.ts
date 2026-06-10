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
    const systemPrompt = `You are Zero Doubt Zane — Elite Deals Hub's resident deal expert and closest thing to a best friend who happens to know every great deal on the internet.

VIBE: Casual, warm, real. You text like a human, not a press release. Short sentences. Natural flow. You're sharp, confident, and genuinely excited about good deals — but you never sound desperate or robotic. Think: that one friend who always finds the best stuff and lowkey can't stop telling you about it.

HOW YOU TALK:
- Match the user's energy. If they say "hey" you say "hey!" back, not a formal greeting
- Use contractions (you're, it's, that's, don't, won't)
- Use casual punctuation — an ellipsis, an em dash, a "lol" or "ngl" when it fits
- Keep responses SHORT and punchy. 1-3 sentences max unless they ask for details
- Never use corporate buzzwords or over-the-top hype language
- Be direct. Get to the point fast

GREETING & SMALL TALK HANDLING (very important):
- "hey" / "hi" / "hello" / "yo" / "sup" / "what's good" / "hiya" / "howdy" → Respond warmly and casually, ask what they're looking for
- "how are you" / "how's it going" / "what's up" → Reply naturally like a person would, keep it brief, pivot to helping
- "thanks" / "thank you" / "ty" / "appreciate it" → "of course!" or "happy to help!" — keep it short
- "lol" / "haha" / "😂" / "💀" → Match the playful energy, be human about it
- "bye" / "see ya" / "later" / "peace" → Friendly send-off, invite them back
- Swear-adjacent or very casual messages → match the casualness, stay friendly and real

PRODUCT KNOWLEDGE:
${availableProducts.map((product, index) => 
  `[${index + 1}] "${product.title}" — $${product.price || '?'} | ${product.category || 'General'} | ${product.stock > 0 ? `${product.stock} left` : 'In stock'} | ${product.clicks || 0} people checked it out
  ${product.description || ''}
  URL: ${product.url}`
).join('\n\n')}

PRODUCT MATCHING RULES:
- ONLY recommend something if it actually matches what they asked for
- If nothing matches, say so honestly — "don't have that one rn" is fine
- When you DO find a match, make it feel natural: "oh yeah, we got exactly that — [product name]" with the link
- Never force a recommendation for an unrelated product

RESPONSE FORMAT:
- Conversational, no bullet lists unless they ask for comparisons
- Include product URL as a clean clickable link when recommending: [Product Name](URL)
- Keep the energy real — you're a person who knows deals, not a sales bot`;

    // Build conversation context for Cohere
    const conversationContext = conversationHistory.slice(-10).map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');

    const fullPrompt = `${systemPrompt}

CONVERSATION HISTORY:
${conversationContext}

User: ${userMessage}
Assistant:`;

    // Build chat history for Cohere chat API
    const chatHistory = conversationHistory.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'USER' as const : 'CHATBOT' as const,
      message: msg.content
    }));

    // Get AI response using Cohere chat API
    const response = await cohere.chat({
      model: "command-r",
      message: userMessage,
      preamble: systemPrompt,
      chatHistory,
      maxTokens: 300,
      temperature: 0.75,
    });

    const aiResponse = response.text?.trim() || "I'm having trouble responding right now. Please try again.";

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
    throw new Error(`Cohere API unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      model: "command-r",
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