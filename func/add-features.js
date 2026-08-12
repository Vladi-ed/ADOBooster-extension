import {timeout} from "./timeout.js";
/**
 * Main function to add features to the ADO UI
 */
export async function addFeatures() {
    await timeout(1000);
    const headerSelector = document.querySelector('div.project-header .bolt-breadcrumb');
    // const headerSelector = document.querySelector("#skip-to-main-content > div > div.query-header-tab-container > div.query-header-breadcrumb-container");
    console.log('headerSelector', headerSelector);

    if (!headerSelector) {
        console.warn('No headerSelector');
        return;
    }

    const generateGitBranchBtn = document.createElement("button");
    generateGitBranchBtn.className = "bolt-button";
    generateGitBranchBtn.style.marginInline = "16px";
    generateGitBranchBtn.style.color = "darkolivegreen";
    generateGitBranchBtn.textContent = "🌿 Generate git branch";
    headerSelector.append(generateGitBranchBtn);

    generateGitBranchBtn.addEventListener("click", async () => {
        const workItemHeader = document.querySelector("div.work-item-form-header div.flex-row > a");
        const workItemName = document.querySelector("div.work-item-form-header div.work-item-title-textfield > input").value;

        if (!workItemHeader || !workItemName) {
            console.log('No work item header found');
            return;
        }

        const ticketName = workItemHeader?.textContent.toString().toLowerCase().replace(/\b\w/g, char => char.toUpperCase()) + ': ' + workItemName;
        const gitBranchName = generateGitBranchName(ticketName);

        await navigator.clipboard.writeText(gitBranchName);

        const temp = generateGitBranchBtn.innerText;
        generateGitBranchBtn.innerText = '✅ Generated git branch';
        setTimeout(() => (generateGitBranchBtn.innerText = temp), 1000);
    });

}

function generateGitBranchName(ticketName) {
    return ticketName
        .trim()
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-+|-+$/g, '');
}
