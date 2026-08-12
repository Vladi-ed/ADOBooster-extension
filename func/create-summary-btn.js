import {summarizeDescription} from "./summarize-description.js";

export function createDescriptionSummaryButton(toolbarContainer) {
    if (!('Summarizer' in self)) {
        console.log('No Summarizer API found in this browser. Please use Chrome 138 or later.');
        return;
    }

    const magicButton = document.createElement('button');
    magicButton.id = 'extGenerateBtn';
    // magicButton.popovertarget = 'extSummarizeDescription-popover';
    magicButton.style.anchorName = '--summary-btn';
    magicButton.type = 'button';
    magicButton.innerText = '✨ Summary';
    magicButton.title = 'Summarize the description';
    magicButton.className = "bolt-button";
    toolbarContainer.prepend(magicButton);
    magicButton.addEventListener('click', () => summarizeDescription(magicButton));
}
