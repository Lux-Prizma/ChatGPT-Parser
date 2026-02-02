/**
 * Date Utility Functions
 */

import { t } from '../i18n/i18n.js';

export class DateUtils {
    /**
     * Format date as relative time (Today, Yesterday, X days ago, etc.)
     */
    static formatDate(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return t('dates.today');
        if (diffDays === 1) return t('dates.yesterday');
        if (diffDays < 7) return t('dates.daysAgo', { count: diffDays });
        if (diffDays < 30) return t('dates.weeksAgo', { count: Math.floor(diffDays / 7) });
        if (diffDays < 365) return t('dates.monthsAgo', { count: Math.floor(diffDays / 30) });
        return date.toLocaleDateString();
    }

    /**
     * Format date and time as locale string
     */
    static formatDateTime(date) {
        return date.toLocaleString();
    }

    /**
     * Convert timestamp (Unix) to Date object
     */
    static timestampToDate(timestamp) {
        return new Date(timestamp * 1000);
    }

    /**
     * Convert Date object to Unix timestamp
     */
    static dateToTimestamp(date) {
        return Math.floor(date.getTime() / 1000);
    }

    /**
     * Get end of day timestamp
     */
    static getEndOfDayTimestamp(dateStr) {
        const date = new Date(dateStr);
        return Math.floor(date.getTime() / 1000) + 86400; // End of day
    }

    /**
     * Convert date string to start of day timestamp
     */
    static getStartOfDayTimestamp(dateStr) {
        const date = new Date(dateStr);
        return Math.floor(date.getTime() / 1000);
    }
}
