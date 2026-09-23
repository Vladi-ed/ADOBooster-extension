import {summarizeDescription} from "./summarize-description.js";

export function createDescriptionSummaryButton(toolbarContainer) {
    if (!('Summarizer' in self)) {
        console.log('No Summarizer API found in this browser. Please use Chrome 138 or later.');
        return;
    }

    const magicButton = document.createElement('button');
    magicButton.id = 'extGenerateBtn';
    magicButton.style.anchorName = '--summary-btn';
    magicButton.type = 'button';
    magicButton.innerText = '\uf28f';
    // magicButton.title = 'Summarize the description';
    magicButton.className = 'bolt-button';
    magicButton.style.fontFamily = 'AzureDevOpsMDL2Assets';
    magicButton.style.fontWeight = '100';
    magicButton.style.padding = '7px';
    magicButton.ariaHaspopup = 'true';
    magicButton.ariaLabel = 'Summarize description';
    toolbarContainer.prepend(magicButton);
    magicButton.addEventListener('click', () => summarizeDescription(magicButton));
}
