import { useState, useEffect, useRef } from "react";

interface RollingNumberProps {
  value: number;
  className?: string;
}

export default function RollingNumber({ value, className = "" }: RollingNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      setIsAnimating(true);
      
      // Start the rolling animation
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsAnimating(false);
        prevValueRef.current = value;
      }, 150); // Short delay to show the roll effect

      return () => clearTimeout(timer);
    }
  }, [value]);

  // Convert number to string and split into individual digits
  const digits = displayValue.toString().split('');

  return (
    <span className={`inline-flex ${className}`}>
      {digits.map((digit, index) => (
        <span
          key={`${index}-${digit}`}
          className={`inline-block transition-all duration-300 ${
            isAnimating 
              ? 'transform -translate-y-2 opacity-0' 
              : 'transform translate-y-0 opacity-100'
          }`}
          style={{
            transitionDelay: `${index * 50}ms` // Stagger the animation for each digit
          }}
        >
          {digit}
        </span>
      ))}
    </span>
  );
}

// More advanced rolling animation with visible digit spinning
interface SpinningDigitProps {
  digit: string;
  isAnimating: boolean;
  delay?: number;
}

function SpinningDigit({ digit, isAnimating, delay = 0 }: SpinningDigitProps) {
  return (
    <span className="relative inline-block overflow-hidden h-[1.2em]">
      <span
        className={`absolute inset-0 transition-transform duration-300 ease-out ${
          isAnimating 
            ? 'transform -translate-y-full opacity-0' 
            : 'transform translate-y-0 opacity-100'
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {digit}
      </span>
      {isAnimating && (
        <span
          className="absolute inset-0 transform translate-y-full transition-transform duration-300 ease-out"
          style={{ transitionDelay: `${delay}ms` }}
        >
          {digit}
        </span>
      )}
    </span>
  );
}

// Enhanced version with actual spinning effect
export function EnhancedRollingNumber({ value, className = "" }: RollingNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      setIsAnimating(true);
      
      // Update to new value after animation starts
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 150);

      // End animation
      const endTimer = setTimeout(() => {
        setIsAnimating(false);
        prevValueRef.current = value;
      }, 400);

      return () => {
        clearTimeout(timer);
        clearTimeout(endTimer);
      };
    }
  }, [value]);

  const digits = displayValue.toString().split('');

  return (
    <span className={`inline-flex ${className}`}>
      {digits.map((digit, index) => (
        <SpinningDigit
          key={index}
          digit={digit}
          isAnimating={isAnimating}
          delay={index * 50}
        />
      ))}
    </span>
  );
}