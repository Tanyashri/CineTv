export interface PromptValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validate user recommendation prompt for quality, length, and gibberish detection.
 */
export function validatePrompt(prompt: string): PromptValidationResult {
  const trimmed = prompt.trim();

  // Rule 1: Empty or too short
  if (!trimmed || trimmed.length < 3) {
    return {
      isValid: false,
      errorMessage: 'Please enter a prompt with at least 3 characters.',
    };
  }

  // Rule 2: Pure numbers or punctuation
  if (/^[\d\s\W]+$/.test(trimmed) && !/\b(19\d\d|20\d\d)\b/.test(trimmed)) {
    return {
      isValid: false,
      errorMessage: 'Prompt contains only numbers or symbols. Please describe a movie, genre, or mood.',
    };
  }

  // Rule 3: Repetitive character spam (e.g. "aaaaaa", "111111", "zzzzzz")
  if (/(.)\1{4,}/i.test(trimmed)) {
    return {
      isValid: false,
      errorMessage: 'Prompt contains repetitive characters. Please enter a meaningful movie requirement.',
    };
  }

  // Rule 4: Keyboard smash / gibberish patterns (e.g., "asdfghjkl", "qwertyuiop", "zxcvbnm")
  const lower = trimmed.toLowerCase();
  const gibberishPatterns = [
    /asdf/i, /qwerty/i, /zxcv/i, /dfgh/i, /hjkl/i, /ghjk/i, /fghj/i,
    /yuiop/i, /bnmq/i, /vbnm/i
  ];
  const isPatternGibberish = gibberishPatterns.some(pattern => pattern.test(lower));
  if (isPatternGibberish && lower.split(/\s+/).length <= 3) {
    return {
      isValid: false,
      errorMessage: 'Invalid prompt entered. Please enter a valid movie requirement or mood, not random letters.',
    };
  }

  // Rule 5: Words with 5+ letters and zero vowels (e.g. "sdfghj", "xcvbnm")
  const words = lower.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  const noVowelWord = words.find(w => w.length >= 5 && !/[aeiouy]/i.test(w));
  if (noVowelWord) {
    return {
      isValid: false,
      errorMessage: 'Unrecognizable word entered. Please describe a movie, genre, or vibe (e.g., "comfort comedy movie").',
    };
  }

  return { isValid: true };
}
