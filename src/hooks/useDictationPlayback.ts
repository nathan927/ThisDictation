import { useState, useCallback, useRef, useEffect } from 'react';

export const useDictationPlayback = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatCount, setRepeatCount] = useState(0);
  const speechSynthesis = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Add refs for callback functions to avoid stale closures
  const onCompleteRef = useRef<(() => void) | null>(null);
  const maxRepeatsRef = useRef<number>(1);

  const stopSpeaking = useCallback(() => {
    try {
      if (speechSynthesis && speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      setIsPlaying(false);
      setRepeatCount(0);
      utteranceRef.current = null;
      onCompleteRef.current = null;
    } catch (error) {
      console.error('Error stopping speech:', error);
      setIsPlaying(false);
    }
  }, [speechSynthesis]);

  const speakText = useCallback((
    text: string, 
    language: string = 'en-US',
    repeats: number = 1,
    onComplete?: () => void
  ) => {
    if (!text || !speechSynthesis) return;

    try {
      stopSpeaking();
      maxRepeatsRef.current = repeats;
      onCompleteRef.current = onComplete || null;
      setRepeatCount(0);

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language and voice
      utterance.lang = language === 'zh-HK' ? 'zh-HK' : 'en-US';
      
      // Find and set the appropriate voice
      const voices = speechSynthesis.getVoices();
      if (language === 'zh-HK') {
        const cantoneseVoice = voices.find(voice => 
          voice.lang.includes('zh-HK') || 
          voice.name.toLowerCase().includes('chinese') && 
          voice.name.toLowerCase().includes('hong kong')
        );
        if (cantoneseVoice) {
          utterance.voice = cantoneseVoice;
        }
      }

      utteranceRef.current = utterance;

      // Add event listeners
      utterance.onstart = () => setIsPlaying(true);
      
      utterance.onend = () => {
        setRepeatCount(prev => {
          const newCount = prev + 1;
          
          if (newCount < maxRepeatsRef.current) {
            // Repeat the speech
            speechSynthesis.speak(utterance);
            return newCount;
          } else {
            // Complete the sequence
            setIsPlaying(false);
            if (onCompleteRef.current) {
              onCompleteRef.current();
            }
            return 0;
          }
        });
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        setRepeatCount(0);
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error starting speech:', error);
      setIsPlaying(false);
    }
  }, [speechSynthesis, stopSpeaking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  return {
    speakText,
    stopSpeaking,
    isPlaying,
    repeatCount
  };
};

// Export the type for the hook's return value
export type DictationPlayback = ReturnType<typeof useDictationPlayback>;