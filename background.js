// on the Extension icon click
chrome.action.onClicked.addListener(() => openADO());

chrome.runtime.onInstalled.addListener(async ({reason}) => {
    console.log('ADOBooster extension ' + reason);
    const {os, arch} = await chrome.runtime.getPlatformInfo();
    console.log(`Browser Platform: ${os} ${arch}`);

    chrome.contextMenus.create({
        id: 'reload', title: 'Reload Extension', visible: true, contexts: ['action']
    })
});

async function openADO() {
    const jazzTabs = await chrome.tabs.query({url: 'https://dev.azure.com/securitas-healthcare/*'});
    if (jazzTabs.length) {
        await chrome.tabs.update(jazzTabs[0].id, {active: true});
        await chrome.windows.update(jazzTabs[0].windowId, {focused: true});
    }
    else await chrome.tabs.create({
        url: 'https://dev.azure.com/securitas-healthcare/SHS/_queries/favorites',
        active: true
    });
}

chrome.contextMenus.onClicked.addListener(async info => {
    if (info.menuItemId !== 'reload') return;

    console.log('Clicked on the context menu Reload button');

    const tabs = await chrome.tabs.query({url: "https://dev.azure.com/securitas-healthcare/*"})
    if (tabs.length > 0) {
        const activeTab = tabs.at(-1);
        const tabsToClose = tabs.slice(0, -1).map((tab) => tab.id);

        if (tabsToClose.length > 0) {
            await chrome.tabs.remove(tabsToClose);
        }

        await chrome.tabs.reload(activeTab.id);
        await chrome.tabs.update(activeTab.id, {active: true});
        await chrome.windows.update(activeTab.windowId, {focused: true});
    } else console.log('No open ADO tabs found');

    chrome.runtime.reload(); // extension reload should be at the end otherwise no other code will be running
});
