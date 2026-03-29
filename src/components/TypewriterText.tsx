import React, { useState, useEffect, useRef } from 'react';
import { Text, TextStyle } from 'react-native';
import { fonts } from '../theme';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  style?: TextStyle;
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  speed = 80,
  style,
  onComplete,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayedText('');
    indexRef.current = 0;

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <Text style={[{ fontFamily: fonts.mono }, style]}>{displayedText}</Text>;
}
