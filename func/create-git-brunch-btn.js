export function createGitBranchBtn(headerSelector) {
    const generateGitBranchBtn = document.createElement("button");
    generateGitBranchBtn.className = "bolt-button";
    generateGitBranchBtn.style.marginInline = "16px";
    generateGitBranchBtn.style.color = "darkolivegreen";
    generateGitBranchBtn.textContent = "🔀 Copy branch name";
    headerSelector.prepend(generateGitBranchBtn);

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