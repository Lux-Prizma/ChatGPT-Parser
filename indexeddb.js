// IndexedDB Storage Module for ChatGPT Parser
// Handles large datasets that exceed localStorage limits

class IndexedDBStorage {
    constructor(dbName = 'ChatGPTParserDB', version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }

    // Initialize IndexedDB
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB initialized successfully');
                resolve(this.db);
            };

            // Create object stores on first run or version upgrade
            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create conversations store
                if (!db.objectStoreNames.contains('conversations')) {
                    const conversationStore = db.createObjectStore('conversations', { keyPath: 'id' });
                    conversationStore.createIndex('updateTime', 'updateTime', { unique: false });
                    conversationStore.createIndex('starred', 'starred', { unique: false });
                }

                // Create settings store for preferences (current tab, current conversation, etc.)
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    // Save all conversations
    async saveConversations(conversations) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['conversations'], 'readwrite');
            const store = transaction.objectStore('conversations');

            // Clear existing conversations
            const clearRequest = store.clear();

            clearRequest.onsuccess = () => {
                // Add all conversations
                conversations.forEach(conv => {
                    store.put(conv);
                });
            };

            transaction.oncomplete = () => {
                console.log(`Saved ${conversations.length} conversations to IndexedDB`);
                resolve();
            };

            transaction.onerror = () => {
                console.error('Error saving to IndexedDB:', transaction.error);
                reject(transaction.error);
            };
        });
    }

    // Load all conversations
    async loadConversations() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['conversations'], 'readonly');
            const store = transaction.objectStore('conversations');
            const request = store.getAll();

            request.onsuccess = () => {
                const conversations = request.result;
                console.log(`Loaded ${conversations.length} conversations from IndexedDB`);
                resolve(conversations);
            };

            request.onerror = () => {
                console.error('Error loading from IndexedDB:', request.error);
                reject(request.error);
            };
        });
    }

    // Save a setting value
    async saveSetting(key, value) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key, value });

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    // Load a setting value
    async loadSetting(key) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result ? request.result.value : null);
            };

            request.onerror = () => reject(request.error);
        });
    }

    // Clear all data
    async clear() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['conversations', 'settings'], 'readwrite');

            transaction.objectStore('conversations').clear();
            transaction.objectStore('settings').clear();

            transaction.oncomplete = () => {
                console.log('IndexedDB cleared');
                resolve();
            };

            transaction.onerror = () => reject(transaction.error);
        });
    }

    // Check if IndexedDB is available
    static isSupported() {
        return 'indexedDB' in window && window.indexedDB !== null;
    }

    // Estimate storage usage (approximate)
    async getStorageInfo() {
        if (!this.db) await this.init();

        // Get total conversations count and approximate size
        const conversations = await this.loadConversations();
        const jsonString = JSON.stringify(conversations);
        const sizeInBytes = new Blob([jsonString]).size;
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

        return {
            conversationCount: conversations.length,
            approximateSize: sizeInMB + ' MB',
            sizeInBytes: sizeInBytes
        };
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndexedDBStorage;
}
