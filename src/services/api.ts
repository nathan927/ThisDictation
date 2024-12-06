import axios from 'axios';

// Add these type declarations at the top of the file
interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

declare global {
  interface Window {
    SpeechRecognition: new () => any;
    webkitSpeechRecognition: new () => any;
  }
}

const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;
const OCR_API_KEY = import.meta.env.VITE_OCR_API_KEY;

export class TranscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TranscriptionError';
  }
}

export class OCRError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OCRError';
  }
}

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await axios.post('https://api.deepgram.com/v1/listen', formData, {
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': 'multipart/form-data'
      },
      params: {
        model: 'general',
        language: 'en',
        punctuate: true,
        diarize: false
      }
    });

    if (response.status !== 200) {
      throw new TranscriptionError('Failed to transcribe audio');
    }

    return response.data.results?.channels[0]?.alternatives[0]?.transcript || '';
  } catch (error) {
    console.error('Transcription error:', error);
    
    // Fallback to Web Speech API
    return new Promise((resolve, reject) => {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = false;

      let transcript = '';

      recognition.onresult = (event) => {
        transcript += event.results[event.results.length - 1][0].transcript;
      };

      recognition.onerror = (event) => {
        reject(new TranscriptionError('Speech recognition failed'));
      };

      recognition.onend = () => {
        resolve(transcript);
      };

      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.onended = () => recognition.stop();
      
      recognition.start();
      audio.play();
    });
  }
};

// Add this helper function for image resizing
const resizeImage = async (file: File, maxSizeKB: number = 1024): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        const maxDimension = 1500; // Maximum dimension for either width or height
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with quality adjustment
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          'image/jpeg',
          0.7 // Adjust quality to meet size requirements
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

export const performOCR = async (imageFile: File, language: string = 'eng'): Promise<string> => {
  try {
    // Resize image before sending to API
    const resizedImageBlob = await resizeImage(imageFile);
    const resizedImageFile = new File([resizedImageBlob], imageFile.name, {
      type: 'image/jpeg'
    });

    const formData = new FormData();
    formData.append('file', resizedImageFile);
    formData.append('apikey', OCR_API_KEY);
    formData.append('language', language);
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');

    // Changed the API endpoint to use HTTPS
    const response = await axios.post(
      'https://api8.ocr.space/parse/image',  // Changed from api.ocr.space to api8.ocr.space
      formData,
      {
        headers: {
          'apikey': OCR_API_KEY,
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    if (!response.data) {
      throw new OCRError('No response from OCR service');
    }

    if (response.data.ErrorMessage) {
      throw new OCRError(response.data.ErrorMessage);
    }

    if (!response.data.ParsedResults?.[0]?.ParsedText) {
      throw new OCRError('No text found in image');
    }

    return response.data.ParsedResults[0].ParsedText.trim();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new OCRError('Request timed out. Please try again.');
      }
      throw new OCRError(`OCR API Error: ${error.message}`);
    }
    throw new OCRError('Failed to process image');
  }
};

export const processImage = async (formData: FormData, language: string) => {
  // Map UI language to OCR language code
  let ocrLang = 'eng';
  switch (language) {
    case 'zh-TW':
      ocrLang = 'chi_tra';
      break;
    case 'zh-CN':
      ocrLang = 'chi_sim';
      break;
    default:
      ocrLang = 'eng';
  }

  formData.append('lang', ocrLang);

  const response = await fetch('/api/ocr', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to process image');
  }

  return response.text();
};

// Add the speak function export
export const speak = async (text: string): Promise<void> => {
  const utterance = new SpeechSynthesisUtterance(text);
  return new Promise<void>((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = (error) => reject(error);
    window.speechSynthesis.speak(utterance);
  });
};