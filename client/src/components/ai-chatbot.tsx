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
          
          // Check if products are available before generating response
          const hasProducts = affiliateLinks && affiliateLinks.length > 0;
          let botResponseContent: string;
          
          if (!hasProducts) {
            botResponseContent = "I searched the creator dashboard but there aren't any products available right now. The dashboard appears empty at the moment. Please check back later when new deals have been added.";
          } else {
            botResponseContent = generateContextualResponse(messageToProcess, newHistory, newIntentData);
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
    // Reset chat completely
    setMessages([]);
    setConversationHistory([]);
    setUserIntent({});
    setInputValue("");
    setIsTyping(false);
    setIsSearching(false);
    setSearchProducts([]);
    
    // Reset size and position
    setSize({ width: 380, height: 480 });
    setPosition({ x: window.innerWidth - 420, y: window.innerHeight - 500 });
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
          className={`fixed top-4 left-4 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl hover:scale-105 group transition-all duration-700 ease-out ${
            isButtonFading && !isSlideUp ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          } ${isSlideUp ? 'transform -translate-y-32' : 'transform translate-y-0'}`}
        >
          <MessageCircle className="w-5 h-5" />
          <Phone className="w-4 h-4" />
          <span className="text-sm font-medium">Chat Assistant</span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
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
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="p-1 hover:bg-gray-600 rounded transition-colors cursor-pointer"
            title="Reset chat and start new conversation"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <RotateCcw className="w-4 h-4 text-gray-300" />
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
  );
}