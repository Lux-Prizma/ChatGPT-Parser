/**
 * i18n HTML Updater
 * This file contains utility functions to help add data-i18n attributes to HTML elements
 * Run this in browser console or use as reference for manual updates
 */

// Data attributes mapping for HTML elements
const i18nAttributes = {
    // Navigation
    '.nav-logo span': { text: 'app.title' },
    '.nav-tab[data-tab="manage"] span': { text: 'nav.manage' },
    '.nav-tab[data-tab="ai"] span': { text: 'nav.aiTools' },
    '.nav-tab[data-tab="help"] span': { text: 'nav.help' },
    '.nav-tab[data-tab="options"] span': { text: 'nav.options' },

    // Sidebar
    '#newChatBtn': { text: 'sidebar.importHistory' },
    '#globalSearchInput': { placeholder: 'sidebar.searchPlaceholder' },
    '#starredConversationsFolder .folder-title': { text: 'sidebar.starredThreads' },
    '#starredPairsFolder .folder-title': { text: 'sidebar.starredPairs' },
    '#allConversationsFolder .folder-title': { text: 'sidebar.allConversations' },
    '#saveProjectBtn': { text: 'sidebar.saveProject' },
    '#clearDataBtn': { text: 'sidebar.clearData' },
    '#emptyState p': { text: 'sidebar.noConversations' },
    '#emptyState small': { text: 'sidebar.importHint' },

    // Buttons with tooltips
    '#mobileMenuBtn': { title: 'tooltips.menu' },
    '#filterBtn': { title: 'tooltips.filterByDate' },
    '#newFolderBtn': { title: 'tooltips.newFolder' },
    '#editTitleBtn': { title: 'tooltips.editTitle' },
    '#deleteThreadBtn': { title: 'tooltips.deleteThread' },
    '#mobileSearchIconBtn': { title: 'tooltips.search' },
    '#threadSearchToggle': { title: 'tooltips.searchInConversation' },
    '#searchPrevBtn': { title: 'tooltips.previousMatch' },
    '#searchNextBtn': { title: 'tooltips.nextMatch' },
    '#searchCloseBtn': { title: 'tooltips.clearSearch' },
    '#firstQuestionBtn': { title: 'tooltips.firstQuestion' },
    '#prevQuestionBtn': { title: 'tooltips.previousQuestion' },
    '#nextQuestionBtn': { title: 'tooltips.nextQuestion' },
    '#lastQuestionBtn': { title: 'tooltips.lastQuestion' },

    // Chat view
    '#threadTitleInput': { value: 'chatView.newChat' },
    '#deleteThreadBtn span': { text: 'chatView.delete' },
    '#threadSearchInput': { placeholder: 'chatView.searchPlaceholder' },
    '#questionSelect option:first-child': { text: 'chatView.jumpToQuestion' },

    // Landing page
    '.landing-title h1': { text: 'landing.title' },
    '.landing-subtitle': { text: 'landing.subtitle' },
    '.upload-box h2': { text: 'landing.importTitle' },
    '.upload-box p:first-of-type': { text: 'landing.importDescription' },
    '#uploadBtn': { text: 'landing.chooseFiles' },
    '.upload-hint': { text: 'landing.importHint' },

    // Panels
    '#manage-panel h2': { text: 'panel.manageConversations' },
    '#ai-panel h2': { text: 'panel.aiTools' },
    '#help-panel h2': { text: 'panel.help' },
    '#options-panel h2': { text: 'panel.options' },

    // Panel sections
    '#manage-panel h3:nth-of-type(1)': { text: 'panelSections.importExport' },
    '#manage-panel button[onclick*="fileInput.click()"]': { text: 'panelSections.importConversations' },
    '#manage-panel button[onclick*="saveProject"]': { text: 'panelSections.saveProject' },
    '#manage-panel h3:nth-of-type(2)': { text: 'panelSections.organization' },
    '#manage-panel button[onclick*="showNewFolderDialog"]': { text: 'panelSections.createNewFolder' },
    '#manage-panel h3:nth-of-type(3)': { text: 'panelSections.dangerZone' },
    '#manage-panel button[onclick*="clearAllData"]': { text: 'panelSections.clearAllData' },

    // Panel content
    '#ai-panel h3': { text: 'panelContent.aiToolsComingSoon' },
    '#ai-panel p': { text: 'panelContent.aiToolsDescription' },
    '#help-panel h3': { text: 'panelContent.helpTitle' },
    '#help-panel p': { text: 'panelContent.helpDescription' },
    '#options-panel h3': { text: 'panelContent.optionsTitle' },
    '#options-panel p': { text: 'panelContent.optionsDescription' },

    // Context menus
    '#conversationContextMenu .context-menu-item[data-action="move"]': { text: 'contextMenu.moveTo' },
    '#folderContextMenu .context-menu-item[data-action="rename"]': { text: 'contextMenu.rename' },
    '#folderContextMenu .context-menu-item[data-action="color"]': { text: 'contextMenu.changeColor' },
    '#folderContextMenu .context-menu-item[data-action="delete"]': { text: 'contextMenu.delete' },
    '#moveToSubmenu .context-menu-item[data-folder="all"]': { text: 'contextMenu.allConversations' },

    // Dialogs - New Folder
    '#newFolderDialog h3': { text: 'dialogs.newFolder.title' },
    '#newFolderName': { placeholder: 'dialogs.newFolder.folderName' },
    '#newFolderDialog .color-picker span': { text: 'dialogs.newFolder.color' },
    '#cancelNewFolder': { text: 'dialogs.newFolder.cancel' },
    '#confirmNewFolder': { text: 'dialogs.newFolder.create' },

    // Dialogs - Date Filter
    '#dateFilterDialog h3': { text: 'dialogs.dateFilter.title' },
    '#dateFilterDialog .filter-option-label': { text: 'dialogs.dateFilter.filterType' },
    '#dateFilterDialog label:nth-of-type(1) span': { text: 'dialogs.dateFilter.conversationCreated' },
    '#dateFilterDialog label:nth-of-type(2) span': { text: 'dialogs.dateFilter.lastUpdated' },
    '#dateFilterDialog label:nth-of-type(3) span': { text: 'dialogs.dateFilter.containsMessages' },
    '#dateFilterDialog label[for="startDate"]': { text: 'dialogs.dateFilter.from' },
    '#dateFilterDialog label[for="endDate"]': { text: 'dialogs.dateFilter.to' },
    '#cancelDateFilter': { text: 'dialogs.dateFilter.cancel' },
    '#resetDateFilter': { text: 'dialogs.dateFilter.reset' },
    '#applyDateFilter': { text: 'dialogs.dateFilter.applyFilter' },

    // Dialogs - Duplicate
    '#duplicateDialog h2': { text: 'dialogs.duplicate.title' },
    '#duplicateDialog label:nth-of-type(1) span': { text: 'dialogs.duplicate.keepExisting' },
    '#duplicateDialog label:nth-of-type(2) span': { text: 'dialogs.duplicate.replaceAll' },
    '#duplicateDialog label:nth-of-type(3) span': { text: 'dialogs.duplicate.chooseIndividual' },
    '#cancelDuplicate': { text: 'dialogs.duplicate.cancelImport' },
    '#confirmDuplicate': { text: 'dialogs.duplicate.importNonDuplicates' },
    '#applyDuplicateAction': { text: 'dialogs.duplicate.applyChoices' }
};

/**
 * Function to apply i18n attributes to HTML
 * Call this in browser console after page load
 */
function applyI18nAttributes() {
    Object.entries(i18nAttributes).forEach(([selector, attrs]) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (attrs.text) el.setAttribute('data-i18n', attrs.text);
            if (attrs.placeholder) el.setAttribute('data-i18n-placeholder', attrs.placeholder);
            if (attrs.title) el.setAttribute('data-i18n-title', attrs.title);
            if (attrs.value) el.setAttribute('data-i18n-value', attrs.value);
        });
    });
    console.log('i18n attributes applied');
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { i18nAttributes, applyI18nAttributes };
}
