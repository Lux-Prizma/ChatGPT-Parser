// Main Application Controller

class ChatGPTParserApp {
    constructor() {
        this.data = chatData;
        this.currentView = 'upload'; // 'upload' or 'chat'
        this.currentTab = 'conversations'; // 'conversations' or 'starred'
        this.searchResults = [];
        this.init();
    }

    init() {
        this.bindEvents();
        // Make init async to handle IndexedDB loading
        this.initAsync();
    }

    async initAsync() {
        await this.loadFromStorage();
        this.updateUI();
    }

    bindEvents() {
        // File upload
        document.getElementById('uploadBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        document.getElementById('newChatBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        // Sidebar tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Global search
        document.getElementById('globalSearchInput').addEventListener('input', (e) => {
            this.handleGlobalSearch(e.target.value);
        });

        // Sidebar toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Edit thread title
        document.getElementById('editTitleBtn').addEventListener('click', () => {
            this.toggleTitleEdit();
        });

        document.getElementById('threadTitleInput').addEventListener('blur', () => {
            this.saveTitleEdit();
        });

        document.getElementById('threadTitleInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveTitleEdit();
            }
        });

        // Delete thread
        document.getElementById('deleteThreadBtn').addEventListener('click', () => {
            this.deleteCurrentThread();
        });

        // Thread search
        document.getElementById('threadSearchInput').addEventListener('input', (e) => {
            this.handleThreadSearch(e.target.value);
        });

        // Save project
        document.getElementById('saveProjectBtn').addEventListener('click', () => {
            this.saveProject();
        });

        // Clear data
        document.getElementById('clearDataBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                this.clearAllData();
            }
        });
    }

    async handleFileUpload(files) {
        if (!files || files.length === 0) return;

        const totalConversations = [];
        let processed = 0;

        for (const file of files) {
            try {
                console.log('Processing file:', file.name);
                const content = await file.text();
                let conversations = [];

                if (file.name.endsWith('.json')) {
                    const jsonData = JSON.parse(content);
                    conversations = this.data.parseJSONExport(jsonData);
                    console.log('Parsed JSON:', conversations.length, 'conversations');
                } else if (file.name.endsWith('.html')) {
                    conversations = this.data.parseHTMLExport(content);
                    console.log('Parsed HTML:', conversations.length, 'conversations');
                }

                totalConversations.push(...conversations);
                processed++;
            } catch (error) {
                console.error('Error parsing file', file.name, ':', error);
                alert(`Error parsing file: ${file.name}\n\n${error.message}`);
            }
        }

        if (totalConversations.length > 0) {
            console.log('Adding', totalConversations.length, 'conversations to data store');
            await this.data.addConversations(totalConversations);
            console.log('Total conversations in store:', this.data.conversations.length);
            alert(`Successfully imported ${totalConversations.length} conversation(s)!`);
            this.updateUI();
        } else {
            alert('No valid conversations found in the uploaded file(s).');
        }

        // Reset file input
        document.getElementById('fileInput').value = '';
    }

    async loadFromStorage() {
        await this.data.loadFromStorage();
        this.currentTab = this.data.currentTab || 'conversations';
    }

    updateUI() {
        this.updateConversationList();
        this.updateMainView();
    }

    updateConversationList() {
        const listContainer = document.getElementById('conversationList');

        let conversations = [];
        let isStarredPairsTab = false;

        if (this.currentTab === 'conversations') {
            conversations = this.data.conversations;
        } else if (this.currentTab === 'starred') {
            conversations = this.data.getStarredConversations();
        } else if (this.currentTab === 'starredPairs') {
            isStarredPairsTab = true;
        }

        // Apply search filter if active (only within the current tab)
        const searchQuery = document.getElementById('globalSearchInput').value.trim();
        if (searchQuery && !isStarredPairsTab) {
            const lowerQuery = searchQuery.toLowerCase();
            conversations = conversations.filter(conv => {
                // Search in title
                if (conv.title.toLowerCase().includes(lowerQuery)) {
                    return true;
                }
                // Search in pairs
                return conv.pairs.some(pair =>
                    pair.question.content.toLowerCase().includes(lowerQuery) ||
                    pair.answers.some(ans => ans.content.toLowerCase().includes(lowerQuery))
                );
            });
        }

        // Clear the list
        listContainer.innerHTML = '';

        // Handle starred pairs tab differently
        if (isStarredPairsTab) {
            this.renderStarredPairs(listContainer, searchQuery);
            return;
        }

        if (conversations.length === 0) {
            // Create and show empty state
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';

            if (this.currentTab === 'starred') {
                emptyState.innerHTML = `
                    <p>No starred conversations</p>
                    <small>Star conversations to see them here</small>
                `;
            } else if (searchQuery) {
                emptyState.innerHTML = `
                    <p>No results found</p>
                    <small>Try a different search term</small>
                `;
            } else {
                emptyState.innerHTML = `
                    <p>No conversations loaded</p>
                    <small>Import your ChatGPT export to get started</small>
                `;
            }

            listContainer.appendChild(emptyState);
            return;
        }

        // Render conversation items
        conversations.forEach(conv => {
            const item = document.createElement('div');
            item.className = 'conversation-item';
            item.dataset.id = conv.id;

            if (this.data.currentConversationId === conv.id) {
                item.classList.add('active');
            }

            const date = new Date(conv.updateTime * 1000);
            const dateStr = this.formatDate(date);

            item.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <div class="conversation-item-title" title="${this.escapeHtml(conv.title)}">
                    ${this.escapeHtml(conv.title)}
                </div>
                <span class="star-icon ${conv.starred ? 'starred' : ''}" data-id="${conv.id}">
                    ${conv.starred ? '⭐' : '☆'}
                </span>
            `;

            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('star-icon')) {
                    this.selectConversation(conv.id);
                }
            });

            const starIcon = item.querySelector('.star-icon');
            starIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleStarConversation(conv.id);
            });

            listContainer.appendChild(item);
        });
    }

    updateMainView() {
        const uploadState = document.getElementById('uploadState');
        const chatView = document.getElementById('chatView');

        if (!this.data.currentConversationId) {
            uploadState.style.display = 'flex';
            chatView.style.display = 'none';
            this.currentView = 'upload';
            return;
        }

        uploadState.style.display = 'none';
        chatView.style.display = 'flex';
        this.currentView = 'chat';

        const conv = this.data.getCurrentConversation();
        if (conv) {
            console.log('Displaying conversation:', conv.title, 'with', conv.pairs.length, 'pairs');
            document.getElementById('threadTitleInput').value = conv.title;
            this.renderPairs(conv.pairs);
        } else {
            console.error('Conversation not found:', this.data.currentConversationId);
            console.log('Available conversations:', this.data.conversations.map(c => c.id));
        }
    }

    renderPairs(pairs, filterQuery = '') {
        const container = document.getElementById('messagesContainer');
        container.innerHTML = '';

        let filteredPairs = pairs;

        if (filterQuery) {
            const lowerQuery = filterQuery.toLowerCase();
            filteredPairs = pairs.filter(pair =>
                pair.question.content.toLowerCase().includes(lowerQuery) ||
                pair.answers.some(ans => ans.content.toLowerCase().includes(lowerQuery))
            );
        }

        if (filteredPairs.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <p>${filterQuery ? 'No messages match your search' : 'No messages in this conversation'}</p>
                </div>
            `;
            return;
        }

        filteredPairs.forEach(pair => {
            const pairEl = this.createPairElement(pair);
            container.appendChild(pairEl);
        });
    }

    createPairElement(pair) {
        const container = document.createElement('div');
        container.className = 'pair-container';
        container.dataset.pairId = pair.id;

        // Create question element (user message with index)
        const questionEl = this.createQuestionElement(pair.question, pair.index);
        container.appendChild(questionEl);

        // Create answer element(s) - only put actions on the last answer
        pair.answers.forEach((answer, index) => {
            const isLastAnswer = index === pair.answers.length - 1;
            const answerEl = this.createAnswerElement(answer, pair.id, pair.starred, isLastAnswer);
            container.appendChild(answerEl);
        });

        return container;
    }

    createQuestionElement(question, index) {
        const div = document.createElement('div');
        div.className = 'message user';

        div.innerHTML = `
            <div class="message-content">
                <div class="message-index">${index}</div>
                <div class="message-body">
                    <div class="message-text">${this.formatMessageContent(question.content)}</div>
                </div>
            </div>
        `;

        return div;
    }

    createAnswerElement(answer, pairId, isStarred, showActions) {
        const div = document.createElement('div');
        div.className = 'message assistant';

        const timestamp = new Date(answer.timestamp * 1000);
        const timestampStr = this.formatDateTime(timestamp);

        // Get model name, default to 'GPT' if not available
        const model = answer.model || 'GPT';

        const actionsHtml = showActions ? `
            <div class="message-actions">
                <span class="model-badge">${model}</span>
                <button class="message-action-btn timestamp" title="Show timestamp">
                    🕒 ${timestampStr}
                </button>
                <button class="message-action-btn star ${isStarred ? 'starred' : ''}" data-pair-id="${pairId}">
                    ${isStarred ? '⭐ Starred' : '☆ Star'}
                </button>
                <button class="message-action-btn delete" data-pair-id="${pairId}">
                    🗑️ Delete
                </button>
            </div>
        ` : '';

        div.innerHTML = `
            <div class="message-content">
                <div class="message-body">
                    <div class="message-text">${this.formatMessageContent(answer.content)}</div>
                    ${actionsHtml}
                </div>
            </div>
        `;

        // Add event listeners for actions
        if (showActions) {
            const deleteBtn = div.querySelector('.delete');
            deleteBtn.addEventListener('click', () => {
                this.deletePair(pairId);
            });

            const starBtn = div.querySelector('.star');
            starBtn.addEventListener('click', () => {
                this.toggleStarPair(pairId);
            });
        }

        return div;
    }

    async selectConversation(id) {
        this.data.currentConversationId = id;
        await this.data.saveToStorage();
        this.updateUI();

        // Clear thread search
        document.getElementById('threadSearchInput').value = '';

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('open');
        }
    }

    switchTab(tab) {
        this.currentTab = tab;
        this.data.currentTab = tab;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        this.updateConversationList();
    }

    renderStarredPairs(container, searchQuery) {
        // Get all starred pairs across all conversations
        let starredPairs = this.data.getStarredPairs();

        // Apply search filter if active
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            starredPairs = starredPairs.filter(pair =>
                pair.question.content.toLowerCase().includes(lowerQuery) ||
                pair.answers.some(ans => ans.content.toLowerCase().includes(lowerQuery))
            );
        }

        if (starredPairs.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';

            if (searchQuery) {
                emptyState.innerHTML = `
                    <p>No starred pairs match your search</p>
                    <small>Try a different search term</small>
                `;
            } else {
                emptyState.innerHTML = `
                    <p>No starred pairs yet</p>
                    <small>Star pairs to see them here</small>
                `;
            }

            container.appendChild(emptyState);
            return;
        }

        // Group pairs by conversation
        const groupedByConversation = {};
        starredPairs.forEach(pair => {
            const convId = pair.conversationId;
            if (!groupedByConversation[convId]) {
                groupedByConversation[convId] = {
                    title: pair.conversationTitle,
                    pairs: []
                };
            }
            groupedByConversation[convId].pairs.push(pair);
        });

        // Render grouped pairs
        Object.entries(groupedByConversation).forEach(([convId, group]) => {
            // Create conversation group header
            const groupHeader = document.createElement('div');
            groupHeader.className = 'starred-pairs-group-header';
            groupHeader.innerHTML = `
                <div class="group-title">${this.escapeHtml(group.title)}</div>
            `;
            container.appendChild(groupHeader);

            // Render pairs in this group
            group.pairs.forEach(pair => {
                const item = document.createElement('div');
                item.className = 'starred-pair-item';

                // Get first few words of question
                const questionPreview = pair.question.content.substring(0, 60) + (pair.question.content.length > 60 ? '...' : '');

                item.innerHTML = `
                    <div class="pair-index">${pair.index}</div>
                    <div class="pair-question">${this.escapeHtml(questionPreview)}</div>
                    <div class="pair-actions">
                        <button class="pair-action-btn view" data-conv-id="${pair.conversationId}" data-pair-id="${pair.id}">
                            View
                        </button>
                        <button class="pair-action-btn unstar ${pair.starred ? 'starred' : ''}" data-conv-id="${pair.conversationId}" data-pair-id="${pair.id}">
                            ${pair.starred ? '⭐' : '☆'}
                        </button>
                    </div>
                `;

                // Add click handlers
                const viewBtn = item.querySelector('.view');
                viewBtn.addEventListener('click', () => {
                    this.selectConversation(pair.conversationId);
                });

                const unstarBtn = item.querySelector('.unstar');
                unstarBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    await this.data.toggleStarPair(pair.conversationId, pair.id);
                    this.updateConversationList();
                });

                container.appendChild(item);
            });
        });
    }

    handleGlobalSearch(query) {
        this.updateConversationList();
    }

    handleThreadSearch(query) {
        const conv = this.data.getCurrentConversation();
        if (conv) {
            this.renderPairs(conv.pairs, query);
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('open');
    }

    toggleTitleEdit() {
        const input = document.getElementById('threadTitleInput');
        input.disabled = !input.disabled;
        if (!input.disabled) {
            input.focus();
            input.select();
        }
    }

    async saveTitleEdit() {
        const input = document.getElementById('threadTitleInput');
        input.disabled = true;

        if (this.data.currentConversationId) {
            const newTitle = input.value.trim();
            if (newTitle) {
                await this.data.updateConversationTitle(this.data.currentConversationId, newTitle);
                this.updateConversationList();
            }
        }
    }

    async deleteCurrentThread() {
        if (!this.data.currentConversationId) return;

        if (confirm('Are you sure you want to delete this entire conversation? This cannot be undone.')) {
            await this.data.deleteConversation(this.data.currentConversationId);
            this.updateUI();
        }
    }

    async deletePair(pairId) {
        if (!this.data.currentConversationId) return;

        if (confirm('Delete this message pair? This cannot be undone.')) {
            await this.data.deletePair(this.data.currentConversationId, pairId);
            this.updateMainView();
        }
    }

    async toggleStarConversation(id) {
        await this.data.toggleStarConversation(id);
        this.updateConversationList();
    }

    async toggleStarPair(pairId) {
        if (!this.data.currentConversationId) return;

        await this.data.toggleStarPair(this.data.currentConversationId, pairId);
        this.updateMainView();
    }

    saveProject() {
        const project = this.data.exportProject();
        const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chatgpt-parser-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async clearAllData() {
        await this.data.clearStorage();
        this.data.conversations = [];
        this.data.currentConversationId = null;
        this.updateUI();
    }

    formatMessageContent(content) {
        // First escape HTML to prevent XSS
        let formatted = this.escapeHtml(content);

        // Format code blocks first (before other markdown)
        formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre><code class="language-${lang || ''}">${code.trim()}</code></pre>`;
        });

        // Format inline code
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Format tables BEFORE other processing
        formatted = formatted.replace(/^[ \t]*\|.*\|[ \t]*$/gm, (match) => {
            const cells = match.split('|').filter(c => c.trim() !== '');
            const cellTags = cells.map(cell => cell.trim().replace(/^:\-+:?$/, '---').includes('---')
                ? `<th>${cell.trim()}</th>`
                : `<td>${cell.trim()}</td>`).join('');
            return `<tr>${cellTags}</tr>`;
        });

        // Wrap table rows in table tags (this is simplified - proper table parsing is complex)
        formatted = formatted.replace(/(<tr>.*<\/tr>\s*)+/g, '<table>$&</table>');

        // Format headers (but not if they're indented with 4+ spaces)
        formatted = formatted.replace(/^(?! {4})### (.*$)/gm, '<h3>$1</h3>');
        formatted = formatted.replace(/^(?! {4})## (.*$)/gm, '<h2>$1</h2>');
        formatted = formatted.replace(/^(?! {4})# (.*$)/gm, '<h1>$1</h1>');

        // Format bold
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Format italic
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Format horizontal rules
        formatted = formatted.replace(/^---$/gm, '<hr>');

        // Format lists - simpler approach to avoid indentation issues
        // Split by double newlines first to preserve list blocks
        const blocks = formatted.split(/\n\n/);

        formatted = blocks.map(block => {
            // Skip table blocks
            if (block.includes('<table>')) return block;

            const lines = block.split('\n');
            let result = [];
            let inList = false;
            let listType = null; // 'ul' or 'ol'

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const isUlItem = /^[\-\*]\s/.test(line);
                const isOlItem = /^\d+\.\s/.test(line);

                if (isUlItem || isOlItem) {
                    const currentListType = isUlItem ? 'ul' : 'ol';
                    const itemContent = line.replace(/^[\-\*\d]+\.\s/, '');

                    // Start new list if needed
                    if (!inList || currentListType !== listType) {
                        if (inList) result.push(`</${listType}>`);
                        result.push(`<${currentListType}>`);
                        listType = currentListType;
                        inList = true;
                    }

                    result.push(`<li>${itemContent}</li>`);
                } else {
                    // Close list if we were in one
                    if (inList) {
                        result.push(`</${listType}>`);
                        inList = false;
                        listType = null;
                    }
                    result.push(line);
                }
            }

            // Close list if still open at end
            if (inList) {
                result.push(`</${listType}>`);
            }

            return result.join('\n');
        }).join('\n\n');

        // Split into paragraphs (double line breaks)
        let paragraphs = formatted.split(/\n\n/);

        // Process each paragraph
        paragraphs = paragraphs.map(para => {
            // Skip empty paragraphs
            if (!para.trim()) return '';

            // Skip if this is already HTML (lists, headers, code blocks, hr, tables)
            if (para.match(/^(<[huol]|<pre|<li|<table)/)) {
                return para;
            }

            // Preserve leading indentation (4 spaces or more) for code blocks
            if (para.match(/^(    |\t)/m)) {
                // Remove the leading 4 spaces from each line but preserve formatting
                const lines = para.split('\n');
                const trimmedLines = lines.map(line => line.replace(/^    /, ''));
                return `<pre style="white-space: pre-wrap;">${trimmedLines.join('\n')}</pre>`;
            }

            // Regular paragraph - convert single line breaks to <br>
            return `<p>${para.replace(/\n/g, '<br>')}</p>`;
        });

        // Join all paragraphs and filter out empty ones
        formatted = paragraphs.filter(p => p).join('\n');

        return formatted;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return date.toLocaleDateString();
    }

    formatDateTime(date) {
        return date.toLocaleString();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ChatGPTParserApp();
});
