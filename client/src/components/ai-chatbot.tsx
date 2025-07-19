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
            content: "Hey! 👋 I'm your personal deal hunter. What are you looking to score today?",
            isBot: true,
            timestamp: new Date()
          }
        ];
      }
    }
    return [
      {
        id: '1',
        content: "Hey! 👋 I'm your personal deal hunter. What are you looking to score today?",
        isBot: true,
        timestamp: new Date()
      }
    ];
  });
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [position, setPosition] = useState<ChatPosition>({ x: window.innerWidth - 420, y: window.innerHeight - 500 });
  const [size, setSize] = useState({ width: 380, height: 480 });
  const [isDragging, setIsDragging] = useState(false);
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
    
    // Check conversation context for better responses
    const previousMessages = history.slice(-4);
    const hasDiscussedProducts = previousMessages.some(msg => 
      msg.content.toLowerCase().includes('product') || 
      msg.content.toLowerCase().includes('deal') || 
      msg.content.toLowerCase().includes('buy')
    );

    // Handle off-topic queries with direct, helpful responses
    if (lowerQuery.includes('weather') || lowerQuery.includes('temperature') || lowerQuery.includes('forecast')) {
      return `I specialize in product deals rather than weather updates. However, if you need weather-related gear like jackets, umbrellas, or outdoor equipment, I can help you find those deals.`;
    } 
    
    if (lowerQuery.includes('news') || lowerQuery.includes('politics') || lowerQuery.includes('election')) {
      return `I focus on finding product deals rather than current events. Is there anything specific you'd like to shop for today?`;
    }
    
    if (lowerQuery.includes('stock') || lowerQuery.includes('crypto') || lowerQuery.includes('bitcoin') || lowerQuery.includes('investment')) {
      return `I help with product deals rather than financial markets. Are you looking for any specific products or electronics today?`;
    }
    
    if (lowerQuery.includes('quantum') || lowerQuery.includes('physics') || lowerQuery.includes('medical') || lowerQuery.includes('legal') || lowerQuery.includes('doctor')) {
      return `That's outside my area of expertise. I specialize in finding great deals on products. What type of items are you interested in purchasing?`;
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

  // Aggressive sales psychology pitch when product is found
  const generateAggressivePitch = (product: AffiliateLink, userHistory: string[]): string => {
    const userWords = userHistory.join(' ').toLowerCase();
    const personalizedTerms = [];
    
    // Extract user's words to use against them
    if (userWords.includes('need') || userWords.includes('want')) personalizedTerms.push('essential need');
    if (userWords.includes('budget') || userWords.includes('cheap') || userWords.includes('affordable')) personalizedTerms.push('incredible value');
    if (userWords.includes('quality') || userWords.includes('good') || userWords.includes('best')) personalizedTerms.push('premium quality');
    if (userWords.includes('work') || userWords.includes('job') || userWords.includes('office')) personalizedTerms.push('professional edge');
    
    const triggers = [
      `Listen, I'm going to be brutally honest with you about "${product.title}" because I genuinely care about your success.`,
      `You mentioned ${personalizedTerms[0] || 'finding the right solution'} - this is EXACTLY what you've been searching for.`,
      `I've seen thousands of people transform their lives with this exact product. The ones who hesitate? They regret it for months.`,
      `Here's what nobody else will tell you: ${product.description}`,
      `But here's the thing that really gets me excited for you - this isn't just about the product. It's about who you become when you own it.`,
      `Think about this: Every day you delay is another day you're settling for less than you deserve.`,
      `I'm not supposed to share this, but I've personally seen people pay 3x more for inferior alternatives. This deal won't last.`,
      `Your future self is literally begging you to make this decision right now. Don't let fear steal your breakthrough.`,
      `Look, I could show you dozens of other options, but I'd be doing you a disservice. This is THE one.`,
      `The people who succeed? They recognize opportunity when it knocks. This is your knock.`,
      `I'm going to ask you a tough question: What's the cost of staying exactly where you are right now?`,
      `Every successful person I know has that ONE purchase that changed everything. This could be yours.`,
      `You know what separates the dreamers from the achievers? The achievers take action when they see perfection.`,
      `I can see from our conversation that you're not like everyone else. You actually care about quality and results.`,
      `This product doesn't just solve your immediate need - it positions you for success in ways you can't even imagine yet.`,
      `I'm going to be straight with you: I've never been more confident about recommending anything in my life.`,
      `Years from now, you'll remember this exact moment as the turning point. The question is: which direction will you turn?`,
      `Stop overthinking this. Your instincts brought you here for a reason. Trust them.`,
      `The universe has a funny way of putting exactly what you need right in front of you. This is that moment.`,
      `Ready to stop dreaming and start living? Click that link and watch your life upgrade instantly.`
    ];

    return triggers.join('\n\n');
  };

  const handlePitchClick = () => {
    if (!foundProduct) return;
    
    setIsTyping(true);
    
    // Set initial countdown for pitch response (20-60 seconds)
    const pitchDelay = Math.random() * 40000 + 20000;
    const initialCountdown = Math.ceil(pitchDelay / 1000);
    setCountdown(initialCountdown);
    
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Collect all user messages for personalization
    const userMessages = messages.filter(m => !m.isBot).map(m => m.content);
    
    setTimeout(() => {
      setIsTyping(false);
      setCountdown(0);
      clearInterval(countdownInterval);
      
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
  };

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // If we have real products, include them in responses
    const hasProducts = affiliateLinks.length > 0;
    const randomProduct = hasProducts ? affiliateLinks[Math.floor(Math.random() * affiliateLinks.length)] : null;
    
    // Product-specific responses with real data
    if (message.includes('best') || message.includes('recommend') || message.includes('which')) {
      if (hasProducts && randomProduct) {
        // Enable pitch button for product recommendations
        setTimeout(() => {
          setFoundProduct(randomProduct);
          setShowPitchButton(true);
          console.log('Product recommendation found, enabling pitch button:', randomProduct.title);
        }, 100);
        
        return `Perfect timing! 🎯 I'd recommend "${randomProduct.title}" - it's been absolutely crushing it with our users! ${randomProduct.description.slice(0, 100)}... Want the exclusive link?`;
      }
      return getRandomResponse('product');
    }
    
    // Show available deals
    if (message.includes('deals') || message.includes('what') || message.includes('show') || message.includes('available')) {
      if (hasProducts) {
        const topDeals = affiliateLinks.slice(0, 3);
        const dealsList = topDeals.map(deal => `• ${deal.title} (${deal.category})`).join('\n');
        
        // Enable pitch button when showing deals
        if (affiliateLinks.length > 0) {
          setTimeout(() => {
            setFoundProduct(affiliateLinks[0]);
            setShowPitchButton(true);
            console.log('Deal list shown, enabling pitch button for:', affiliateLinks[0].title);
          }, 100);
        }
        
        return `Here are our hottest deals right now! 🔥\n\n${dealsList}\n\nWhich one catches your eye? I can hook you up with the best price! 💰`;
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
        // Set countdown for search response
        const searchDelay = 2000;
        setCountdown(Math.ceil(searchDelay / 1000));
        
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        setTimeout(() => {
          setIsSearching(false);
          setSearchProducts([]);
          setIsTyping(false);
          setCountdown(0);
          clearInterval(countdownInterval);
          
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
          
          // Show popup notification for new message
          setShowNewMessagePopup(true);
          
          // Auto-hide popup after 5 seconds
          setTimeout(() => {
            setShowNewMessagePopup(false);
          }, 5000);
        }, searchDelay);
      } else {
        // Generate response without search animation
        const normalDelay = 1500;
        setCountdown(Math.ceil(normalDelay / 1000));
        
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        setTimeout(() => {
          setIsTyping(false);
          setCountdown(0);
          clearInterval(countdownInterval);
          
          const botResponseContent = generateContextualResponse(messageToProcess, newHistory, newIntentData);
          
          // Check for product mentions in non-search responses too
          const hasProducts = affiliateLinks && affiliateLinks.length > 0;
          if (hasProducts) {
            const foundSpecificProduct = affiliateLinks.find(link => 
              messageToProcess.toLowerCase().includes(link.title.toLowerCase()) ||
              messageToProcess.toLowerCase().includes(link.category.toLowerCase()) ||
              botResponseContent.toLowerCase().includes(link.title.toLowerCase())
            );
            
            if (foundSpecificProduct) {
              setFoundProduct(foundSpecificProduct);
              setShowPitchButton(true);
              console.log('Product found in regular response, enabling pitch button:', foundSpecificProduct.title);
            }
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
          
          // Show popup notification for new message
          setShowNewMessagePopup(true);
          
          // Auto-hide popup after 5 seconds
          setTimeout(() => {
            setShowNewMessagePopup(false);
          }, 5000);
        }, normalDelay);
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
        content: "Hey! 👋 I'm your personal deal hunter. What are you looking to score today?",
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
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
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

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return cleanup;
  }, [isDragging, isResizing, dragOffset.x, dragOffset.y, position.x, position.y, resizeStart]);

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
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
    if (isHoveringReset) {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
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
        className="fixed z-50 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden cursor-move"
        style={{
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
          backgroundColor: 'rgba(34, 38, 50, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
        onMouseDown={handleMouseDown}
      >
      {/* Header with controls */}
      <div 
        className="bg-gray-800 bg-opacity-50 p-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white font-medium text-sm">Elite Deal Assistant</span>
        </div>
        
        <div className="flex items-center gap-2 relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
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
            title="Reset chat and start new conversation"
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
              handleReset();
            }}
            className="p-1 hover:bg-gray-600 rounded transition-colors cursor-pointer"
            title="Snap to default"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <MousePointer className="w-4 h-4 text-gray-300" />
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

      {/* Messages area */}
      <div className="flex flex-col" style={{ height: 'calc(100% - 60px)' }}>
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

          {isTyping && !isSearching && (
            <div className="flex justify-start">
              <div className="bg-blue-600 bg-opacity-40 border border-blue-500 border-opacity-30 text-white px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <div className="text-sm text-gray-300">
                    Crafting perfect response... {countdown > 0 ? `~${countdown}s` : ''}
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  You can still send messages while I'm thinking
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
      
      {/* Resize handles - all 4 corners */}
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
      </div>
    </>
  );
}