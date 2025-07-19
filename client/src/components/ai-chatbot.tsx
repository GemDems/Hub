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
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hey! 👋 I'm your personal deal hunter. What are you looking to score today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
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
  
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch real affiliate links data
  const { data: affiliateLinks = [] } = useQuery<AffiliateLink[]>({
    queryKey: ["/api/affiliate-links"],
  });

  // Predefined responses for conversion optimization
  const botResponses = {
    greeting: [
      "What's good! Looking for some fire deals? 🔥",
      "Hey there! Ready to save some serious cash? 💰",
      "Yo! What kind of deals are calling your name today? 👀"
    ],
    product: [
      "That's a solid choice! This one's been flying off the shelves 🚀 Want me to hook you up with the best deal?",
      "Oh snap, you've got great taste! 🎯 This is actually one of our elite picks. Ready to grab it?",
      "YES! That's exactly what I'd recommend too 💯 Want the exclusive discount link?"
    ],
    comparison: [
      "Great question! Here's the real talk - this one beats the competition because... 🏆 Want me to show you why?",
      "Smart to compare! This option is actually crushing it with our users 📈 Here's what makes it special...",
      "I love that you're doing your research! 🧠 Let me break down why this is the winner..."
    ],
    urgency: [
      "Real talk - this deal expires soon ⏰ Only got a few spots left!",
      "Not gonna lie, prices might jump tomorrow 📈 Want me to lock this in for you?",
      "Heads up - this is limited time only! 🚨 Should we secure your spot?"
    ],
    objection: [
      "I totally get it! Here's why this is different from everything else you've tried... 💪",
      "Valid concern! That's exactly why we offer a full guarantee 🛡️ Zero risk for you!",
      "Been there! But check this - our users are seeing crazy results 📊 Want to see the proof?"
    ]
  };

  const getRandomResponse = (category: keyof typeof botResponses) => {
    const responses = botResponses[category];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const analyzeUserIntent = (message: string, currentIntent: any) => {
    const lowerMessage = message.toLowerCase();
    const newIntent = { ...currentIntent };
    
    // Extract category information
    const categories = ['electronics', 'fashion', 'home', 'garden', 'sports', 'books', 'beauty', 'automotive', 'toys'];
    categories.forEach(cat => {
      if (lowerMessage.includes(cat)) {
        newIntent.category = cat;
      }
    });
    
    // Extract budget information
    if (lowerMessage.includes('$') || lowerMessage.includes('budget') || lowerMessage.includes('price')) {
      const budgetMatch = message.match(/\$(\d+)/);
      if (budgetMatch) {
        newIntent.budget = budgetMatch[1];
      }
    }
    
    // Extract features
    const features = [];
    if (lowerMessage.includes('wireless') || lowerMessage.includes('bluetooth')) features.push('wireless');
    if (lowerMessage.includes('waterproof') || lowerMessage.includes('water resistant')) features.push('waterproof');
    if (lowerMessage.includes('fast') || lowerMessage.includes('quick')) features.push('fast');
    if (lowerMessage.includes('portable') || lowerMessage.includes('travel')) features.push('portable');
    
    if (features.length > 0) {
      newIntent.features = [...(newIntent.features || []), ...features];
    }
    
    // Check for confirmation
    if (lowerMessage.includes('yes') || lowerMessage.includes('confirm') || lowerMessage.includes('search') || lowerMessage.includes('find')) {
      newIntent.confirmed = true;
    }
    
    return newIntent;
  };

  const generateContextualResponse = (userMessage: string, history: Array<{role: 'user' | 'assistant', content: string}>, intent?: any): string => {
    const lowerQuery = userMessage.toLowerCase();
    
    // Check conversation context for better responses
    const previousMessages = history.slice(-4); // Last 4 messages for context
    const hasDiscussedProducts = previousMessages.some(msg => 
      msg.content.toLowerCase().includes('product') || 
      msg.content.toLowerCase().includes('deal') || 
      msg.content.toLowerCase().includes('buy')
    );

    // Check if user is asking about specific topics outside our scope
    if (lowerQuery.includes('weather') || lowerQuery.includes('temperature') || lowerQuery.includes('forecast')) {
      return "I find deals, not weather! Need weather gear or outdoor equipment?";
    } else if (lowerQuery.includes('news') || lowerQuery.includes('politics') || lowerQuery.includes('election')) {
      return "I find deals, not news! What can I help you shop for?";
    } else if (lowerQuery.includes('stock') || lowerQuery.includes('crypto') || lowerQuery.includes('bitcoin') || lowerQuery.includes('investment')) {
      return "I find product deals, not financial advice! What are you shopping for?";
    } else if (lowerQuery.includes('quantum') || lowerQuery.includes('physics') || lowerQuery.includes('medical') || lowerQuery.includes('legal') || lowerQuery.includes('doctor')) {
      return "That's outside my expertise! I find deals. What products do you need?";
    }

    // Check if we should ask for more information or proceed with search
    if (intent && !intent.confirmed && (intent.category || intent.features?.length)) {
      let response = "";
      if (intent.category) {
        response += `Got it - ${intent.category}. `;
      }
      if (intent.features?.length) {
        response += `Features: ${intent.features.join(', ')}. `;
      }
      if (!intent.budget) {
        response += "Budget? ";
      }
      response += "Search deals now?";
      return response;
    }

    // Use affiliate links data if available and confirmed
    const hasProducts = affiliateLinks.length > 0;
    if (hasProducts && intent?.confirmed) {
      const categories = [...new Set(affiliateLinks.map((link: any) => link.category))];
      const productNames = affiliateLinks.map((link: any) => link.title);
      
      // Look for specific product mentions in query
      const mentionedProducts = productNames.filter(name => 
        lowerQuery.includes(name.toLowerCase()) || 
        name.toLowerCase().includes(lowerQuery)
      );
      
      if (mentionedProducts.length > 0) {
        const product = affiliateLinks.find((link: any) => link.title === mentionedProducts[0]);
        return `Found "${product.title}" - ${product.description.slice(0, 50)}... Great deal!`;
      } else if (lowerQuery.includes('more') || lowerQuery.includes('other') || lowerQuery.includes('different')) {
        if (hasDiscussedProducts) {
          const randomProducts = productNames.sort(() => 0.5 - Math.random()).slice(0, 3);
          return `Other options: ${randomProducts.join(', ')}. Which interests you?`;
        } else {
          return `${affiliateLinks.length} deals available. Popular: ${productNames.slice(0, 3).join(', ')}. What type?`;
        }
      } else if (categories.some(cat => lowerQuery.includes(cat.toLowerCase()))) {
        const matchedCategory = categories.find(cat => lowerQuery.includes(cat.toLowerCase()));
        const categoryProducts = affiliateLinks.filter((link: any) => link.category === matchedCategory);
        return `${categoryProducts.length} ${matchedCategory} deals found. Top picks: ${categoryProducts.slice(0, 3).map((p: any) => p.title).join(', ')}. Which one?`;
      } else if (lowerQuery.includes('best') || lowerQuery.includes('recommend') || lowerQuery.includes('top')) {
        const topProducts = productNames.slice(0, 3);
        return `Top deals: ${topProducts.join(', ')}. Want details?`;
      } else {
        // Contextual response based on conversation
        if (hasDiscussedProducts) {
          return `Also have ${categories.slice(0, 2).join(' and ')} deals. ${affiliateLinks.length} total. What features?`;
        } else {
          return `${affiliateLinks.length} deals across ${categories.slice(0, 3).join(', ')}. What are you shopping for?`;
        }
      }
    } else if (hasProducts) {
      // Products available but not confirmed search yet
      const categories = [...new Set(affiliateLinks.map((link: any) => link.category))];
      return `${affiliateLinks.length} deals available in ${categories.slice(0, 3).join(', ')}. What are you shopping for?`;
    } else {
      return "I help find deals! No products loaded right now, but check back soon for amazing deals!";
    }
  };

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // If we have real products, include them in responses
    const hasProducts = affiliateLinks.length > 0;
    const randomProduct = hasProducts ? affiliateLinks[Math.floor(Math.random() * affiliateLinks.length)] : null;
    
    // Product-specific responses with real data
    if (message.includes('best') || message.includes('recommend') || message.includes('which')) {
      if (hasProducts && randomProduct) {
        return `Perfect timing! 🎯 I'd recommend "${randomProduct.title}" - it's been absolutely crushing it with our users! ${randomProduct.description.slice(0, 100)}... Want the exclusive link?`;
      }
      return getRandomResponse('product');
    }
    
    // Show available deals
    if (message.includes('deals') || message.includes('what') || message.includes('show') || message.includes('available')) {
      if (hasProducts) {
        const topDeals = affiliateLinks.slice(0, 3);
        const dealsList = topDeals.map(deal => `• ${deal.title} (${deal.category})`).join('\n');
        return `Here are our hottest deals right now! 🔥\n\n${dealsList}\n\nWhich one catches your eye? I can hook you up with the best price! 💰`;
      }
      return "We're loading up some incredible deals right now! 🚀 Check back in a few minutes for the latest drops. Want me to notify you when they're live?";
    }
    
    // Category-specific recommendations
    affiliateLinks.forEach(link => {
      if (message.includes(link.category.toLowerCase()) || message.includes(link.title.toLowerCase())) {
        return `YES! "${link.title}" is exactly what you need! 🎯 ${link.description.slice(0, 80)}... This is flying off the shelves. Ready to grab it?`;
      }
    });
    
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

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    // Add to conversation history
    const newHistory = [...conversationHistory, { role: 'user' as const, content: inputValue }];
    setConversationHistory(newHistory);
    setMessages(prev => [...prev, userMessage]);
    
    const messageToProcess = inputValue;
    setInputValue("");
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
          
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: generateContextualResponse(messageToProcess, newHistory, newIntentData),
            isBot: true,
            timestamp: new Date()
          };

          // Add bot response to conversation history
          setConversationHistory(prev => [...prev, { role: 'assistant', content: botResponse.content }]);
          setMessages(prev => [...prev, botResponse]);
        }, 2000); // 2 second search animation
      } else {
        // Generate response without search animation
        setTimeout(() => {
          setIsTyping(false);
          
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: generateContextualResponse(messageToProcess, newHistory, newIntentData),
            isBot: true,
            timestamp: new Date()
          };

          // Add bot response to conversation history
          setConversationHistory(prev => [...prev, { role: 'assistant', content: botResponse.content }]);
          setMessages(prev => [...prev, botResponse]);
        }, 1500); // Normal response time
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
    setSize({ width: 380, height: 480 });
    setPosition({ x: window.innerWidth - 420, y: window.innerHeight - 500 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!chatRef.current) return;
    setIsDragging(true);
    const rect = chatRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
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
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Chat button visibility logic
  useEffect(() => {
    if (isAnimationPaused || isHovering) return;
    
    // Clear any existing fade timer
    if (fadeTimer) {
      clearTimeout(fadeTimer);
    }
    
    // Initial fade in after 4 seconds
    const initialTimer = setTimeout(() => {
      setIsButtonFading(true);
      
      // Auto fade out after 7 seconds
      const fadeOutTimer = setTimeout(() => {
        if (!isHovering) {
          setIsButtonFading(false);
        }
      }, 7000);
      
      setFadeTimer(fadeOutTimer);
      return () => clearTimeout(fadeOutTimer);
    }, 4000);

    return () => clearTimeout(initialTimer);
  }, [isAnimationPaused, isHovering, fadeTimer]);

  // Scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Clear any existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // If scrolling down, slide up and fade out
      if (scrollY > 100) {
        setIsSlideUp(true);
        setIsButtonFading(false);
        setScrollTimeout(null);
      } 
      // If near top, set timeout to show after user stops scrolling
      else if (scrollY <= 100) {
        setIsSlideUp(false);
        
        if (!isAnimationPaused && !isHovering) {
          const timeout = setTimeout(() => {
            // Wait 4 seconds after user stops scrolling near top
            setTimeout(() => {
              setIsButtonFading(true);
              
              // Auto fade out after 7 seconds
              const fadeOutTimer = setTimeout(() => {
                if (!isHovering) {
                  setIsButtonFading(false);
                }
              }, 7000);
              
              setFadeTimer(fadeOutTimer);
            }, 4000);
          }, 100); // Small delay to detect stop scrolling
          
          setScrollTimeout(timeout);
        }
      }
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
          className={`fixed top-4 left-4 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl hover:scale-105 group ${
            isButtonFading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          } ${isSlideUp ? 'transform -translate-y-20' : 'transform translate-y-0'}`}
          style={{
            transition: 'opacity 1s ease-in-out, transform 0.5s ease-in-out'
          }}
        >
          <MessageCircle className="w-5 h-5" />
          <Phone className="w-4 h-4" />
          <span className="text-sm font-medium">Chat Assistant</span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
        </button>

        {/* Mini Glass Control Button */}
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
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-1 hover:bg-gray-600 rounded transition-colors cursor-pointer"
            title="Reset size"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <RotateCcw className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={handleReset}
            className="p-1 hover:bg-gray-600 rounded transition-colors cursor-pointer"
            title="Snap to default"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <MousePointer className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
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
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
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

        {/* Input area */}
        <div className="border-t border-gray-700 p-4 mt-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about deals..."
              className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm cursor-text"
              style={{ fontFamily: 'Inter, sans-serif' }}
              onMouseDown={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
            />
            <button
              onClick={handleSendMessage}
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
  );
}