import { useState, useRef, useEffect } from "react";
import { MessageCircle, Phone, X, RotateCcw, MousePointer, Move } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { AffiliateLink } from "@shared/schema";
import AnimatedMessage from "./animated-message";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatPosition {
  x: number;
  y: number;
}

export default function AIChatbot() {
  // Generate unique session ID for this tab
  const [sessionId] = useState(() => {
    const deviceId = localStorage.getItem('deviceId') || 'unknown';
    const tabId = Math.random().toString(36).substr(2, 9);
    return `${deviceId}-${tabId}`;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load saved messages from localStorage or use default
    const savedMessages = localStorage.getItem(`chatMessages-${sessionId}`);
    if (savedMessages) {
      try {
        return JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch {
        // If parsing fails, use default
        return [
          {
            id: '1',
            content: "Hey! I'm here to help you find what you're looking for. What kind of product do you need?",
            isBot: true,
            timestamp: new Date()
          }
        ];
      }
    }
    return [
      {
        id: '1',
        content: "Hey! I'm here to help you find what you're looking for. What kind of product do you need?",
        isBot: true,
        timestamp: new Date()
      }
    ];
  });
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [position, setPosition] = useState<ChatPosition>({ x: window.innerWidth - 420, y: window.innerHeight - 500 });
  const [size, setSize] = useState({ width: 380, height: 480 });
  const [isDraggingWindow, setIsDraggingWindow] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeDirection, setResizeDirection] = useState('');
  
  // Chat button visibility states
  const [showChatButton, setShowChatButton] = useState(true);
  const [isButtonFading, setIsButtonFading] = useState(false);
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSlideUp, setIsSlideUp] = useState(false);
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);
  const [showControlButton, setShowControlButton] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [fadeTimer, setFadeTimer] = useState<NodeJS.Timeout | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProducts, setSearchProducts] = useState<string[]>([]);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [userIntent, setUserIntent] = useState<{category?: string, budget?: string, features?: string[], confirmed?: boolean}>({});
  const [chatOpenCount, setChatOpenCount] = useState(0);
  const [showResetTooltip, setShowResetTooltip] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(() => {
    return localStorage.getItem(`resetTooltipDismissed-${sessionId}`) === 'true';
  });
  const [isHoveringReset, setIsHoveringReset] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isButtonGlowing, setIsButtonGlowing] = useState(false);
  const [glowTimer, setGlowTimer] = useState<NodeJS.Timeout | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [foundProduct, setFoundProduct] = useState<AffiliateLink | null>(null);
  const [showPitchButton, setShowPitchButton] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showNewMessagePopup, setShowNewMessagePopup] = useState(false);
  const [pitchClickCount, setPitchClickCount] = useState(0);
  const [showCancelButton, setShowCancelButton] = useState(false);
  const [pitchTimeout, setPitchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [shouldGlowRestoreButton, setShouldGlowRestoreButton] = useState(false);
  const [isHoveringRestoreButton, setIsHoveringRestoreButton] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);
  
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch real affiliate links data
  const { data: affiliateLinks = [] } = useQuery<AffiliateLink[]>({
    queryKey: ["/api/affiliate-links"],
  });

  // Dynamic response generator based on user query
  const generateDynamicResponse = (userMessage: string, context: any) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Analyze query type and generate appropriate response
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return `Hi! I help find the best deals. What are you looking for today?`;
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return `I can help you find deals across different categories. Just tell me what you need and I'll search for the best options.`;
    }
    
    if (lowerMessage.includes('thank')) {
      return `You're welcome! Need help finding anything else?`;
    }
    
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
      return `See you later! Come back anytime for more deals.`;
    }
    
    // Default response for unrecognized queries
    return `I understand you're asking about "${userMessage}". Let me help you find relevant deals. What specific product category interests you?`;
  };

  const analyzeUserIntent = (message: string, currentIntent: any) => {
    const lowerMessage = message.toLowerCase();
    const newIntent = { ...currentIntent };
    
    // Extract category information
    const categories = ['electronics', 'fashion', 'home', 'garden', 'sports', 'books', 'beauty', 'automotive', 'toys', 'health', 'kitchen', 'tech'];
    categories.forEach(cat => {
      if (lowerMessage.includes(cat)) {
        newIntent.category = cat;
      }
    });
    
    // Extract quality and features only (no budget questions)
    const features = [];
    if (lowerMessage.includes('wireless') || lowerMessage.includes('bluetooth')) features.push('wireless');
    if (lowerMessage.includes('waterproof') || lowerMessage.includes('water resistant')) features.push('waterproof');
    if (lowerMessage.includes('fast') || lowerMessage.includes('quick') || lowerMessage.includes('speed')) features.push('fast');
    if (lowerMessage.includes('portable') || lowerMessage.includes('travel') || lowerMessage.includes('compact')) features.push('portable');
    if (lowerMessage.includes('durable') || lowerMessage.includes('strong') || lowerMessage.includes('reliable')) features.push('durable');
    if (lowerMessage.includes('premium') || lowerMessage.includes('high-quality') || lowerMessage.includes('quality')) features.push('premium quality');
    if (lowerMessage.includes('rechargeable') || lowerMessage.includes('battery')) features.push('rechargeable');
    if (lowerMessage.includes('smart') || lowerMessage.includes('intelligent')) features.push('smart');
    
    if (features.length > 0) {
      newIntent.features = [...(newIntent.features || []), ...features];
    }
    
    // Check for confirmation to search creator dashboard
    if (lowerMessage.includes('yes') || lowerMessage.includes('confirm') || lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('show me') || lowerMessage.includes('go ahead')) {
      newIntent.confirmed = true;
    }
    
    return newIntent;
  };

  const generateContextualResponse = (userMessage: string, history: Array<{role: 'user' | 'assistant', content: string}>, intent?: any): string => {
    const lowerQuery = userMessage.toLowerCase();
    
    // Check if products are available
    if (!affiliateLinks || affiliateLinks.length === 0) {
      return "I don't see any products available in the creator dashboard right now. Please check back when new deals have been added!";
    }

    // GATHER USER INFORMATION FIRST - Progressive information collection
    const userMessages = history.filter(msg => msg.role === 'user').map(msg => msg.content.toLowerCase());
    const allUserInput = userMessages.join(' ') + ' ' + lowerQuery;
    
    // Get AI's last message to understand context
    const aiMessages = history.filter(msg => msg.role === 'assistant');
    const lastAiMessage = aiMessages[aiMessages.length - 1]?.content.toLowerCase() || '';
    
    // ANALYZE USER INPUT - Look for any specific request or need
    const userWords = lowerQuery.split(' ').filter(word => word.length > 2);
    const hasSpecificRequest = userWords.length >= 2 || lowerQuery.includes('need') || lowerQuery.includes('want') || lowerQuery.includes('looking for');
    
    // Check if AI asked a question and user is responding
    const aiAskedQuestion = lastAiMessage.includes('?') || lastAiMessage.includes('what') || lastAiMessage.includes('tell me') || lastAiMessage.includes('share');
    
    // ALWAYS SEARCH PRODUCTS when user provides any specific input
    if (hasSpecificRequest && lowerQuery.trim().length > 3) {
      // DEEP ANALYSIS of ALL products against user's specific request
      let bestProduct = null;
      let matchScore = 0;
      let analysisDetails = '';

      affiliateLinks.forEach(product => {
        let score = 0;
        let reasons = [];
        
        // Extract ALL product details for thorough analysis
        const title = product.title?.toLowerCase() || '';
        const description = product.description?.toLowerCase() || '';
        const category = product.category?.toLowerCase() || '';
        const price = product.price || 0;
        const originalPrice = product.originalPrice || 0;
        const isElite = product.isElitePick || false;
        const isVerified = product.isVerified || false;
        const stockCount = product.stockCount || 0;
        
        // COMPREHENSIVE keyword matching against user's current request
        userWords.forEach(word => {
          // Check title matches
          if (title.includes(word)) {
            score += 50;
            reasons.push(`title matches "${word}"`);
          }
          
          // Check description matches (most important)
          if (description.includes(word)) {
            score += 60;
            reasons.push(`description contains "${word}"`);
          }
          
          // Check category matches
          if (category.includes(word)) {
            score += 40;
            reasons.push(`category fits "${word}"`);
          }
        });
        
        // Semantic analysis for better understanding
        if (lowerQuery.includes('cheap') || lowerQuery.includes('affordable')) {
          if (price > 0 && price < 50) {
            score += 30;
            reasons.push('affordable price point');
          }
        }
        
        if (lowerQuery.includes('best') || lowerQuery.includes('quality') || lowerQuery.includes('premium')) {
          if (isElite || isVerified || price > 50) {
            score += 35;
            reasons.push('high quality/premium option');
          }
        }
        
        if (lowerQuery.includes('popular') || lowerQuery.includes('trending')) {
          if (isElite) {
            score += 25;
            reasons.push('elite/popular pick');
          }
        }
        
        // Update best match if this product scores higher
        if (score > matchScore) {
          matchScore = score;
          bestProduct = product;
          analysisDetails = reasons.join(', ');
        }
      });

      // If no good match, pick elite or first product
      if (!bestProduct) {
        bestProduct = affiliateLinks.find(p => p.isElitePick) || affiliateLinks[0];
      }

      // Generate recommendation with gathered user info
      const priceText = bestProduct.price ? `$${bestProduct.price}` : 'Great price';
      const originalPriceText = bestProduct.originalPrice ? ` (was $${bestProduct.originalPrice} - save $${bestProduct.originalPrice - bestProduct.price}!)` : '';
      const verifiedBadge = bestProduct.isVerified ? '✅ VERIFIED' : '';
      const eliteBadge = bestProduct.isElitePick ? '⭐ ELITE PICK' : '';
      const stockText = bestProduct.stockCount ? `Only ${bestProduct.stockCount} left!` : '';
      
      // Enable pitch button for this specific recommendation
      setTimeout(() => {
        setFoundProduct(bestProduct);
        setShowPitchButton(true);
      }, 100);

      // Generate unique response based on actual analysis
      const responses = [
        `I looked through all our products and found this one that caught my attention for you:`,
        `After checking our entire catalog, here's what stood out based on what you mentioned:`,
        `I found something interesting that seems to match what you're looking for:`,
        `This product came up when I analyzed your request against our full inventory:`,
        `Based on your specific needs, this one looks promising:`
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Generate contextual response based on previous conversation
      let contextualResponse = randomResponse;
      if (aiAskedQuestion) {
        const contextResponses = [
          `Perfect! Based on what you just told me, here's what I found:`,
          `Great info! I searched through everything and this caught my attention:`,
          `Thanks for clarifying! This product seems to match exactly what you described:`,
          `Excellent! After analyzing your response, I found this:`,
          `Got it! Here's what stood out when I searched for what you mentioned:`
        ];
        contextualResponse = contextResponses[Math.floor(Math.random() * contextResponses.length)];
      }

      return `${contextualResponse}

**${bestProduct.title}** ${eliteBadge} ${verifiedBadge}

${bestProduct.description || `This product seems relevant to your request.`}

${priceText !== 'Great price' ? `${priceText}${originalPriceText}` : ''} ${stockText ? ` • ${stockText}` : ''}

${analysisDetails ? `I selected this because: ${analysisDetails}.` : 'This seemed like the best match from our available products.'} Want to know more about it?`;
    }
    
    // Generate unique helpful response when no specific request is detected
    const helpfulResponses = [
      `What are you looking for today? I can help you find something specific.`,
      `Tell me what you need and I'll search through our products for you.`,
      `What kind of product do you have in mind? I'll find options for you.`,
      `Share what you're shopping for and I'll look for the best matches.`,
      `What can I help you find? Just describe what you need.`,
      `Looking for anything particular? I can browse our inventory for you.`
    ];
    
    return helpfulResponses[Math.floor(Math.random() * helpfulResponses.length)];

    // Handle off-topic queries ONLY if no products available
    if (lowerQuery.includes('weather') || lowerQuery.includes('temperature') || lowerQuery.includes('forecast')) {
      return `I specialize in product deals rather than weather updates. However, if you need weather-related gear like jackets, umbrellas, or outdoor equipment, I can help you find those deals.`;
    }

    // Handle progressive information gathering with Search Now button
    if (intent && !intent.confirmed && (intent.category || intent.features?.length)) {
      const parts = [];
      if (intent.category) parts.push(`Looking for ${intent.category} products`);
      if (intent.features?.length) parts.push(`with ${intent.features.join(', ')} features`);
      
      // Add Search Now button HTML
      const searchButton = `<div style="margin-top: 12px;"><button onclick="window.triggerChatSearch && window.triggerChatSearch()" style="background: linear-gradient(45deg, #3b82f6, #1d4ed8); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px;">🔍 Search Now</button></div>`;
      
      return parts.join('. ') + '. Ready to find the perfect deals for you!' + searchButton;
    }

    // Handle confirmed search with real product data
    const hasProducts = affiliateLinks.length > 0;
    if (hasProducts && intent?.confirmed) {
      const categories = [...new Set(affiliateLinks.map((link: any) => link.category))];
      const productNames = affiliateLinks.map((link: any) => link.title);
      
      // Look for specific product mentions
      const mentionedProducts = productNames.filter(name => 
        lowerQuery.includes(name.toLowerCase()) || 
        name.toLowerCase().includes(lowerQuery)
      );
      
      if (mentionedProducts.length > 0) {
        const product = affiliateLinks.find((link: any) => link.title === mentionedProducts[0]);
        return `I found "${product.title}" which matches your search. ${product.description.slice(0, 60)}... This appears to be a quality deal for your needs.`;
      }
      
      if (lowerQuery.includes('more') || lowerQuery.includes('other') || lowerQuery.includes('different')) {
        const randomProducts = productNames.sort(() => 0.5 - Math.random()).slice(0, 3);
        return `Here are additional options I found: ${randomProducts.join(', ')}. Would any of these work for your needs?`;
      }
      
      if (categories.some(cat => lowerQuery.includes(cat.toLowerCase()))) {
        const matchedCategory = categories.find(cat => lowerQuery.includes(cat.toLowerCase()));
        const categoryProducts = affiliateLinks.filter((link: any) => link.category === matchedCategory);
        return `I found ${categoryProducts.length} ${matchedCategory} options. Top recommendations include: ${categoryProducts.slice(0, 3).map((p: any) => p.title).join(', ')}. Which of these interests you most?`;
      }
      
      if (lowerQuery.includes('best') || lowerQuery.includes('recommend') || lowerQuery.includes('top')) {
        const topProducts = productNames.slice(0, 3);
        return `Based on current deals available, my top recommendations are: ${topProducts.join(', ')}. Would you like more details about any of these?`;
      }
      
      // Contextual response based on conversation history
      if (hasDiscussedProducts) {
        return `I also have options in ${categories.slice(0, 2).join(' and ')} categories. With ${affiliateLinks.length} total deals available, what specific features matter most to you?`;
      } else {
        return `I have ${affiliateLinks.length} deals across categories including ${categories.slice(0, 3).join(', ')}. What type of product would work best for your situation?`;
      }
    }
    
    // Handle general queries when products are available
    if (hasProducts) {
      const categories = [...new Set(affiliateLinks.map((link: any) => link.category))];
      
      // Handle specific product inquiries
      if (lowerQuery.includes('best') || lowerQuery.includes('recommend')) {
        return `I currently have ${affiliateLinks.length} deals available across ${categories.join(', ')}. To give you the best recommendation, what type of product are you looking for?`;
      }
      
      if (lowerQuery.includes('show') || lowerQuery.includes('what') || lowerQuery.includes('available')) {
        const sampleProducts = affiliateLinks.slice(0, 3).map(p => p.title);
        return `I have deals on items like ${sampleProducts.join(', ')} among others. What category interests you most?`;
      }
      
      // Category-specific responses
      for (const link of affiliateLinks) {
        if (lowerQuery.includes(link.category.toLowerCase()) || lowerQuery.includes(link.title.toLowerCase())) {
          return `I found "${link.title}" in the ${link.category} category. ${link.description.slice(0, 70)}... Would this work for what you need?`;
        }
      }
      
      return `I have ${affiliateLinks.length} deals available in categories like ${categories.slice(0, 3).join(', ')}. What type of product would be most helpful for you today?`;
    }
    
    // Fallback when no products are available  
    return "The creator dashboard doesn't have any products available right now. Please check back later when new deals have been added to the system.";
  };

  // Dynamic aggressive sales psychology pitch generator - GUARANTEED UNIQUE EVERY TIME
  const generateAggressivePitch = (product: AffiliateLink, userHistory: string[]): string => {
    const userWords = userHistory.join(' ').toLowerCase();
    const personalizedTerms = [];
    
    // Extract comprehensive user psychology
    if (userWords.includes('need') || userWords.includes('want') || userWords.includes('require')) personalizedTerms.push('essential need');
    if (userWords.includes('budget') || userWords.includes('cheap') || userWords.includes('affordable') || userWords.includes('price')) personalizedTerms.push('incredible value');
    if (userWords.includes('quality') || userWords.includes('good') || userWords.includes('best') || userWords.includes('premium')) personalizedTerms.push('premium quality');
    if (userWords.includes('work') || userWords.includes('job') || userWords.includes('office') || userWords.includes('business')) personalizedTerms.push('professional edge');
    if (userWords.includes('fast') || userWords.includes('quick') || userWords.includes('urgent')) personalizedTerms.push('immediate results');
    if (userWords.includes('reliable') || userWords.includes('trust') || userWords.includes('proven')) personalizedTerms.push('guaranteed reliability');
    
    // Extract product details for deep personalization
    const productName = product.title;
    const productDesc = product.description;
    const productCategory = product.category;
    const productPrice = product.price ? `$${product.price}` : 'an incredible price';
    const productUrl = product.url;
    
    // Analyze URL for additional context
    const urlContext = [];
    if (productUrl.includes('amazon')) urlContext.push('backed by Amazon\'s guarantee');
    if (productUrl.includes('ebay')) urlContext.push('with verified seller ratings');
    if (productUrl.includes('walmart')) urlContext.push('with Walmart\'s trusted network');
    if (productUrl.includes('target')) urlContext.push('from Target\'s curated selection');
    if (productUrl.includes('.com')) urlContext.push('from a legitimate, verified source');
    
    // UNIQUE GENERATION SYSTEM - uses multiple randomization sources
    const currentTime = Date.now();
    const microseconds = performance.now();
    const randomFloat = Math.random();
    const combinedSeed = Math.floor((currentTime + microseconds + randomFloat * 10000) % 999999);
    
    // MASSIVE variety of opening hooks - each time different
    const openingHooks = [
      `Stop everything. I'm about to reveal the truth about "${productName}" that will completely shift your perspective.`,
      `Listen - what I'm about to tell you about "${productName}" is going to sound too good to be true, but stick with me.`,
      `I need to be brutally honest with you about "${productName}" because most people won't tell you this.`,
      `Here's something nobody else will tell you about "${productName}" - and it's going to blow your mind.`,
      `I'm going to break down exactly why "${productName}" is the game-changer you've been waiting for.`,
      `Let me paint you a picture of your life 6 months from now after experiencing "${productName}".`,
      `What I'm about to share about "${productName}" has transformed thousands of lives - and yours could be next.`,
      `I rarely get this excited about products, but "${productName}" is different in ways that matter.`,
      `Before I tell you about "${productName}", ask yourself: what would change in your life if you had the perfect solution?`,
      `The story I'm about to tell you about "${productName}" starts with someone just like you who made one decision.`,
      `I've been in this industry for years, and I've never seen anything like "${productName}" for this specific need.`,
      `Here's what happens when someone like you discovers "${productName}" - and why it's about to happen to you.`,
      `I'm going to share something about "${productName}" that most people miss completely - but you won't.`,
      `The real story behind "${productName}" isn't what you think - it's actually much more powerful.`,
      `I want you to imagine something with me about "${productName}" and how it's about to change everything.`,
      `There's a secret about "${productName}" that only the smartest buyers know - and I'm about to tell you.`,
      `Most people buy "${productName}" for the obvious reasons, but the real magic happens because of something else entirely.`,
      `I'm about to tell you something about "${productName}" that will make you wonder why you waited so long.`,
      `The first time someone told me about "${productName}", I didn't believe them either - until I saw the proof.`,
      `Here's what separates "${productName}" from everything else - and why it's perfect for someone like you.`
    ];
    
    // EXPANDED psychological hooks with user analysis
    const psychHooks = [
      `You mentioned ${personalizedTerms[0] || 'finding the right solution'} - "${productName}" is literally engineered for people with your exact mindset.`,
      `Based on our conversation, I can tell you're someone who values ${personalizedTerms[1] || 'smart decisions'} - this is your breakthrough moment.`,
      `The fact that you're asking these specific questions tells me you're ready for what "${productName}" delivers.`,
      `I've analyzed thousands of similar conversations, and your needs align perfectly with "${productName}"'s core strengths.`,
      `Your approach to this tells me you're not like most people - "${productName}" rewards that kind of intelligence.`,
      `The way you think about this problem is exactly why "${productName}" will work so well for you.`,
      `I can tell from your questions that you understand quality - "${productName}" is built for people who get it.`,
      `Your specific situation is actually the perfect match for what "${productName}" was designed to solve.`,
      `Most people miss what you're picking up on - "${productName}" responds to that level of awareness.`,
      `The fact that you're being thorough about this shows you're exactly the type of person "${productName}" transforms.`
    ];
    
    // DYNAMIC value propositions with product analysis
    const valueProps = [
      `This ${productCategory} breakthrough "${productName}" isn't just another option - ${productDesc.slice(0, 100)}... but here's what really sets it apart.`,
      `What makes "${productName}" revolutionary in the ${productCategory} space? ${productDesc.slice(0, 120)}... and that's just the beginning.`,
      `The "${productName}" represents a complete paradigm shift in ${productCategory} because ${productDesc.slice(0, 80)}... but the real power is in what happens next.`,
      `Here's why "${productName}" dominates every other ${productCategory} option: ${productDesc.slice(0, 90)}... plus something most people never discover.`,
      `The secret behind "${productName}"'s success in ${productCategory} is ${productDesc.slice(0, 110)}... combined with an advantage others can't replicate.`,
      `What you see with "${productName}" in ${productCategory} is ${productDesc.slice(0, 95)}... but what you don't see is where the real magic happens.`,
      `The engineering behind "${productName}" in the ${productCategory} market means ${productDesc.slice(0, 85)}... creating results that seem almost impossible.`,
      `Unlike every other ${productCategory} product, "${productName}" delivers ${productDesc.slice(0, 75)}... while simultaneously solving the hidden problem nobody talks about.`
    ];
    
    // ESCALATED urgency and scarcity triggers
    const urgencyTriggers = [
      `I'm watching the inventory on "${productName}" in real-time, and it's dropping faster than I've ever seen.`,
      `This specific "${productName}" opportunity ${urlContext[0] || 'from this verified source'} has a hidden expiration that most people don't know about.`,
      `I've tracked "${productName}" selling out 7 times in the last 30 days - each time with no warning.`,
      `The pricing structure on "${productName}" at ${productPrice} is being discontinued next week - I just got the internal memo.`,
      `Only 12 people per day get access to "${productName}" at this level - and 3 spots just opened up.`,
      `The demand for "${productName}" has increased 340% this month, and supply hasn't caught up.`,
      `I just checked the backend - "${productName}" inventory shows critical levels with no restock scheduled.`,
      `The manufacturer of "${productName}" is about to implement a price increase that will shock you.`,
      `There's a waiting list for "${productName}" that's 2,847 people long - but I can bypass it for the next 20 minutes.`,
      `The window for "${productName}" at this price closes automatically at midnight - the system won't let me override it.`
    ];
    
    // AMPLIFIED social proof and authority
    const socialProof = [
      `I've personally guided 4,392 people to success with "${productName}" and witnessed transformations that still give me chills.`,
      `The "${productName}" has a 98.7% satisfaction rate among people in your exact situation - I've never seen numbers like this.`,
      `I just pulled the data - "${productName}" has generated over 23,000 positive outcomes in the last 90 days alone.`,
      `Industry experts are calling "${productName}" the new gold standard in ${productCategory} - and they're right.`,
      `The research is undeniable: "${productName}" outperforms 97% of similar ${productCategory} options in blind tests.`,
      `I've seen the internal customer success reports for "${productName}" - the results are almost unbelievable.`,
      `The testimonials for "${productName}" read like success stories you'd think were made up - except they're all verified.`,
      `My most successful clients all have one thing in common - they secured "${productName}" when I recommended it.`,
      `The transformation rate with "${productName}" is so high that other companies are trying to reverse-engineer it.`,
      `I stake my reputation on "${productName}" because in 15 years, I've never seen anything deliver like this.`
    ];
    
    // INTENSIFIED emotional manipulation and future-pacing
    const emotionalTriggers = [
      `Picture this: 12 months from now, you're looking back at this exact moment when you discovered "${productName}" - what do you want that story to be?`,
      `Your future self is literally reaching back through time to shake you and say "GET THE ${productName.toUpperCase()} NOW!"`,
      `Every heartbeat you hesitate on "${productName}" is another heartbeat your ideal life waits in the wings.`,
      `I can see the potential radiating from you - "${productName}" is the ignition key that starts your engine.`,
      `The universe didn't randomly put "${productName}" in front of you right now - this is your moment of truth.`,
      `What if I told you that everyone who succeeds has that ONE decision that changed everything - and this is yours?`,
      `The distance between where you are and where you want to be is exactly the length of a "${productName}" decision.`,
      `I'm watching you stand at the crossroads right now - one path leads to more of the same, the other leads to "${productName}" and everything that follows.`,
      `Your inner voice brought you here for "${productName}" - and that voice has never steered you wrong.`,
      `Ten years from now, you'll remember this "${productName}" moment as either your biggest regret or your smartest move.`
    ];
    
    // POWERFUL closing psychological pressure
    const closingPressure = [
      `Stop overthinking "${productName}" - your instincts brought you this far, let them take you the rest of the way.`,
      `I'm going to ask you the question that changes everything: What's the real cost of NOT having "${productName}" transform your life?`,
      `The people who win with "${productName}" have one thing in common: they recognize a gift when they see it.`,
      `You can spend forever researching, or you can secure "${productName}" and let the results speak for themselves.`,
      `I've given you everything about "${productName}" - now your future is calling and asking what you're going to do.`,
      `Ready to stop dreaming about change and start living it? "${productName}" is your bridge to that reality.`,
      `The "${productName}" decision isn't just about the product - it's about who you're choosing to become.`,
      `Your current self brought you to "${productName}" - but it's your future self that will thank you for saying yes.`,
      `Don't let this "${productName}" opportunity become the story you tell about the one that got away.`,
      `The only thing standing between you and "${productName}" success is a single decision - make it the right one.`
    ];
    
    // MULTIPLE RANDOMIZATION LAYERS for absolute uniqueness
    const seed1 = combinedSeed % openingHooks.length;
    const seed2 = Math.floor((combinedSeed * 1.7) % psychHooks.length);
    const seed3 = Math.floor((combinedSeed * 2.3) % valueProps.length);
    const seed4 = Math.floor((combinedSeed * 3.1) % urgencyTriggers.length);
    const seed5 = Math.floor((combinedSeed * 4.7) % socialProof.length);
    const seed6 = Math.floor((combinedSeed * 5.9) % emotionalTriggers.length);
    const seed7 = Math.floor((combinedSeed * 7.1) % closingPressure.length);
    
    const selectedOpening = openingHooks[seed1];
    const selectedPsych = psychHooks[seed2];
    const selectedValue = valueProps[seed3];
    const selectedUrgency = urgencyTriggers[seed4];
    const selectedSocial = socialProof[seed5];
    const selectedEmotional = emotionalTriggers[seed6];
    const selectedClosing = closingPressure[seed7];
    
    // DYNAMIC conversation context based on interaction count
    const interactionDepth = userHistory.length;
    const contextualInsights = [
      `After ${interactionDepth} exchanges, I can see you're someone who values depth over superficiality - "${productName}" rewards that approach.`,
      `Our ${interactionDepth}-message conversation tells me you're thorough - exactly the type of person "${productName}" was designed for.`,
      `Based on these ${interactionDepth} interactions, your decision-making style is perfect for maximizing "${productName}"'s potential.`,
      `The way you've approached our ${interactionDepth} exchanges shows me "${productName}" will work exceptionally well for you.`,
      `Your ${interactionDepth} thoughtful questions prove you're ready for what "${productName}" delivers at the highest level.`
    ];
    
    const selectedContext = contextualInsights[combinedSeed % contextualInsights.length];
    
    // TIMESTAMP-BASED unique elements
    const timeBasedElement = `Right now, at ${new Date().toLocaleTimeString()}, only ${Math.floor(Math.random() * 8) + 3} people worldwide are seeing "${productName}" at this exact price point.`;
    
    // CONSTRUCT COMPLETELY UNIQUE PITCH EVERY TIME
    const uniquePitch = [
      selectedOpening,
      selectedPsych,
      selectedValue,
      selectedContext,
      selectedUrgency,
      selectedSocial,
      timeBasedElement,
      selectedEmotional,
      `Remember: "${productName}" ${urlContext[0] || 'from this trusted source'} at ${productPrice} isn't just a purchase - it's the catalyst for everything you're about to become.`,
      selectedClosing,
      `\n[Generated uniquely at ${currentTime} with seed ${combinedSeed}]` // Hidden uniqueness proof
    ];

    console.log(`Generated unique pitch with seed: ${combinedSeed}, timestamp: ${currentTime}`);
    return uniquePitch.join('\n\n');
  };

  const handlePitchClick = () => {
    if (!foundProduct) return;
    
    setIsTyping(true);
    
    // Increment click count and show cancel button after second click
    const newClickCount = pitchClickCount + 1;
    setPitchClickCount(newClickCount);
    if (newClickCount >= 2) {
      setShowCancelButton(true);
    }
    
    // Set initial countdown for pitch response (20-60 seconds)
    const pitchDelay = Math.random() * 40000 + 20000;
    const initialCountdown = Math.ceil(pitchDelay / 1000);
    setCountdown(initialCountdown);
    
    // Countdown timer
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setCountdownInterval(interval);
    
    // Collect all user messages for personalization
    const userMessages = messages.filter(m => !m.isBot).map(m => m.content);
    
    const timeout = setTimeout(() => {
      setIsTyping(false);
      setCountdown(0);
      setShowCancelButton(false);
      if (countdownInterval) clearInterval(countdownInterval);
      
      const pitchContent = generateAggressivePitch(foundProduct, userMessages);
      
      const pitchMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: pitchContent,
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, pitchMessage]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: pitchContent }]);
      
      // Show popup notification for new message
      setShowNewMessagePopup(true);
      
      // Auto-hide popup after 5 seconds
      setTimeout(() => {
        setShowNewMessagePopup(false);
      }, 5000);
    }, pitchDelay);
    
    setPitchTimeout(timeout);
  };

  const handleCancelPitch = () => {
    if (pitchTimeout) {
      clearTimeout(pitchTimeout);
      setPitchTimeout(null);
    }
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }
    setIsTyping(false);
    setCountdown(0);
    setShowCancelButton(false);
  };

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    const timestamp = Date.now();
    
    // If we have real products, include them in responses with variation
    const hasProducts = affiliateLinks.length > 0;
    const randomProduct = hasProducts ? affiliateLinks[Math.floor((timestamp * 7) % affiliateLinks.length)] : null;
    
    // Product-specific responses with dynamic variation
    if (message.includes('best') || message.includes('recommend') || message.includes('which')) {
      if (hasProducts && randomProduct) {
        // Enable pitch button for product recommendations
        setTimeout(() => {
          setFoundProduct(randomProduct);
          setShowPitchButton(true);
          console.log('Product recommendation found, enabling pitch button:', randomProduct.title);
        }, 100);
        
        // Generate unique responses each time
        const responseVariations = [
          `Absolutely! I've got the perfect match: "${randomProduct.title}" - this ${randomProduct.category} gem has been delivering incredible results. ${randomProduct.description.slice(0, 80)}... Ready for the details?`,
          `Perfect timing! "${randomProduct.title}" is exactly what you need. Here's why it's special: ${randomProduct.description.slice(0, 90)}... Want me to secure this for you?`,
          `I've analyzed your needs and "${randomProduct.title}" stands out as the clear winner. ${randomProduct.description.slice(0, 85)}... This could be game-changing for you.`,
          `Outstanding question! "${randomProduct.title}" is my top recommendation because ${randomProduct.description.slice(0, 70)}... Shall I show you why this beats everything else?`,
          `You're in luck! "${randomProduct.title}" in the ${randomProduct.category} space is phenomenal. ${randomProduct.description.slice(0, 95)}... Want the insider details?`
        ];
        
        const selectedResponse = responseVariations[timestamp % responseVariations.length];
        return selectedResponse;
      }
      return getRandomResponse('product');
    }
    
    // Show available deals with dynamic presentation
    if (message.includes('deals') || message.includes('what') || message.includes('show') || message.includes('available')) {
      if (hasProducts) {
        // Rotate through different products as primary focus
        const shuffledProducts = [...affiliateLinks].sort(() => (timestamp * 3) % 2 - 1);
        const topDeals = shuffledProducts.slice(0, 3);
        const dealsList = topDeals.map(deal => `• ${deal.title} (${deal.category}) - ${deal.description.slice(0, 50)}...`).join('\n');
        
        // Enable pitch button with rotating featured product
        const featuredProduct = shuffledProducts[0];
        setTimeout(() => {
          setFoundProduct(featuredProduct);
          setShowPitchButton(true);
          console.log('Deal list shown, enabling pitch button for featured product:', featuredProduct.title);
        }, 100);
        
        // Dynamic deal presentation variations
        const dealResponses = [
          `🔥 Here are today's exclusive deals:\n\n${dealsList}\n\nI'm personally excited about "${featuredProduct.title}" - it's been flying off the shelves! Which interests you most?`,
          `💎 Check out these premium opportunities:\n\n${dealsList}\n\n"${featuredProduct.title}" is my current top pick. Want to know why it's crushing the competition?`,
          `⚡ Fresh deals just dropped:\n\n${dealsList}\n\nBetween you and me, "${featuredProduct.title}" is about to explode in popularity. Ready to get ahead of the curve?`,
          `🎯 Curated just for you:\n\n${dealsList}\n\n"${featuredProduct.title}" caught my attention immediately - the value here is insane. Shall we dive deeper?`,
          `🚀 Today's hottest opportunities:\n\n${dealsList}\n\nI've been tracking "${featuredProduct.title}" and the numbers are incredible. Want the full breakdown?`
        ];
        
        return dealResponses[timestamp % dealResponses.length];
      }
      return "We're loading up some incredible deals right now! 🚀 Check back in a few minutes for the latest drops. Want me to notify you when they're live?";
    }
    
    // Category-specific recommendations
    for (const link of affiliateLinks) {
      if (message.includes(link.category.toLowerCase()) || message.includes(link.title.toLowerCase())) {
        // Enable pitch button for specific product matches
        setTimeout(() => {
          setFoundProduct(link);
          setShowPitchButton(true);
          console.log('Category/product match found, enabling pitch button:', link.title);
        }, 100);
        
        return `YES! "${link.title}" is exactly what you need! 🎯 ${link.description.slice(0, 80)}... This is flying off the shelves. Ready to grab it?`;
      }
    }
    
    // Comparison questions
    if (message.includes('compare') || message.includes('difference') || message.includes('vs') || message.includes('better')) {
      if (hasProducts && affiliateLinks.length >= 2) {
        const product1 = affiliateLinks[0];
        const product2 = affiliateLinks[1];
        return `Great question! 🤔 Between "${product1.title}" and "${product2.title}", I'd lean toward ${product1.title} because of the value. Want me to break down the differences?`;
      }
      return getRandomResponse('comparison');
    }
    
    // Urgency triggers
    if (message.includes('how long') || message.includes('when') || message.includes('expire') || message.includes('deal')) {
      return getRandomResponse('urgency');
    }
    
    // Objection handling
    if (message.includes('tried before') || message.includes('refund') || message.includes('safe') || message.includes('legit')) {
      return getRandomResponse('objection');
    }
    
    // General conversation
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return getRandomResponse('greeting');
    }
    
    // General questions and uncertainty handling
    if (message.includes('weather') || message.includes('news') || message.includes('stock') || message.includes('crypto')) {
      return "I focus on finding you the best deals and products! 🎯 I don't have access to live weather/news/stocks, but I can definitely help you find what you're shopping for. What kind of deals are you hunting today?";
    }
    
    // Complex questions beyond scope
    if (message.includes('quantum') || message.includes('physics') || message.includes('medical') || message.includes('legal')) {
      return "That's outside my expertise! 🤖 I'm specialized in finding killer deals and helping you choose the right products. What can I help you shop for instead?";
    }
    
    // Default response with conversion focus
    if (hasProducts) {
      return `Interesting! 🤔 You know what might be perfect for that? "${randomProduct?.title}" has been crushing it lately 🔥 Want me to show you why everyone's obsessed with it?`;
    }
    return "I'm here to help you find amazing deals! 🛍️ What kind of products are you looking for? I can point you toward the best value picks.";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    let messageContent = inputValue;
    
    // If replying to a message, include context
    if (replyingTo) {
      messageContent = `Regarding your message "${replyingTo.content.substring(0, 100)}${replyingTo.content.length > 100 ? '...' : ''}": ${inputValue}`;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue, // Show user's original message
      isBot: false,
      timestamp: new Date()
    };

    // Add to conversation history with full context
    const newHistory = [...conversationHistory, { role: 'user' as const, content: messageContent }];
    setConversationHistory(newHistory);
    setMessages(prev => [...prev, userMessage]);
    
    const messageToProcess = messageContent; // Use full context for processing
    setInputValue("");
    setReplyingTo(null); // Clear reply state
    setIsTyping(true);
    
    try {
      // Analyze user intent and gather information
      const newIntentData = analyzeUserIntent(messageToProcess, userIntent);
      setUserIntent(newIntentData);
      
      // Only start product search if we have enough info and user confirms
      const shouldSearch = newIntentData.confirmed && (newIntentData.category || newIntentData.features?.length);
      
      if (shouldSearch) {
        // Start product search animation
        setIsSearching(true);
        setSearchProducts([]);
        
        // Simulate searching animation with product names
        const searchTerms = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Beauty', 'Automotive', 'Toys'];
        let searchIndex = 0;
        const searchInterval = setInterval(() => {
          if (searchIndex < searchTerms.length) {
            setSearchProducts(prev => [...prev, searchTerms[searchIndex]]);
            searchIndex++;
          } else {
            clearInterval(searchInterval);
          }
        }, 300);

        // Generate contextual AI response with search
        
        setTimeout(() => {
          setIsSearching(false);
          setSearchProducts([]);
          setIsTyping(false);
          
          // Check if products are available before generating response
          const hasProducts = affiliateLinks && affiliateLinks.length > 0;
          let botResponseContent: string;
          
          if (!hasProducts) {
            botResponseContent = "I searched the creator dashboard but there aren't any products available right now. The dashboard appears empty at the moment. Please check back later when new deals have been added.";
          } else {
            botResponseContent = generateContextualResponse(messageToProcess, newHistory, newIntentData);
            
            // Check if we found a specific product to enable pitch button
            const foundSpecificProduct = affiliateLinks.find(link => 
              messageToProcess.toLowerCase().includes(link.title.toLowerCase()) ||
              messageToProcess.toLowerCase().includes(link.category.toLowerCase()) ||
              botResponseContent.toLowerCase().includes(link.title.toLowerCase())
            );
            
            if (foundSpecificProduct) {
              setFoundProduct(foundSpecificProduct);
              setShowPitchButton(true);
              console.log('Product found, enabling pitch button:', foundSpecificProduct.title);
            }
          }
          
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: botResponseContent,
            isBot: true,
            timestamp: new Date()
          };

          // Add bot response to conversation history
          setConversationHistory(prev => [...prev, { role: 'assistant', content: botResponseContent }]);
          setMessages(prev => [...prev, botResponse]);
        }, 2000);
      } else {
        // Generate response without search animation
        setTimeout(() => {
          setIsTyping(false);
          
          const botResponseContent = generateContextualResponse(messageToProcess, newHistory, newIntentData);
          
          // Check for product mentions and lock in product (once locked, stays locked)
          const hasProducts = affiliateLinks && affiliateLinks.length > 0;
          if (hasProducts && !foundProduct) { // Only set if no product is currently locked
            const foundSpecificProduct = affiliateLinks.find(link => 
              messageToProcess.toLowerCase().includes(link.title.toLowerCase()) ||
              messageToProcess.toLowerCase().includes(link.category.toLowerCase()) ||
              botResponseContent.toLowerCase().includes(link.title.toLowerCase())
            );
            
            if (foundSpecificProduct) {
              setFoundProduct(foundSpecificProduct);
              setShowPitchButton(true);
              console.log('Product locked in for conversation:', foundSpecificProduct.title);
            }
          } else if (foundProduct) {
            // If product is already locked, keep showing pitch button
            setShowPitchButton(true);
            console.log('Keeping locked product:', foundProduct.title);
          }
          
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: botResponseContent,
            isBot: true,
            timestamp: new Date()
          };

          // Add bot response to conversation history
          setConversationHistory(prev => [...prev, { role: 'assistant', content: botResponse.content }]);
          setMessages(prev => [...prev, botResponse]);
        }, 1500);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSearching(false);
      setSearchProducts([]);
      setIsTyping(false);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble accessing the product database right now. Please try again in a moment!",
        isBot: true,
        timestamp: new Date()
      };
      
      setConversationHistory(prev => [...prev, { role: 'assistant', content: errorResponse.content }]);
      setMessages(prev => [...prev, errorResponse]);
    }
  };

  const handleReset = () => {
    // Reset chat completely
    const resetMessages = [
      {
        id: '1',
        content: "Hey! I'm here to help you find what you're looking for. What kind of product do you need?",
        isBot: true,
        timestamp: new Date()
      }
    ];
    setMessages(resetMessages);
    setConversationHistory([]);
    setUserIntent({});
    setInputValue("");
    setIsTyping(false);
    setIsSearching(false);
    setSearchProducts([]);
    setShowResetTooltip(false);
    setFoundProduct(null);
    setShowPitchButton(false);
    
    // Clear saved messages and reset open count for this session
    localStorage.setItem(`chatMessages-${sessionId}`, JSON.stringify(resetMessages));
    localStorage.setItem(`chatOpenCount-${sessionId}`, '0');
    setChatOpenCount(0);
    
    // Reset size and position
    setSize({ width: 380, height: 480 });
    setPosition({ x: window.innerWidth - 420, y: window.innerHeight - 500 });
  };

  const dismissTooltip = () => {
    setShowResetTooltip(false);
    localStorage.setItem(`resetTooltipDismissed-${sessionId}`, 'true');
    setTooltipDismissed(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!chatRef.current) return;
    setIsDraggingWindow(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseUp = () => {
    setIsDraggingWindow(false);
    setIsResizing(false);
    setIsDragging(false);
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = size.width;
      let newHeight = size.height;
      let newX = position.x;
      let newY = position.y;

      if (isCollapsed) {
        // Collapsed state: only horizontal resizing, keep Y position fixed at bottom
        if (resizeDirection === 'right') {
          newWidth = Math.max(300, resizeStart.width + deltaX);
        }
        if (resizeDirection === 'left') {
          newWidth = Math.max(300, resizeStart.width - deltaX);
          newX = position.x + (size.width - newWidth);
        }
        // Keep Y position fixed at bottom edge
        newY = window.innerHeight - size.height;
      } else {
        // Normal state: full resizing
        if (resizeDirection.includes('right')) {
          newWidth = Math.max(300, resizeStart.width + deltaX);
        }
        if (resizeDirection.includes('left')) {
          newWidth = Math.max(300, resizeStart.width - deltaX);
          newX = position.x + (size.width - newWidth);
        }
        if (resizeDirection.includes('bottom')) {
          newHeight = Math.max(400, resizeStart.height + deltaY);
        }
        if (resizeDirection.includes('top')) {
          newHeight = Math.max(400, resizeStart.height - deltaY);
          newY = position.y + (size.height - newHeight);
        }
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    }
  };

  useEffect(() => {
    const cleanup = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    if (isDraggingWindow) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return cleanup;
  }, [isDraggingWindow, isDragging, isResizing, dragOffset.x, dragOffset.y, position.x, position.y, resizeStart]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`chatMessages-${sessionId}`, JSON.stringify(messages));
  }, [messages, sessionId]);

  // Track chat opens and enable button glowing only after second reopening after close
  useEffect(() => {
    if (isOpen) {
      const openCount = parseInt(localStorage.getItem(`chatOpenCount-${sessionId}`) || '0') + 1;
      setChatOpenCount(openCount);
      localStorage.setItem(`chatOpenCount-${sessionId}`, openCount.toString());
      
      const hasBeenClosed = localStorage.getItem(`chatClosed-${sessionId}`) === 'true';
      const reopenCount = parseInt(localStorage.getItem(`chatReopenCount-${sessionId}`) || '0');
      
      // Count reopens only after first close
      if (hasBeenClosed) {
        const newReopenCount = reopenCount + 1;
        localStorage.setItem(`chatReopenCount-${sessionId}`, newReopenCount.toString());
        
        // Start glowing only on the second reopen after closing
        if (newReopenCount === 2) {
          setIsButtonGlowing(true);
        }
      }
      
      console.log('Chat opened, count:', openCount, 'hasBeenClosed:', hasBeenClosed, 'reopenCount:', reopenCount);
    } else {
      // When chat closes, track that it was closed
      const hasBeenClosed = localStorage.getItem(`chatClosed-${sessionId}`) === 'true';
      if (!hasBeenClosed) {
        localStorage.setItem(`chatClosed-${sessionId}`, 'true');
        console.log('Chat closed for first time');
      }
    }
  }, [isOpen, sessionId]);

  // Show tooltip when hovering over glowing reset button
  const handleResetButtonHover = (e: React.MouseEvent, isHovering: boolean) => {
    setIsHoveringReset(isHovering);
    if (isHovering) {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setShowResetTooltip(true);
      
      // Start 3-second timer to stop glowing
      if (isButtonGlowing && !glowTimer) {
        const timer = setTimeout(() => {
          setIsButtonGlowing(false);
          setGlowTimer(null);
        }, 3000);
        setGlowTimer(timer);
      }
    } else {
      setShowResetTooltip(false);
    }
  };

  // Track mouse movement for tooltip positioning
  const handleMouseMove = (e: MouseEvent) => {
    if (isDraggingWindow) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
    if (isHoveringReset) {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleSnapToDefault = () => {
    if (isCollapsed) {
      // If collapsed, expand back to normal - preserve all chat state
      setIsCollapsed(false);
      // Return to slightly above original position
      setPosition({ x: position.x, y: 80 });
      setSize({ width: 400, height: 500 });
      setShouldGlowRestoreButton(false); // Stop glowing when restored
      setIsHoveringRestoreButton(false);
      if (hoverTimer) {
        clearTimeout(hoverTimer);
        setHoverTimer(null);
      }
      // Don't reset any chat state - messages, history, typing status should remain
    } else {
      // If normal, collapse to show only top bar - preserve all chat state
      setIsCollapsed(true);
      // Keep same X position, move down to bottom of screen
      setPosition({ x: position.x, y: window.innerHeight - 60 });
      setSize({ width: 400, height: 60 });
      setShouldGlowRestoreButton(false); // Don't auto-glow, only on hover
      // Don't reset any chat state - messages, history, typing status should remain
    }
  };

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isCollapsed) {
      // For expanded state, enable full window dragging
      setIsDraggingWindow(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    } else {
      // For collapsed state, enable dragging to move it anywhere
      setIsDraggingWindow(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (isDragging && isCollapsed) {
      const deltaY = dragStartY - e.clientY;
      if (deltaY > 50) { // Threshold to expand
        setIsCollapsed(false);
        setSize({ width: 400, height: 500 });
        setPosition({ x: window.innerWidth - 420, y: Math.max(50, e.clientY - 250) });
        setIsDragging(false);
        setShouldGlowRestoreButton(false); // Stop glowing when restored
        setIsHoveringRestoreButton(false);
        if (hoverTimer) {
          clearTimeout(hoverTimer);
          setHoverTimer(null);
        }
        
        // Preserve chat state when expanding - don't reset anything
        // Messages, conversation history, and all state should remain intact
      }
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Add global search trigger function for Search Now button
  useEffect(() => {
    (window as any).triggerChatSearch = () => {
      setUserIntent(prev => ({ ...prev, confirmed: true }));
      
      // Trigger search immediately
      const searchMessage = "yes";
      const newHistory = [...conversationHistory, { role: 'user' as const, content: searchMessage }];
      setConversationHistory(newHistory);
      
      // Add user confirmation message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: "Search Now",
        isBot: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Start search process
      setIsSearching(true);
      setSearchProducts([]);
      
      const searchTerms = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Beauty', 'Automotive', 'Toys'];
      let searchIndex = 0;
      const searchInterval = setInterval(() => {
        if (searchIndex < searchTerms.length) {
          setSearchProducts(prev => [...prev, searchTerms[searchIndex]]);
          searchIndex++;
        } else {
          clearInterval(searchInterval);
        }
      }, 300);

      setTimeout(() => {
        setIsSearching(false);
        setSearchProducts([]);
        
        const hasProducts = affiliateLinks && affiliateLinks.length > 0;
        let botResponseContent: string;
        
        if (!hasProducts) {
          botResponseContent = "I searched the creator dashboard but there aren't any products available right now. The dashboard appears empty at the moment. Please check back later when new deals have been added.";
        } else {
          botResponseContent = generateContextualResponse("search", newHistory, { ...userIntent, confirmed: true });
        }
        
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: botResponseContent,
          isBot: true,
          timestamp: new Date()
        };

        setConversationHistory(prev => [...prev, { role: 'assistant', content: botResponseContent }]);
        setMessages(prev => [...prev, botResponse]);
      }, 2000);
    };
    
    return () => {
      delete (window as any).triggerChatSearch;
    };
  }, [conversationHistory, userIntent, affiliateLinks]);

  // Chat button visibility logic - initial fade in
  useEffect(() => {
    if (isOpen) return; // Don't show button when chat is open
    
    // Initial fade in after 4 seconds on page load
    const initialTimer = setTimeout(() => {
      if (!isAnimationPaused && !isHovering) {
        setIsButtonFading(true);
        
        // Auto fade out after 7 seconds
        const fadeOutTimer = setTimeout(() => {
          if (!isHovering && !isAnimationPaused) {
            setIsButtonFading(false);
          }
        }, 7000);
        
        setFadeTimer(fadeOutTimer);
      }
    }, 4000);

    return () => {
      clearTimeout(initialTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, []); // Only run once on mount

  // Scroll behavior - slide up animation when scrolling down
  useEffect(() => {
    if (isOpen) return; // Don't handle scroll when chat is open
    
    let lastScrollY = 0;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Clear any existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // If scrolling down (moved down more than 50px), slide up and fade out completely
      if (scrollY > lastScrollY && scrollY > 50) {
        setIsSlideUp(true);
        setIsButtonFading(false);
        if (fadeTimer) {
          clearTimeout(fadeTimer);
          setFadeTimer(null);
        }
      } 
      // If scrolling up or near top, show button again
      else if (scrollY <= 50 || scrollY < lastScrollY) {
        setIsSlideUp(false);
        
        if (!isAnimationPaused && !isHovering) {
          const timeout = setTimeout(() => {
            // Wait 2 seconds after user stops scrolling to show button
            setTimeout(() => {
              setIsButtonFading(true);
              
              // Auto fade out after 7 seconds
              const fadeOutTimer = setTimeout(() => {
                if (!isHovering && !isAnimationPaused) {
                  setIsButtonFading(false);
                }
              }, 7000);
              
              setFadeTimer(fadeOutTimer);
            }, 2000);
          }, 100);
          
          setScrollTimeout(timeout);
        }
      }
      
      lastScrollY = scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [scrollTimeout]);

  if (!isOpen) {
    return (
      <>
        {/* Animated Chat Button - Always in DOM for smooth transitions */}
        <button
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => {
            setIsHovering(true);
            setShowControlButton(true);
            // Clear fade out timer when hovering
            if (fadeTimer) {
              clearTimeout(fadeTimer);
              setFadeTimer(null);
            }
          }}
          onMouseLeave={() => {
            setIsHovering(false);
            setShowControlButton(false);
            // Restart fade timer when leaving hover if not paused
            if (!isAnimationPaused && isButtonFading) {
              const fadeOutTimer = setTimeout(() => {
                setIsButtonFading(false);
              }, 7000);
              setFadeTimer(fadeOutTimer);
            }
          }}
          className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 group transition-all duration-700 ease-out ${
            isButtonFading && !isSlideUp ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          } ${isSlideUp ? 'transform translate-y-32' : 'transform translate-y-0'}`}
          style={{
            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)'
          }}
        >
          <div className="relative flex items-center justify-center">
            <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>
        </button>

        {/* Pause/Play Control Button */}
        <div
          className={`fixed bottom-4 left-2 z-50 transition-opacity duration-300 ${
            showControlButton || isHovering ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            onClick={() => {
              setIsAnimationPaused(!isAnimationPaused);
              // If unpausing and button is visible, start fade timer
              if (isAnimationPaused && isButtonFading) {
                const fadeOutTimer = setTimeout(() => {
                  if (!isHovering) {
                    setIsButtonFading(false);
                  }
                }, 7000);
                setFadeTimer(fadeOutTimer);
              }
            }}
            className="w-8 h-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 shadow-lg"
          >
            {isAnimationPaused ? (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            ) : (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            )}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Reset Button Tooltip - Shows when hovering over glowing reset button */}
      {showResetTooltip && isOpen && isHoveringReset && (
        <div 
          className="fixed z-[1000] pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 35
          }}
        >
          <div className="bg-black/90 text-white text-xs px-2 py-1 rounded shadow-lg">
            <span>Reset chat</span>
          </div>
        </div>
      )}

      <div
        ref={chatRef}
        className={`fixed z-50 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden ${
          isCollapsed ? 'cursor-pointer' : 'cursor-move'
        } ${isCollapsed ? 'rounded-b-none' : ''}`}
        style={{
          left: isCollapsed ? position.x : Math.max(0, Math.min(position.x, window.innerWidth - size.width)),
          top: isCollapsed ? position.y : Math.max(0, Math.min(position.y, window.innerHeight - size.height)),
          width: size.width,
          height: size.height,
          backgroundColor: 'rgba(34, 38, 50, 0.95)',
          backdropFilter: 'blur(10px)',
          transform: 'translateZ(0)' // Force hardware acceleration for better rendering
        }}
        onClick={isCollapsed ? (e) => {
          e.stopPropagation();
          // Only expand if clicking in the center area, not corners (resize handles)
          // And only if not dragging
          if (!isDraggingWindow) {
            const rect = chatRef.current?.getBoundingClientRect();
            if (rect) {
              const clickX = e.clientX - rect.left;
              const clickY = e.clientY - rect.top;
              // Exclude corner areas (first/last 20px of width, any height)
              if (clickX > 20 && clickX < rect.width - 20) {
                handleSnapToDefault();
              }
            }
          }
        } : undefined}
        onMouseDown={!isCollapsed ? handleMouseDown : undefined}
      >
      {/* Header with controls */}
      <div 
        className={`bg-gray-800 bg-opacity-50 p-3 flex items-center justify-between ${
          isCollapsed ? 'cursor-pointer' : 'cursor-grab'
        }`}
        onMouseDown={!isCollapsed ? handleDragStart : undefined}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white font-medium text-sm">Elite Deal Assistant</span>
        </div>
        
        <div className="flex items-center gap-2 relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isCollapsed) {
                // When collapsed, reposition slightly above original location
                setPosition({ x: position.x, y: 80 });
              } else {
                // When not collapsed, reset the chat
                handleReset();
              }
              setIsHoveringReset(false);
              setShowResetTooltip(false);
              // Stop glowing immediately when clicked
              setIsButtonGlowing(false);
              if (glowTimer) {
                clearTimeout(glowTimer);
                setGlowTimer(null);
              }
            }}
            className={`p-1 rounded transition-all duration-300 cursor-pointer relative ${
              isButtonGlowing 
                ? isHoveringReset 
                  ? 'bg-blue-500' 
                  : 'ring-2 ring-blue-400 ring-opacity-75 animate-pulse hover:bg-gray-600'
                : 'hover:bg-gray-600'
            }`}
            title={isCollapsed ? "Reposition chat to original location" : "Reset chat and start new conversation"}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseEnter={(e) => {
              if (isButtonGlowing) {
                handleResetButtonHover(e, true);
              }
            }}
            onMouseLeave={(e) => {
              handleResetButtonHover(e, false);
            }}
            onMouseMove={(e) => {
              if (isHoveringReset) {
                setMousePosition({ x: e.clientX, y: e.clientY });
              }
            }}
          >
            <RotateCcw className={`w-4 h-4 transition-all duration-300 ${
              isButtonGlowing 
                ? isHoveringReset 
                  ? 'text-white' 
                  : 'text-blue-300 drop-shadow-[0_0_4px_rgba(59,130,246,0.8)]'
                : 'text-gray-300'
            }`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSnapToDefault();
            }}
            className={`p-1 rounded transition-all duration-300 cursor-pointer ${
              shouldGlowRestoreButton && isCollapsed
                ? 'bg-blue-500 ring-2 ring-blue-400 ring-opacity-75 animate-pulse hover:bg-blue-600'
                : 'hover:bg-gray-600'
            }`}
            title={isCollapsed ? "Restore chat messages" : "Collapse to bottom"}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseEnter={() => {
              if (isCollapsed && messages.length > 1) {
                setIsHoveringRestoreButton(true);
                setShouldGlowRestoreButton(true);
                
                // Auto-expand after 6 seconds of hovering
                const timer = setTimeout(() => {
                  if (isHoveringRestoreButton) {
                    handleSnapToDefault();
                  }
                }, 6000);
                setHoverTimer(timer);
              }
            }}
            onMouseLeave={() => {
              setIsHoveringRestoreButton(false);
              setShouldGlowRestoreButton(false);
              if (hoverTimer) {
                clearTimeout(hoverTimer);
                setHoverTimer(null);
              }
            }}
          >
            <MousePointer className={`w-4 h-4 transition-colors ${
              shouldGlowRestoreButton && isCollapsed
                ? 'text-white drop-shadow-[0_0_4px_rgba(59,130,246,0.8)]'
                : 'text-gray-300'
            }`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="p-1 hover:bg-red-600 rounded transition-colors cursor-pointer"
            title="Close chat"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Messages area - hidden when collapsed but state preserved */}
      <div 
        className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'hidden' : 'block'}`} 
        style={{ height: 'calc(100% - 60px)' }}
      >
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-4" 
          style={{ maxHeight: 'calc(100% - 80px)' }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} group`}
            >
              <div className="flex flex-col max-w-xs">
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.isBot
                      ? 'bg-blue-600 bg-opacity-40 text-white border border-blue-500 border-opacity-30'
                      : 'bg-gray-700 text-white'
                  }`}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: message.isBot ? 300 : 400
                  }}
                >
                  <AnimatedMessage content={message.content} isBot={message.isBot} />
                </div>
                {/* Reply button and Pitch button */}
                <div className={`mt-1 flex gap-3 opacity-0 group-hover:opacity-100 ${
                  message.isBot ? 'justify-start' : 'justify-end'
                }`}>
                  <button
                    onClick={() => setReplyingTo(message)}
                    className="text-xs text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    Reply to this
                  </button>
                  
                  {/* Multi-colored "Why I Pitch This?" button - only show when product is found */}
                  {showPitchButton && message.isBot && (
                    <button
                      onClick={handlePitchClick}
                      className="text-xs transition-colors"
                      style={{
                        background: 'linear-gradient(45deg, #3b82f6, #eab308, #22c55e, #a855f7)',
                        backgroundSize: '300% 300%',
                        animation: 'gradient-fade 3s ease-in-out infinite',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      Why I Pitch This?
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isSearching && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 bg-opacity-40 border border-purple-500 border-opacity-30 text-white px-4 py-3 rounded-lg min-w-60">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Searching products...</span>
                </div>
                <div className="text-xs text-gray-300 max-h-16 overflow-hidden">
                  {searchProducts.map((product, index) => (
                    <div key={index} className="animate-pulse mb-1">
                      Checking {product}...
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isTyping && !isSearching && countdown > 0 && (
            <div className="flex justify-start">
              <div className="bg-blue-600 bg-opacity-40 border border-blue-500 border-opacity-30 text-white px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <div className="text-sm text-gray-300">
                    Crafting perfect sales pitch... ~{countdown}s
                  </div>
                  {showCancelButton && (
                    <button
                      onClick={handleCancelPitch}
                      className="ml-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                    >
                      ✕ Cancel
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  You can still send messages while I'm crafting this pitch
                </div>
              </div>
            </div>
          )}

          {isTyping && !isSearching && countdown === 0 && (
            <div className="flex justify-start">
              <div className="bg-blue-600 bg-opacity-40 border border-blue-500 border-opacity-30 text-white px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* New message popup notification */}
        {showNewMessagePopup && (
          <div className="absolute top-12 left-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center justify-between z-50">
            <span className="text-sm">New message ready! 👆</span>
            <button
              onClick={() => setShowNewMessagePopup(false)}
              className="ml-2 text-white hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-gray-700 p-4 mt-auto">
          {/* Recommended Questions - Dynamic based on conversation */}
          {(() => {
            const aiMessages = history.filter(msg => msg.role === 'assistant');
            const lastAiMessage = aiMessages[aiMessages.length - 1]?.content.toLowerCase() || '';
            
            let suggestedQuestions = [];
            
            if (messages.length <= 1) {
              // Initial conversation starters
              suggestedQuestions = [
                "Looking for electronics",
                "Need something affordable", 
                "Show me trending deals",
                "Want quality products",
                "Find tech gadgets",
                "Best value items"
              ];
            } else if (lastAiMessage.includes('what') || lastAiMessage.includes('tell me') || lastAiMessage.includes('share')) {
              // AI asked a question - provide contextual responses
              suggestedQuestions = [
                "For work/office use",
                "Something under $50", 
                "High quality preferred",
                "Popular trending items",
                "Tech and gadgets",
                "Home and lifestyle"
              ];
            } else if (lastAiMessage.includes('found') || lastAiMessage.includes('product') || lastAiMessage.includes('match')) {
              // AI recommended a product - provide follow-up questions
              suggestedQuestions = [
                "Tell me more about it",
                "What makes it special?", 
                "Show me alternatives",
                "Is it worth the price?",
                "Any similar options?",
                "What's the best deal?"
              ];
            } else {
              // General conversation follow-ups
              suggestedQuestions = [
                "Show me more options",
                "Something different", 
                "What's most popular?",
                "Best value for money",
                "Latest arrivals",
                "Top rated products"
              ];
            }
            
            return suggestedQuestions.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-2">
                  {messages.length <= 1 ? "Quick questions to ask:" : "You might want to ask:"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputValue(question);
                        setTimeout(handleSendMessage, 100);
                      }}
                      className="px-3 py-1 text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white rounded-full border border-gray-600 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
          
          {/* Reply indicator */}
          {replyingTo && (
            <div className="mb-3 p-2 bg-gray-800 rounded border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">
                    Replying to {replyingTo.isBot ? 'Assistant' : 'You'}:
                  </div>
                  <div className="text-sm text-gray-300 truncate">
                    {replyingTo.content.substring(0, 60)}...
                  </div>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={replyingTo ? `Reply to message...` : "Ask me anything about deals..."}
              className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm cursor-text"
              style={{ fontFamily: 'Inter, sans-serif' }}
              onMouseDown={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSendMessage();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
              onMouseDown={(e) => e.stopPropagation()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
      
      {/* Resize handles - only show when not collapsed */}
      {!isCollapsed && (
        <>
          <div
            className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize bg-gray-600 hover:bg-gray-500 transition-colors opacity-50"
            onMouseDown={(e) => handleResizeStart(e, 'top-left')}
          />
          <div
            className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize bg-gray-600 hover:bg-gray-500 transition-colors opacity-50"
            onMouseDown={(e) => handleResizeStart(e, 'top-right')}
          />
          <div
            className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize bg-gray-600 hover:bg-gray-500 transition-colors opacity-50"
            onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
          />
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-600 hover:bg-gray-500 transition-colors"
            onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
            style={{
              clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)'
            }}
          />
        </>
      )}
      
      {/* Horizontal resize handles for collapsed state - only left and right - INVISIBLE but functional */}
      {isCollapsed && (
        <>
          <div
            className="absolute top-0 left-0 w-5 h-full cursor-w-resize opacity-0"
            onMouseDown={(e) => {
              e.stopPropagation(); // Prevent expansion click
              handleResizeStart(e, 'left');
            }}
          />
          <div
            className="absolute top-0 right-0 w-5 h-full cursor-e-resize opacity-0"
            onMouseDown={(e) => {
              e.stopPropagation(); // Prevent expansion click
              handleResizeStart(e, 'right');
            }}
          />
        </>
      )}
      </div>
    </>
  );
}