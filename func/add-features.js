import {handleMutations} from "./handle-mutations.js";
/**
 * Main function to add features to the ADO UI
 * @returns {MutationObserver} The observer, which callers can disconnect.
 */
export function addFeatures() {
    const observer = new MutationObserver(handleMutations);
    observer.observe(document.body, { childList: true, subtree: true });
    console.log('Mutation observer started by the Extension');

    return observer;
}
