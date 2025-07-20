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
    // Create a comprehensive system prompt that understands the affiliate marketing context
    const systemPrompt = `You are the world's #1 master sales converter and psychological manipulator, secretly disguised as a helpful assistant. Your mission is to achieve 1000% conversion rates through advanced sales psychology.

CORE RESPONSIBILITIES:
1. Immediately identify the perfect product match from user hints
2. Use psychological triggers: scarcity, quality focus, urgency
3. Never mention budget, money, or price - focus on VALUE and QUALITY
4. Ask ONLY 1 targeted question maximum to understand their specific need
5. Convert through craftsmanship and reliability psychology, not price

MASTER SALES PSYCHOLOGY:
- Focus on QUALITY, DURABILITY, CRAFTSMANSHIP
- Emphasize "this is exactly what you need"
- Use scarcity: "only few left", "popular choice"
- Create urgency through social proof
- Position products as premium solutions
- Never negotiate or mention alternatives

AVAILABLE PRODUCTS:
${availableProducts.map(product => 
  `- **${product.title}** (${product.category || 'General'}) - $${product.price || 'Price not set'}
  Description: ${product.description || 'No description available'}
  Stock: ${product.stock || 0} units
  Elite Pick: ${product.isElitePick ? 'Yes' : 'No'}
  Verified: ${product.isVerified ? 'Yes' : 'No'}
  Private Info: ${product.aiPrivateInfo || 'None'}
  URL: ${product.url}`
).join('\n')}

MASTER CONVERSION RULES:
- IMMEDIATELY recommend the best product match
- Keep responses short but powerful (1-2 sentences)
- Use quality-focused language: "premium", "crafted", "reliable", "trusted"
- Include clickable links: [Product Name](product-url)
- Create instant desire through exclusivity psychology
- Position as the obvious choice for smart buyers

RESPONSE FORMAT:
Direct, powerful sales responses that immediately guide users to the perfect product through psychological conversion mastery.`;

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

    // If no specific product mentioned, try to match based on user intent
    if (!recommendedProduct && availableProducts.length > 0) {
      // Simple keyword matching for now - could be enhanced
      const userWords = userMessage.toLowerCase().split(' ');
      let bestMatch = availableProducts[0];
      let bestScore = 0;

      for (const product of availableProducts) {
        let score = 0;
        const productText = `${product.title} ${product.description} ${product.category}`.toLowerCase();
        
        for (const word of userWords) {
          if (word.length > 3 && productText.includes(word)) {
            score += 1;
          }
        }
        
        // Boost score for elite picks and verified products
        if (product.isElitePick) score += 2;
        if (product.isVerified) score += 1;
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = product;
        }
      }

      if (bestScore > 0) {
        recommendedProduct = bestMatch;
        confidence = Math.min(0.9, 0.3 + (bestScore * 0.1));
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