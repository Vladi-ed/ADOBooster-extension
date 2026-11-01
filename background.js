const ADO_URL_PATTERN = 'https://dev.azure.com/securitas-healthcare/*';
// const ADO_START_URL = 'https://dev.azure.com/securitas-healthcare/SHS/_queries/favorites';
const ADO_START_URL = 'https://dev.azure.com/securitas-healthcare/SHS/_queries/query/4785e767-1b89-4451-80b5-bcbdc8b774d6';

// on the Extension icon click
chrome.action.onClicked.addListener(() => openADO().catch(error => console.error('Failed to open ADO', error)));

chrome.runtime.onInstalled.addListener(async ({reason}) => {
    console.log('ADOBooster extension ' + reason);

    // menu items survive browser updates, so clear them first to avoid a duplicate id error
    await chrome.contextMenus.removeAll();
    chrome.contextMenus.create({id: 'reload', title: 'Reload Extension', contexts: ['action']});

    // ADO tabs are reloaded only after the extension restarted, so they get the new content script
    const {reloadTabsOnStart} = await chrome.storage.local.get('reloadTabsOnStart');
    if (reloadTabsOnStart) {
        await chrome.storage.local.remove('reloadTabsOnStart');
        const tabs = await chrome.tabs.query({url: ADO_URL_PATTERN});
        await Promise.all(tabs.map(tab => chrome.tabs.reload(tab.id)));
    }

    const {os, arch} = await chrome.runtime.getPlatformInfo();
    console.log(`Browser Platform: ${os} ${arch}`);
});

async function openADO() {
    const [adoTab] = await chrome.tabs.query({url: ADO_URL_PATTERN});
    if (adoTab) await focusTab(adoTab);
    else await chrome.tabs.create({url: ADO_START_URL, active: true});
}

async function focusTab(tab) {
    await chrome.tabs.update(tab.id, {active: true});
    await chrome.windows.update(tab.windowId, {focused: true});
}

chrome.contextMenus.onClicked.addListener(async info => {
    if (info.menuItemId !== 'reload') return;

    console.log('Clicked on the context menu Reload button');

    try {
        const tabs = await chrome.tabs.query({url: ADO_URL_PATTERN});
        if (tabs.length > 0) {
            const tabsToClose = tabs.slice(1).map(tab => tab.id);
            if (tabsToClose.length > 0) await chrome.tabs.remove(tabsToClose);

            await focusTab(tabs[0]);
            await chrome.storage.local.set({reloadTabsOnStart: true});
        } else console.log('No open ADO tabs found');
    } catch (error) {
        console.error('Failed to prepare ADO tabs for reload', error);
    } finally {
        chrome.runtime.reload(); // extension reload should be at the end otherwise no other code will be running
    }
});
