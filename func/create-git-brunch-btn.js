export function createGitBranchBtn(toolbarContainer) {
    const BUTTON_LABEL = '🔀 Copy branch name';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'bolt-button';
    button.style.marginInline = '16px';
    button.style.color = 'darkolivegreen';
    button.textContent = BUTTON_LABEL;

    let resetLabelTimeout;

    button.addEventListener('click', async () => {
        const ticketName = getTicketName();
        if (!ticketName) {
            console.warn('Work item header or title not found');
            return;
        }

        clearTimeout(resetLabelTimeout);
        button.disabled = true;

        try {
            await navigator.clipboard.writeText(generateGitBranchName(ticketName));
            button.textContent = '✅ Branch name copied';
        } catch (error) {
            console.error('Failed to copy Git branch name', error);
            button.textContent = '❌ Could not copy branch name';
        } finally {
            button.disabled = false;
            resetLabelTimeout = setTimeout(() => {
                button.textContent = BUTTON_LABEL;
            }, 1000);
        }
    });

    toolbarContainer.prepend(button);
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
