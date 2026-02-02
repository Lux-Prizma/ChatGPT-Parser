/**
 * ConversationList - Handles conversation list rendering and context menu attachment
 */

import { t } from '../i18n/i18n.js';

export class ConversationList {
    constructor(eventBus, data, contextMenu) {
        this.eventBus = eventBus;
        this.data = data;
        this.contextMenu = contextMenu;
    }

    render(allConversations, starredConversations, allStarredPairs) {
        // Update counts
        document.querySelector('#allConversationsFolder .folder-count').textContent = `(${allConversations.length})`;
        document.querySelector('#starredConversationsFolder .folder-count').textContent = `(${starredConversations.length})`;
        document.querySelector('#starredPairsFolder .folder-count').textContent = `(${allStarredPairs.length})`;

        // Render built-in folders
        this.renderConversationFolder(document.getElementById('allConversationsContent'), allConversations);
        this.renderConversationFolder(document.getElementById('starredConversationsContent'), starredConversations);
        this.renderStarredPairsFolder(document.getElementById('starredPairsContent'), allStarredPairs);

        // Render custom folders
        this.renderCustomFolders();
    }

    renderCustomFolders() {
        const container = document.getElementById('customFoldersContainer');
        container.innerHTML = '';

        const folders = this.data.folders || [];
        folders.forEach(folder => {
            const folderElement = this.createFolderElement(folder);
            container.appendChild(folderElement);
        });
    }

    createFolderElement(folder) {
        const div = document.createElement('div');
        div.className = 'folder';
        div.id = folder.id;

        const conversations = this.data.getConversationsInFolder(folder.id);

        div.innerHTML = `
            <div class="folder-header" data-folder="${folder.id}">
                <svg class="folder-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
                <svg class="folder-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color: ${folder.color};">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                <span class="folder-title">${folder.name}</span>
                <span class="folder-count">(${conversations.length})</span>
            </div>
            <div class="folder-content collapsed" id="${folder.id}Content">
                <!-- Conversations in this folder will be rendered here -->
            </div>
        `;

        // Add click handler for folder header
        const folderHeader = div.querySelector('.folder-header');
        folderHeader.addEventListener('click', () => {
            this.eventBus.emit('folder:toggle', { folderId: folder.id });
        });

        // Render conversations in this folder
        const contentDiv = div.querySelector(`#${folder.id}Content`);
        this.renderConversationFolder(contentDiv, conversations);

        // Add context menu to folder header
        folderHeader.addEventListener('contextmenu', (e) => {
            this.contextMenu.showFolderContextMenu(e, folder.id);
        });

        return div;
    }

    renderConversationFolder(container, conversations) {
        container.innerHTML = '';

        if (conversations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>${t('emptyStates.noConversations')}</p>
                    <small>${t('emptyStates.importToStart')}</small>
                </div>
            `;
            return;
        }

        conversations.forEach(conv => {
            const item = this.createConversationItem(conv);
            container.appendChild(item);
        });
    }

    renderStarredPairsFolder(container, starredPairs) {
        container.innerHTML = '';

        if (starredPairs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>${t('emptyStates.noStarredPairs')}</p>
                    <small>${t('emptyStates.starPairsToSee')}</small>
                </div>
            `;
            return;
        }

        starredPairs.forEach((pair) => {
            const item = this.createStarredPairItem(pair);
            container.appendChild(item);
        });
    }

    createConversationItem(conv) {
        const item = document.createElement('div');
        item.className = 'conversation-item';
        item.dataset.id = conv.id;

        if (this.data.currentConversationId === conv.id) {
            item.classList.add('active');
        }

        item.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <div class="conversation-item-title" title="${conv.title}">
                ${conv.title}
            </div>
            <span class="star-icon ${conv.starred ? 'starred' : ''}" data-id="${conv.id}">
                ${conv.starred ? '⭐' : '☆'}
            </span>
        `;

        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('star-icon')) {
                this.eventBus.emit('conversation:select', { id: conv.id });
            }
        });

        const starIcon = item.querySelector('.star-icon');
        starIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.eventBus.emit('conversation:star', { id: conv.id });
        });

        // Add right-click context menu
        item.addEventListener('contextmenu', (e) => {
            this.contextMenu.showConversationContextMenu(e, conv.id);
        });

        return item;
    }

    createStarredPairItem(pair) {
        const item = document.createElement('div');
        item.className = 'conversation-item';
        item.dataset.pairId = pair.id;
        item.dataset.conversationId = pair.conversationId;

        const previewText = pair.question.content.substring(0, 50);
        const truncatedText = previewText.length < pair.question.content.length
            ? previewText + '...'
            : previewText;

        item.innerHTML = `
            <span class="star-icon starred">💎</span>
            <div class="conversation-item-title" title="${pair.question.content}">
                ${truncatedText}
            </div>
            <small style="color: var(--text-muted);">from "${pair.conversationTitle}"</small>
        `;

        item.addEventListener('click', () => {
            this.eventBus.emit('conversation:selectWithPair', { conversationId: pair.conversationId, pairId: pair.id });
        });

        return item;
    }
}
