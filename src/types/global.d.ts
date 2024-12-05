interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}

declare class SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: 'not-allowed' | 'audio-capture' | 'network' | 'no-speech' | 'aborted' | 'language-not-supported' | 'service-not-allowed' | 'bad-grammar';
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal?: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface DictationSettings {
  speed: number;
  interval: number;
  repetitions: number;
  pronunciation: string;
}

interface SpeakOptions {
  rate?: number;
  interval?: number;
}

interface WordWithAudio {
  text: string;
  audioUrl: string;
}

export type { DictationSettings, SpeakOptions, WordWithAudio };
