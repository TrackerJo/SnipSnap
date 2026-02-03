/**
 * Secure API Key Storage Utility
 * Stores API keys in localStorage with basic encryption for client-side security
 * Note: For production, consider using a backend to secure API keys
 */

const STORAGE_KEY = 'snipsnap_api_keys';

export interface APIKeys {
    gemini?: string;
    claude?: string;
}

export type AIProvider = 'gemini' | 'claude';

// Simple obfuscation (not true encryption - for demo purposes)
// In production, use a backend to handle API keys
const _obfuscate = (text: string): string => {
    return btoa(text.split('').reverse().join(''));
};

const _deobfuscate = (text: string): string => {
    return atob(text).split('').reverse().join('');
};

// Export to avoid unused warnings (kept for future localStorage implementation)
export { _obfuscate, _deobfuscate };

export const saveAPIKeys = (keys: APIKeys): void => {
    const obfuscated: Record<string, string> = {};

    if (keys.gemini) {
        obfuscated.gemini = _obfuscate(keys.gemini);
    }

    if (keys.claude) {
        obfuscated.claude = _obfuscate(keys.claude);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(obfuscated));
};

export const getAPIKeys = (): APIKeys => {
    try {

        // const stored = localStorage.getItem(STORAGE_KEY);
        // if (!stored) return {};

        // const obfuscated = JSON.parse(stored);
        const keys: APIKeys = {
            gemini: import.meta.env.VITE_GEMINI_API_KEY || undefined,
        };

        // if (obfuscated.gemini) {
        //     keys.gemini = deobfuscate(obfuscated.gemini);
        // }

        // if (obfuscated.claude) {
        //     keys.claude = deobfuscate(obfuscated.claude);
        // }

        return keys;
    } catch (error) {
        console.error('Error retrieving API keys:', error);
        return {};
    }
};

export const clearAPIKeys = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};

export const hasAPIKey = (provider: AIProvider): boolean => {
    const keys = getAPIKeys();
    return !!keys[provider];
};

// Get the current active provider (defaults to gemini, falls back to claude)
export const getActiveProvider = (): AIProvider | null => {
    const keys = getAPIKeys();
    if (keys.gemini) return 'gemini';
    if (keys.claude) return 'claude';
    return null;
};
