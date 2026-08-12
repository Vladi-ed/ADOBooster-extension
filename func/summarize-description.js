const SUMMARY_OPTIONS_COUNT = 3;
const popoverId = 'extSummarizeDescription-popover'
let summarizerPromise;

export async function summarizeDescription(button) {
    const descriptionField = getDescriptionField();
    const description = descriptionField?.innerText?.trim();

    if (!description) {
        console.log('No description to summarize');
        return;
    }

    const allowedPrefixes = getAllowedProductPrefixes(description);

    const previousText = button.innerText;
    button.disabled = true;
    button.innerText = '✨ Summarizing...';

    try {
        const availability = await Summarizer.availability(getSummarizerOptions());

        if (availability === 'unavailable') {
            console.warn('Chrome Summarizer API is unavailable');
            return;
        }

        const summarizer = await getSummarizer();

        const rawSummary = await summarizer.summarize(description, {
            context: [
                `Generate exactly ${SUMMARY_OPTIONS_COUNT} alternative incident titles.`,
                'Each option should be one clear title.',
                'Each option should include the affected area and the visible problem.',
                'Put each option on a separate line.',
                getPrefixInstruction(allowedPrefixes)
            ].join(' ')
        });

        const summaries = parseSummaryOptions(rawSummary, allowedPrefixes);

        if (!summaries.length) {
            console.warn('No valid summaries were generated:', rawSummary);
            return;
        }

        console.log('%cSummaries:', 'font-weight: bold', summaries);
        showSummaryPopover(summaries);
    } catch (e) {
        console.warn('Failed to summarize defect description', e);
    } finally {
        button.disabled = false;
        button.innerText = previousText;
    }
}

function getDescriptionField() {
    const descriptionFields = document.body.querySelectorAll("div.lean-rooster.rooster-editor[aria-label='Description']");
    return descriptionFields.item(descriptionFields.length - 1);
}

function getSummarizerOptions() {
    return {
        type: 'key-points',
        format: 'plain-text',
        length: 'long',
        outputLanguage: 'en',
        expectedInputLanguages: ['en'],
        expectedContextLanguages: ['en'],
        sharedContext: [
            'Create alternative descriptive incident summary titles from defect descriptions.',
            'Each summary title should be specific and informative, not too short.',
            'Include the affected page, area, feature, and visible problem when available.',
            'Return only the requested summary title lines.',
            'Do not include explanations, examples, instructions, or meta text.'
        ].join(' ')
    };
}

function getSummarizer() {
    summarizerPromise ??= Summarizer.create({
        ...getSummarizerOptions(),
        monitor(m) {
            m.addEventListener('downloadprogress', (e) => {
                if (e.loaded === 0) console.log(`Chrome Summarizer model loading...`);
                else console.log(`Model download ${Math.round(e.loaded * 100)}%`);
            });
        }
    });

    return summarizerPromise;
}

function getAllowedProductPrefixes(description) {
    const allowedPrefixes = [];

    if (/\b(MobileView|MV)\b/i.test(description)) {
        allowedPrefixes.push('MV');
    }

    if (/\bLinks\b/i.test(description)) {
        allowedPrefixes.push('Links');
    }

    return allowedPrefixes;
}

function getPrefixInstruction(allowedPrefixes) {
    if (allowedPrefixes.length === 0) {
        return 'Do not add a product prefix.';
    }

    if (allowedPrefixes.length === 1) {
        return `Each option must start with this exact prefix: ${allowedPrefixes[0]}:.`;
    }

    return `Each option must start with exactly one of these prefixes: ${allowedPrefixes.map((prefix) => `${prefix}:`).join(' or ')}.`;
}

function parseSummaryOptions(rawSummary, allowedPrefixes) {
    return splitSummaryOptions(rawSummary)
        .map(normalizeSummary)
        .filter(Boolean)
        .filter((summary) => isValidSummary(summary, allowedPrefixes))
        .filter(isUniqueSummary)
        .slice(0, SUMMARY_OPTIONS_COUNT);
}

function splitSummaryOptions(rawSummary) {
    const text = cleanText(rawSummary);

    if (!text) {
        return [];
    }

    const arrayItems = splitArrayLikeText(text);

    if (arrayItems.length > 1) {
        return arrayItems;
    }

    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    if (lines.length > 1) {
        return lines;
    }

    return text
        .split(/(?=(?:^|\s)(?:[-*•]|\d+[.)])\s+)/)
        .map((part) => part.trim())
        .filter(Boolean);
}

function splitArrayLikeText(text) {
    const trimmedText = text.trim();

    if (!trimmedText.startsWith('[') || !trimmedText.endsWith(']')) {
        return [];
    }

    return trimmedText
        .slice(1, -1)
        .split(/,\s*(?=['"])/)
        .map((item) => item.trim())
        .map(removeWrappingQuotes)
        .filter(Boolean);
}

function normalizeSummary(rawSummary) {
    return cleanText(rawSummary)
        .replace(/^[-*•]\s*/, '')
        .replace(/^\d+[.)]\s*/, '')
        .replace(/\bMobileView\b/gi, 'MV')
        .replace(/^(MV|Links)\s*[-–—]\s*/i, '$1: ')
        .replace(/^mv\s*:/i, 'MV:')
        .replace(/^links\s*:/i, 'Links:')
        .replace(/\b([A-Za-z0-9]+)'s\b/g, '$1')
        .replace(/\s+/g, ' ')
        .replace(/[.]+$/, '')
        .trim();
}

function cleanText(text) {
    return String(text ?? '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\u00a0/g, ' ')
        .trim();
}

function removeWrappingQuotes(text) {
    return text
        .replace(/^[\s"'`]+/, '')
        .replace(/[\s"'`]+$/, '')
        .trim();
}

function isValidSummary(summary, allowedPrefixes) {
    if (!summary) {
        return false;
    }

    if (containsPromptLeak(summary)) {
        return false;
    }

    const prefix = getSummaryPrefix(summary);

    if (allowedPrefixes.length === 0) {
        return prefix === null;
    }

    if (!prefix) {
        return false;
    }

    if (!allowedPrefixes.includes(prefix)) {
        return false;
    }

    if (/^(MV|Links)\s*:\s*(MV|Links)\b/i.test(summary)) {
        return false;
    }

    return true;
}

function containsPromptLeak(summary) {
    const promptLeakPatterns = [
        /suggest different version/i,
        /example:/i,
        /summari[sz]e the defect/i,
        /summary must/i,
        /must start with/i,
        /return only/i,
        /generate exactly/i,
        /alternative incident titles/i,
        /alternative defect summaries/i,
        /do not include/i,
        /put each option/i,
        /do not add a product prefix/i
    ];

    return promptLeakPatterns.some((pattern) => pattern.test(summary));
}

function getSummaryPrefix(summary) {
    const match = summary.match(/^(MV|Links)\s*:/i);

    if (!match) {
        return null;
    }

    return match[1].toLowerCase() === 'mv' ? 'MV' : 'Links';
}

function isUniqueSummary(summary, index, summaries) {
    const normalizedSummary = normalizeForComparison(summary);

    return summaries.findIndex((item) =>
        normalizeForComparison(item) === normalizedSummary
    ) === index;
}

function normalizeForComparison(summary) {
    return summary
        .toLowerCase()
        .replace(/\bmobileview\b/g, 'mv')
        .replace(/\s+/g, ' ')
        .replace(/[.,;:!?'"`]/g, '')
        .trim();
}

function showSummaryPopover(summaries) {
    hideSummaryPopover();

    const popover = document.createElement('div');
    popover.id = popoverId;
    popover.setAttribute('popover', 'auto');

    Object.assign(popover.style, {
        padding: '10px',
        margin: '3px',
        border: '1px solid #cacaca',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgb(0 0 0 / 20%)',
        inset: 'auto',
        positionAnchor: '--summary-btn',
        positionArea: 'bottom'
    });

    const content = document.createElement('div');

    Object.assign(content.style, {
        display: 'flex',
        gap: '8px',
        alignItems: 'stretch'
    });

    const textarea = document.createElement('textarea');
    textarea.value = summaries.join('\n');
    textarea.rows = SUMMARY_OPTIONS_COUNT;

    Object.assign(textarea.style, {
        width: '560px',
        height: '74px',
        padding: '4px',
        lineHeight: '20px',
        resize: 'vertical',
        display: 'block'
    });

    const buttons = createCopyButtons(textarea, summaries.length);

    content.append(textarea, buttons);
    popover.append(content);

    // const extGenerateBtn = document.getElementById('extGenerateBtn');
    document.body.append(popover);

    popover.showPopover();
}

function createCopyButtons(textarea, count) {
    const buttons = document.createElement('div');

    Object.assign(buttons.style, {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    });

    for (let index = 0; index < count; index++) {
        buttons.append(createCopyButton(textarea, index));
    }

    return buttons;
}

function createCopyButton(textarea, index) {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerText = `Copy ${index + 1}`;

    Object.assign(button.style, {
        height: '22px',
        whiteSpace: 'nowrap'
    });

    button.addEventListener('click', async () => {
        const line = getTextareaLine(textarea, index);

        try {
            if (line) {
                await navigator.clipboard.writeText(line);
            }
        } catch (e) {
            console.warn('Failed to copy summary text', e);
        } finally {
            hideSummaryPopover();
        }
    });

    return button;
}

function getTextareaLine(textarea, index) {
    return textarea.value
        .split(/\r?\n/)
        .at(index)
        ?.trim() ?? '';
}

function hideSummaryPopover() {
    const popover = document.getElementById(popoverId);

    if (!popover) return;

    try {
        if (popover.matches(':popover-open')) {
            popover.hidePopover();
        }
    } catch {
        // Ignore environments without full Popover API support.
        console.warn('Popover API not supported in this environment');
    }

    popover.remove();
}

