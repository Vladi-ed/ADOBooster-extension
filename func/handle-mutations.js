import {createGitBranchBtn} from "./create-git-brunch-btn.js";
import {createDescriptionSummaryButton} from "./create-summary-btn.js";

export function handleMutations(mutationList) {
    const start = performance.now();

    for (const mutation of mutationList) {
        const node = getValidAddedElement(mutation);
        if (!node) continue;

        const shouldStop = handleAddedElement(node);
        if (shouldStop) break;
    }

    logSlowMutationHandling(start, mutationList);
}

function handleAddedElement(node) {
    const firstClassName = node.classList.item(0);
    // console.log('firstClassName', firstClassName, node);

    if (firstClassName === 'bolt-identitypickerdropdown') {
        console.log(firstClassName, 'firstClassName', node);

        createGitBranchBtn(node.parentNode.parentElement.firstChild.firstChild)
        createDescriptionSummaryButton(node.parentNode.parentElement.firstChild.firstChild)
        return true;
    }

    return false;
}

function getValidAddedElement(mutation) {
    if (mutation.type !== "childList") return null;

    const { addedNodes, target } = mutation;
    if (addedNodes.length === 0) return null;
    if (addedNodes.length > 5) return null;
    if (!target.isConnected) return null;

    const node = addedNodes[0];
    if (node.nodeType !== Node.ELEMENT_NODE) return null;
    if (!node.firstElementChild) return null; // if no children

    return node;
}


function logSlowMutationHandling(start, mutationList) {
    const exTime = performance.now() - start;
    if (exTime > 1.5) {
        console.log(`handleMutations Execution time: ${Math.round(exTime)} ms`, mutationList);
    }
}