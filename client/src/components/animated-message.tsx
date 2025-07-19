import { useState, useEffect } from 'react';

interface AnimatedMessageProps {
  content: string;
  isBot: boolean;
}

export default function AnimatedMessage({ content, isBot }: AnimatedMessageProps) {
  const [visibleWords, setVisibleWords] = useState<string[]>([]);
  const [showButton, setShowButton] = useState(false);
  
  // Check if content contains search button HTML
  const hasSearchButton = content.includes('<button') && content.includes('Search Now');
  const textContent = hasSearchButton ? content.split('<div')[0] : content;
  const words = textContent.split(' ');

  useEffect(() => {
    if (!isBot) {
      setVisibleWords(words);
      if (hasSearchButton) {
        setShowButton(true);
      }
      return;
    }

    // Reset animation for new bot messages
    setVisibleWords([]);
    setShowButton(false);
    
    // Animate words appearing one by one with realistic timing
    words.forEach((word, index) => {
      setTimeout(() => {
        setVisibleWords(prev => [...prev, word]);
      }, index * 200 + Math.random() * 100); // 200ms base + random variance
    });
    
    // Show button after text animation completes
    if (hasSearchButton) {
      setTimeout(() => {
        setShowButton(true);
      }, words.length * 200 + 500);
    }
  }, [content, isBot, words.length, hasSearchButton]);

  if (!isBot) {
    return (
      <div>
        <span>{textContent}</span>
        {hasSearchButton && showButton && (
          <div style={{ marginTop: '12px' }}>
            <button 
              onClick={() => (window as any).triggerChatSearch && (window as any).triggerChatSearch()}
              style={{
                background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              🔍 Search Now
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <span>
        {visibleWords.map((word, index) => (
          <span key={index}>
            <span
              className="inline-block animate-fadeInUp"
              style={{
                animationDelay: `${index * 150}ms`,
                animationDuration: '300ms',
                animationFillMode: 'both'
              }}
            >
              {word}
            </span>
            {index < visibleWords.length - 1 && <span> </span>}
          </span>
        ))}
      </span>
      {hasSearchButton && showButton && (
        <div style={{ marginTop: '12px' }} className="animate-fadeInUp">
          <button 
            onClick={() => (window as any).triggerChatSearch && (window as any).triggerChatSearch()}
            style={{
              background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            🔍 Search Now
          </button>
        </div>
      )}
    </div>
  );
}