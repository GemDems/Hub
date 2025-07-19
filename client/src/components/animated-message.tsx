import { useState, useEffect } from 'react';

interface AnimatedMessageProps {
  content: string;
  isBot: boolean;
}

export default function AnimatedMessage({ content, isBot }: AnimatedMessageProps) {
  const [visibleWords, setVisibleWords] = useState<string[]>([]);
  const words = content.split(' ');

  useEffect(() => {
    if (!isBot) {
      setVisibleWords(words);
      return;
    }

    // Reset animation for new bot messages
    setVisibleWords([]);
    
    // Animate words appearing one by one with realistic timing
    words.forEach((word, index) => {
      setTimeout(() => {
        setVisibleWords(prev => [...prev, word]);
      }, index * 200 + Math.random() * 100); // 200ms base + random variance
    });
  }, [content, isBot, words.length]);

  if (!isBot) {
    return <span>{content}</span>;
  }

  return (
    <span>
      {visibleWords.map((word, index) => (
        <span
          key={index}
          className="inline-block animate-fadeInUp"
          style={{
            animationDelay: `${index * 150}ms`,
            animationDuration: '300ms',
            animationFillMode: 'both'
          }}
        >
          {word}{index < visibleWords.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
}