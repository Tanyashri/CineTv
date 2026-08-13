export interface VoiceProcessingResult {
  rawTranscript: string;
  sanitizedText: string;
  confidence: number;
  language: string;
}

export class VoiceService {
  /**
   * Process speech-to-text transcript from browser Speech Recognition.
   */
  processTranscript(transcript: string, language = 'en-US', confidence = 1.0): VoiceProcessingResult {
    const sanitizedText = transcript
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s?.,-]/gi, '');

    return {
      rawTranscript: transcript,
      sanitizedText: sanitizedText || transcript,
      confidence,
      language,
    };
  }

  /**
   * Browser support detection metadata helper.
   */
  getBrowserSupportConfig() {
    return {
      supportedBrowsers: ['Chrome', 'Edge', 'Safari', 'Opera'],
      recommendedApi: 'webkitSpeechRecognition',
      fallbackStrategy: 'Text input keyboard fallback',
    };
  }
}

export const voiceService = new VoiceService();
