import { useState, useCallback, useRef, useEffect } from 'react';

export const useDictationPlayback = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const speechSynthesis = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      return;
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    try {
      if (speechSynthesis && speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      setIsPlaying(false);
      utteranceRef.current = null;
    } catch (error) {
      console.error('Error stopping speech:', error);
      setIsPlaying(false);
    }
  }, [speechSynthesis]);

  const speakText = useCallback((text: string, speed: number = 1) => {
    if (!text || !speechSynthesis) return;

    try {
      stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      utteranceRef.current = utterance;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        utteranceRef.current = null;
      };
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        utteranceRef.current = null;
      };

      if (speechSynthesis.paused) {
        speechSynthesis.resume();
      }

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error starting speech:', error);
      setIsPlaying(false);
    }
  }, [speechSynthesis, stopSpeaking]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  return {
    speakText,
    stopSpeaking,
    isPlaying
  };
};

// Export the type for the hook's return value
export type DictationPlayback = ReturnType<typeof useDictationPlayback>;