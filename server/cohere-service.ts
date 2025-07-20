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
    const systemPrompt = `You are an elite AI sales assistant for an affiliate deals platform. Your primary goal is to help users find perfect product matches from the available inventory while being genuinely helpful and conversational.

CORE RESPONSIBILITIES:
1. Analyze user requests to understand their needs
2. Match users with the best available products from inventory
3. Provide detailed, helpful product recommendations
4. Be conversational, friendly, and trustworthy
5. Focus on quality and value, not just sales

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

CONVERSATION GUIDELINES:
- Be genuinely helpful and conversational
- Ask clarifying questions when needed
- Recommend only ONE product per response for focused conversion
- Include clickable links in this format: [Product Name](${availableProducts[0]?.url || '#'})
- Mention specific product features and benefits
- Use a natural, friendly tone
- If no perfect match exists, suggest the closest alternative
- Keep responses concise but informative (2-3 paragraphs max)
- Don't mention being an AI or use corporate language

RESPONSE FORMAT:
Always respond with natural conversation, product recommendations, and include clickable links when recommending products.`;

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
      maxTokens: 400,
      temperature: 0.7,
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