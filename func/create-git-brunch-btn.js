export function createGitBranchBtn(toolbarContainer) {
    const BUTTON_LABEL = '\uE1DD';
    const button = document.createElement('button');
    button.textContent = BUTTON_LABEL;
    button.type = 'button';
    button.className = 'bolt-button';
    button.style.marginInline = '2px';
    button.style.padding = '8px';
    button.style.fontFamily = 'FluentRegular';
    button.style.fontWeight = '100';
    button.style.fontSize = '15px';
    button.style.lineHeight = '1rem';

    let resetLabelTimeout;

    button.addEventListener('click', async () => {
        const ticketName = getTicketName();
        if (!ticketName) {
            console.warn('Work item header or title not found');
            return;
        }

        clearTimeout(resetLabelTimeout);

        try {
            await navigator.clipboard.writeText(generateGitBranchName(ticketName));
            button.textContent = '✅';
        } catch (error) {
            console.error('Failed to copy Git branch name', error);
            button.textContent = '❌ Could not copy branch name';
        } finally {
            resetLabelTimeout = setTimeout(() => {
                button.textContent = BUTTON_LABEL;
            }, 1000);
        }
    });

    const original = toolbarContainer.querySelector('div.bolt-clipboard-button.invisible');
    if (original) {
        original.append(button);
        // original.parentNode.appendChild(button);
    }
}

function getTicketName() {
    const workItemHeader = getLastElement('div.work-item-form-header div.flex-row > a');
    const workItemTitle = getLastElement('div.work-item-form-header div.work-item-title-textfield > input')?.value;

    if (!workItemHeader || !workItemTitle) return null;

    const workItemLabel = workItemHeader.textContent
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());

    return `${workItemLabel}: ${workItemTitle}`;
}

function getLastElement(selector) {
    const elements = document.querySelectorAll(selector);
    return elements.item(elements.length - 1);
}

function generateGitBranchName(ticketName) {
    return ticketName
        .trim()
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-+|-+$/g, '');
}
