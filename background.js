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
    if (jazzTabs.length) await chrome.tabs.update(jazzTabs[0].id, {active: true});
    else await chrome.tabs.create({
        url: 'https://dev.azure.com/securitas-healthcare/SHS/_queries/favorites',
        active: true
    });
}

chrome.contextMenus.onClicked.addListener(async info => {
    if (info.menuItemId !== 'reload') return;

    console.log('Clicked on the context menu Reload button');

    const tabs = await chrome.tabs.query({url: "https://dev.azure.com/securitas-healthcare/*"})
    if (tabs.length > 0) tabs.forEach((tab, index) => {
        if (index === tabs.length - 1) {
            chrome.tabs.reload(tab.id);
            chrome.tabs.update(tab.id, {active: true});
        } else chrome.tabs.remove(tab.id);
    })
    else console.log('No open ADO tabs found');

    chrome.runtime.reload(); // extension reload should be at the end otherwise no other code will be running
});
