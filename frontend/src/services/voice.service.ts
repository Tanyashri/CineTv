export interface VoiceProcessResult {
  rawTranscript: string;
  sanitizedText: string;
  confidence: number;
  language: string;
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'error';

export class FrontendVoiceService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private activeRecognition: any = null;
  private isListening = false;

  /**
   * Check if browser supports Web Speech API.
   */
  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as unknown as Record<string, unknown>;
    return Boolean(win['SpeechRecognition'] || win['webkitSpeechRecognition']);
  }

  /**
   * Get SpeechRecognition constructor from window.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getSpeechRecognitionClass(): any {
    if (typeof window === 'undefined') return null;
    const win = window as unknown as Record<string, unknown>;
    return win['SpeechRecognition'] || win['webkitSpeechRecognition'] || null;
  }

  /**
   * Map simple language codes (e.g. 'en', 'es', 'fr') to BCP-47 language tags.
   */
  private getLanguageTag(langCode?: string): string {
    if (!langCode) return 'en-US';
    const mapping: Record<string, string> = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      ja: 'ja-JP',
      ko: 'ko-KR',
      hi: 'hi-IN',
      it: 'it-IT',
      pt: 'pt-BR',
      zh: 'zh-CN',
    };
    return mapping[langCode.toLowerCase()] || langCode;
  }

  /**
   * Start Web Speech API recognition session.
   */
  startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (errorMessage: string) => void,
    onEnd: () => void,
    language = 'en-US',
  ): void {
    const SpeechRecognitionClass = this.getSpeechRecognitionClass();

    if (!SpeechRecognitionClass) {
      onError("Voice input isn't supported in this browser.");
      onEnd();
      return;
    }

    // Stop any running recognition session cleanly
    this.stopListening();

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = this.getLanguageTag(language);

      this.activeRecognition = recognition;
      this.isListening = true;
      let hasErrored = false;

      recognition.onstart = () => {
        this.isListening = true;
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const transcript = res[0]?.transcript || '';
          if (res.isFinal) {
            finalText += transcript;
          } else {
            interimText += transcript;
          }
        }

        if (finalText) {
          onResult(finalText.trim(), true);
        } else if (interimText) {
          onResult(interimText.trim(), false);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        hasErrored = true;
        this.isListening = false;

        const errorCode = event.error;
        let message = 'Voice input error. Please try again.';

        switch (errorCode) {
          case 'not-allowed':
          case 'permission-denied':
            message = 'Microphone permission denied. Please allow microphone access in your browser location bar.';
            break;
          case 'no-speech':
            message = 'No speech was detected. Please try speaking again.';
            break;
          case 'audio-capture':
            message = 'Microphone unavailable or no microphone hardware found.';
            break;
          case 'network':
            message = 'Network error during speech recognition.';
            break;
          case 'aborted':
            message = 'Speech recognition was stopped.';
            break;
          default:
            message = `Voice error (${errorCode || 'recognition failed'}).`;
            break;
        }

        onError(message);
      };

      recognition.onend = () => {
        this.isListening = false;
        this.activeRecognition = null;
        if (!hasErrored) {
          onEnd();
        }
      };

      recognition.start();
    } catch (err: unknown) {
      this.isListening = false;
      this.activeRecognition = null;
      const msg = err instanceof Error ? err.message : 'Failed to start microphone';
      onError(msg);
      onEnd();
    }
  }

  /**
   * Stop active listening session cleanly.
   */
  stopListening(): void {
    if (this.activeRecognition) {
      try {
        this.activeRecognition.stop();
      } catch {
        // Ignore stop exceptions
      }
      this.activeRecognition = null;
    }
    this.isListening = false;
  }
}

export const frontendVoiceService = new FrontendVoiceService();
