/**
 * Internationalization (i18n) Module
 * Handles multi-language support for UI elements only
 * Does NOT affect user-generated content (conversations, folder names, etc.)
 *
 * OFFLINE-FIRST: Works without network connection
 * FALLBACK: Falls back to English if translations fail to load
 */

// Import i18next from local vendor directory (works offline)
// Using a script tag approach for better compatibility
let i18next = null;

/**
 * Initialize i18next from local vendor file
 * This is called automatically when the module loads
 */
function initI18next() {
    if (typeof window !== 'undefined' && window.i18next) {
        i18next = window.i18next;
        return true;
    }
    return false;
}

/**
 * Get the base URL for loading locale files
 * Calculates based on the current script location
 */
function getBaseUrl() {
    // Get the URL of this script
    const scriptUrl = new URL(import.meta.url, window.location.href);
    // Get the directory containing this script
    return scriptUrl.pathname.substring(0, scriptUrl.pathname.lastIndexOf('/'));
}

/**
 * Load all available translation resources using fetch
 * Works in all browsers, offline-friendly
 */
async function loadTranslationResources() {
    const locales = ['en', 'zh'];
    const resources = {};

    // Try multiple possible paths
    const possibleBasePaths = [
        './js/i18n/locales',  // Relative to HTML file
        'js/i18n/locales',    // Without leading ./
        '/js/i18n/locales',   // Absolute from root
    ];

    let workingPath = null;

    for (const basePath of possibleBasePaths) {
        let allLoaded = true;

        for (const locale of locales) {
            try {
                const url = `${basePath}/${locale}.json`;
                console.log(`[i18n] Trying: ${url}`);
                const response = await fetch(url);

                if (response.ok) {
                    const translation = await response.json();
                    resources[locale] = { translation };
                    console.log(`[i18n] ✓ Loaded ${locale} from ${basePath}`);
                } else {
                    allLoaded = false;
                    console.log(`[i18n] ✗ ${response.status} for ${url}`);
                    break;
                }
            } catch (error) {
                allLoaded = false;
                console.log(`[i18n] ✗ Error: ${error.message}`);
                break;
            }
        }

        if (allLoaded && resources.en && resources.zh) {
            workingPath = basePath;
            console.log(`[i18n] ✓ Using path: ${basePath}`);
            break;
        }
    }

    // Ensure we at least have English
    if (!resources.en) {
        console.warn('[i18n] English locale missing, creating minimal fallback');
        resources.en = {
            translation: {
                app: { title: 'ChatBinder' },
                nav: { manage: 'Manage', aiTools: 'AI Tools', help: 'Help', options: 'Options' },
                sidebar: {
                    importHistory: 'Import Chat History',
                    searchPlaceholder: 'Search conversations...',
                    starredThreads: 'Starred Threads',
                    starredPairs: 'Starred Pairs',
                    allConversations: 'All Conversations'
                }
            }
        };
    }

    console.log('[i18n] Available languages:', Object.keys(resources));
    return resources;
}

// Store the loaded resources for later lookup
let loadedResources = {};

/**
 * Initialize i18next with available languages
 * OFFLINE-FRIENDLY: Falls back to English if translations fail
 */
async function init() {
    // Wait for i18next to be available from script tag
    let attempts = 0;
    while (!i18next && attempts < 50) {
        initI18next();
        if (!i18next) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }

    if (!i18next) {
        console.error('[i18n] Failed to load i18next library');
        // Return a fallback implementation that returns keys
        return {
            t: (key) => key,
            language: 'en',
            changeLanguage: async () => {},
            options: { resource: {} }
        };
    }

    let resources = {};
    try {
        resources = await loadTranslationResources();
    } catch (error) {
        console.error('[i18n] Failed to load translation resources:', error);
        // Create minimal English fallback
        resources = {
            en: {
                translation: {
                    app: { title: 'ChatBinder' },
                    nav: { manage: 'Manage', aiTools: 'AI Tools', help: 'Help', options: 'Options' }
                }
            }
        };
    }

    // Store resources for getAvailableLanguages()
    loadedResources = resources;

    // Detect saved language or use browser language
    const savedLanguage = localStorage.getItem('chatbinder-language');
    const browserLanguage = navigator.language.split('-')[0];
    const defaultLanguage = savedLanguage || (resources[browserLanguage] ? browserLanguage : 'en');

    console.log('[i18n] Initializing with language:', defaultLanguage);

    await i18next.init({
        lng: defaultLanguage,
        fallbackLng: 'en', // Always fall back to English
        resources,
        interpolation: {
            escapeValue: false // HTML is already escaped in the app
        },
        // Silent mode - don't warn about missing keys in console
        missingKeyHandler: false
    });

    // Save the initialized language
    if (!savedLanguage) {
        localStorage.setItem('chatbinder-language', defaultLanguage);
    }

    console.log('[i18n] ✓ Initialization complete');
    return i18next;
}

/**
 * Translate a key with optional interpolation
 * FALLBACK-SAFE: Returns the key itself if translation fails
 * @param {string} key - Translation key (supports dot notation like 'nav.manage')
 * @param {object} options - Interpolation options (e.g., { count: 5 })
 * @returns {string} Translated string or key if translation fails
 */
function t(key, options = {}) {
    if (!i18next) {
        console.warn('[i18n] i18next not initialized, returning key:', key);
        return key;
    }

    try {
        const result = i18next.t(key, options);
        return result;
    } catch (error) {
        console.error(`[i18n] Translation error for key "${key}":`, error);
        return key; // Return key as ultimate fallback
    }
}

/**
 * Change the current language
 * @param {string} language - Language code (e.g., 'en', 'zh', 'es')
 */
async function changeLanguage(language) {
    if (!i18next) {
        console.warn('[i18n] Cannot change language - i18next not initialized');
        return;
    }

    try {
        await i18next.changeLanguage(language);
        localStorage.setItem('chatbinder-language', language);

        // Dispatch event for other modules to listen to
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
        console.log('[i18n] ✓ Language changed to:', language);
    } catch (error) {
        console.error('[i18n] Failed to change language:', error);
    }
}

/**
 * Get the current language
 * @returns {string} Current language code or 'en' if not initialized
 */
function getCurrentLanguage() {
    if (!i18next) {
        return localStorage.getItem('chatbinder-language') || 'en';
    }
    return i18next.language || 'en';
}

/**
 * Get all available languages
 * @returns {string[]} Array of available language codes
 */
function getAvailableLanguages() {
    // Use the stored resources instead of i18next.options.resource
    const languages = Object.keys(loadedResources);
    console.log('[i18n] getAvailableLanguages() returning:', languages);
    return languages.length > 0 ? languages : ['en'];
}

/**
 * Check if a language is available
 * @param {string} language - Language code to check
 * @returns {boolean} True if language is available
 */
function isLanguageAvailable(language) {
    return language in loadedResources;
}

/**
 * Export i18n instance and utility functions
 */
export {
    init,
    t,
    changeLanguage,
    getCurrentLanguage,
    getAvailableLanguages,
    isLanguageAvailable
};
