import(chrome.runtime.getURL('func/add-features.js'))
    .then(contentScript => contentScript.addFeatures())
    .then(() => console.log('content script loaded'))
