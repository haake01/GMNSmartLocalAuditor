const API_CONFIG = {
  openaiApiKey: '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'
};

export function getOpenAIKey(): string {
  return import.meta.env.VITE_OPENAI_API_KEY || API_CONFIG.openaiApiKey;
}

export function hasOpenAIKey(): boolean {
  const key = getOpenAIKey();
  return !!(key && key.trim().length > 0);
}
