/**
 * DOM Updater Module for i18n
 * Handles updating DOM elements with translations
 * Does not modify user-generated content
 */

import { t } from './i18n.js';

/**
 * Update all static DOM elements with data-i18n attributes
 */
function updateStaticTranslations() {
    // Update text content
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key) {
            const translation = t(key);
            element.textContent = translation;
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (key) {
            const translation = t(key);
            element.placeholder = translation;
        }
    });

    // Update titles (tooltips)
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        if (key) {
            const translation = t(key);
            element.title = translation;
        }
    });

    // Update input values
    document.querySelectorAll('[data-i18n-value]').forEach(element => {
        const key = element.getAttribute('data-i18n-value');
        if (key) {
            const translation = t(key);
            element.value = translation;
        }
    });

    // Update aria-labels for accessibility
    document.querySelectorAll('[data-i18n-aria]').forEach(element => {
        const key = element.getAttribute('data-i18n-aria');
        if (key) {
            const translation = t(key);
            element.setAttribute('aria-label', translation);
        }
    });

    // Update option elements with data-i18n
    document.querySelectorAll('option[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key) {
            const translation = t(key);
            element.textContent = translation;
        }
    });
}

/**
 * Update dynamic select options (e.g., language selector)
 * @param {string} selectId - ID of the select element
 * @param {Array} options - Array of { value, translationKey } objects
 */
function updateSelectOptions(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;

    // Clear existing options
    select.innerHTML = '';

    // Add new options
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = t(opt.translationKey);
        select.appendChild(option);
    });
}

/**
 * Update a single element's translation
 * @param {HTMLElement} element - The element to update
 * @param {string} key - Translation key
 * @param {object} options - Interpolation options
 */
function updateElement(element, key, options = {}) {
    if (!element) return;

    const translation = t(key, options);

    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        if (element.hasAttribute('placeholder')) {
            element.placeholder = translation;
        } else {
            element.value = translation;
        }
    } else {
        element.textContent = translation;
    }
}

/**
 * Initialize language switcher dropdown
 * @param {string} selectId - ID of the language select element
 * @param {Array} availableLanguages - Array of available language codes
 */
function initLanguageSwitcher(selectId, availableLanguages) {
    const select = document.getElementById(selectId);
    if (!select) return;

    // Clear existing options
    select.innerHTML = '';

    // Add language options
    availableLanguages.forEach(langCode => {
        const option = document.createElement('option');
        option.value = langCode;
        option.textContent = t(`languages.${langCode}`);
        select.appendChild(option);
    });

    // Set current language
    const savedLanguage = localStorage.getItem('chatbinder-language') || 'en';
    select.value = savedLanguage;
}

/**
 * Add data-i18n attributes to an element programmatically
 * Useful for dynamically created elements
 * @param {HTMLElement} element - Element to add attributes to
 * @param {object} attributes - Object with text, placeholder, title keys
 */
function addI18nAttributes(element, attributes = {}) {
    if (attributes.text) {
        element.setAttribute('data-i18n', attributes.text);
        element.textContent = t(attributes.text);
    }
    if (attributes.placeholder) {
        element.setAttribute('data-i18n-placeholder', attributes.placeholder);
        element.placeholder = t(attributes.placeholder);
    }
    if (attributes.title) {
        element.setAttribute('data-i18n-title', attributes.title);
        element.title = t(attributes.title);
    }
    if (attributes.aria) {
        element.setAttribute('data-i18n-aria', attributes.aria);
        element.setAttribute('aria-label', t(attributes.aria));
    }
}

/**
 * Listen for language change events and update DOM
 * @param {Function} callback - Optional callback after language change
 */
function onLanguageChange(callback) {
    window.addEventListener('languageChanged', () => {
        updateStaticTranslations();

        // Re-render dynamic content if callback provided
        if (typeof callback === 'function') {
            callback();
        }
    });
}

export {
    updateStaticTranslations,
    updateSelectOptions,
    updateElement,
    initLanguageSwitcher,
    addI18nAttributes,
    onLanguageChange
};
