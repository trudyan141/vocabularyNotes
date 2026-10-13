export interface GoogleSearchConfig {
  apiKey: string;
  cx: string;
}

export const googleSearchApiKeyStorage = 'wfk.google-search-api-key.v1';
export const googleSearchCxStorage = 'wfk.google-search-cx.v1';

export function getGoogleSearchConfig(): GoogleSearchConfig | null {
  const envKey = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_KEY?.trim();
  const envCx = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CX?.trim();

  if (typeof window === 'undefined') {
    return envKey && envCx ? { apiKey: envKey, cx: envCx } : null;
  }
  try {
    const apiKey = localStorage.getItem(googleSearchApiKeyStorage)?.trim() || envKey;
    const cx = localStorage.getItem(googleSearchCxStorage)?.trim() || envCx;
    if (apiKey && cx) {
      return { apiKey, cx };
    }
    return null;
  } catch {
    return envKey && envCx ? { apiKey: envKey, cx: envCx } : null;
  }
}

export function setGoogleSearchConfig(config: GoogleSearchConfig | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (config && config.apiKey.trim() && config.cx.trim()) {
      localStorage.setItem(googleSearchApiKeyStorage, config.apiKey.trim());
      localStorage.setItem(googleSearchCxStorage, config.cx.trim());
    } else {
      localStorage.removeItem(googleSearchApiKeyStorage);
      localStorage.removeItem(googleSearchCxStorage);
    }
    window.dispatchEvent(new CustomEvent('wfk-google-search-config-changed'));
  } catch {
    // ignore local storage errors
  }
}
