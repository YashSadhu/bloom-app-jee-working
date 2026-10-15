import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface QuoteProps {
  mainQuote: string;
  highlightedWords: string[];
  subText: string;
}

export default function Quote({ mainQuote, highlightedWords, subText }: QuoteProps) {
  // Function to process the quote with proper line breaks and highlighting
  const processQuote = () => {
    // Split the text by newlines
    const lines = mainQuote.split('\n');
    
    return lines.map((line, lineIndex) => {
      // For each line, create a Text component
      const words = line.split(/(\s+)/);
      
      const lineContent = words.map((word, wordIndex) => {
        const isHighlighted = highlightedWords.includes(word);
        return (
          <Text 
            key={`word-${lineIndex}-${wordIndex}`} 
            style={isHighlighted ? styles.highlight : undefined}
          >
            {word}
          </Text>
        );
      });
      
      // Return a Text component for each line
      return (
        <Text key={`line-${lineIndex}`} style={styles.quoteLine}>
          {lineContent}
        </Text>
      );
    });
  };

  return (
    <View style={styles.quoteContainer}>
      <View style={styles.quoteWrapper}>
        {processQuote()}
      </View>
      
      <Text style={styles.subText}>
        {subText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  quoteContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  quoteWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  quoteLine: {
    fontSize: Platform.OS === 'web' ? 36 : 30,
    fontWeight: '700',
    textAlign: 'center',
    color: '#ffffff',
    lineHeight: Platform.OS === 'web' ? 48 : 42,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  highlight: {
    color: '#ffffff',
    fontWeight: '900',
  },
  subText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 20,
  },
});