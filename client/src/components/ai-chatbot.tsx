import { useState, useRef, useEffect } from "react";
import { MessageCircle, Phone, X, RotateCcw, MousePointer } from "lucide-react";

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
  
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Product-specific responses
    if (message.includes('best') || message.includes('recommend') || message.includes('which')) {
      return getRandomResponse('product');
    }
    
    // Comparison questions
    if (message.includes('compare') || message.includes('difference') || message.includes('vs') || message.includes('better')) {
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
    
    // Default response with conversion focus
    return "Interesting! 🤔 You know what might be perfect for that? Let me show you our top pick that's been crushing it lately 🔥 Want the details?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateBotResponse(inputValue),
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
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
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
      >
        <MessageCircle className="w-5 h-5" />
        <Phone className="w-4 h-4" />
        <span className="text-sm font-medium">Chat Assistant</span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
      </button>
    );
  }

  return (
    <div
      ref={chatRef}
      className="fixed z-50 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        backgroundColor: 'rgba(34, 38, 50, 0.95)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Header with controls */}
      <div 
        className="bg-gray-800 bg-opacity-50 p-3 flex items-center justify-between cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white font-medium text-sm">Elite Deal Assistant</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-1 hover:bg-gray-600 rounded transition-colors"
            title="Reset size"
          >
            <RotateCcw className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={handleReset}
            className="p-1 hover:bg-gray-600 rounded transition-colors"
            title="Snap to default"
          >
            <MousePointer className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-red-600 rounded transition-colors"
            title="Close chat"
          >
            <X className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                {message.content}
              </div>
            </div>
          ))}
          
          {isTyping && (
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
        <div className="border-t border-gray-700 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about deals..."
              className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}