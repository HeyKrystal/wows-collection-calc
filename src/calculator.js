/*
  =========================
  TWEAKABLE CALCULATOR CONSTANTS
  =========================

  SIMULATION_COUNT:
    How many simulated completions to run each time the button is clicked.
    Higher = smoother estimates, but slower.

  VERY_LUCKY_PERCENTILE:
    Very lucky container value.
    5 means "5 out of 100 simulated players finished by this many containers."

  TYPICAL_PERCENTILE:
    Lower end of the displayed Expected Containers range.
    50 means "half of simulated players finished by this many containers."

  CONSERVATIVE_PERCENTILE:
    Upper end of the displayed expected Containers range.
    90 means "8 out of 10 simulated players finished by this many containers."

  VERY_UNLUCKY_PERCENTILE:
    Very unlucky container value.
    95 means "95 out of 100 simulated players finished by this many containers."

  MAX_COLLECTION_SIZE:
    Prevents users from entering huge collection sizes that could make the calculator sluggish.

  MAX_ELEMENTS_PER_CONTAINER:
    Safety cap for unusually large container values.

  MAX_DUPLICATE_RATE:
    Safety cap for the number of duplicates needed to create one collection token.
    This keeps extremely unusual inputs from creating very long simulation runs.
*/
export const CONSTANTS = {
    SIMULATION_COUNT: 500000,
    VERY_LUCKY_PERCENTILE: 5,
    TYPICAL_PERCENTILE: 50,
    CONSERVATIVE_PERCENTILE: 80,
    VERY_UNLUCKY_PERCENTILE: 95,
    MAX_COLLECTION_SIZE: 256,
    MAX_ELEMENTS_PER_CONTAINER: 100,
    MAX_DUPLICATE_RATE: 1000
};

function percentile(sortedValues, percent) {
    const index = Math.ceil((percent / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
}

export function normalizeStartingTokens(tokens, duplicates, duplicateRate) {
    const extraTokens = Math.floor(duplicates / duplicateRate);

    return {
        tokens: tokens + extraTokens,
        duplicates: duplicates % duplicateRate
    };
}


function canFinish(collectionSize, owned, tokens) {
    const missing = collectionSize - owned;
    return tokens >= missing;
}

function simulateOneRun(config) {
    let owned = config.elementsCollected;
    let tokens = config.collectionTokens;
    let duplicates = config.duplicates;
    let containers = 0;

    while (!canFinish(config.collectionSize, owned, tokens)) {
        containers++;

        for (let i = 0; i < config.elementsPerContainer; i++) {
            if (canFinish(config.collectionSize, owned, tokens)) {
                break;
            }

            const missing = config.collectionSize - owned;
            const chanceNew = missing / config.collectionSize;

            if (Math.random() < chanceNew) {
                owned++;
            } else {
                duplicates++;

                if (duplicates >= config.duplicateRate) {
                    const newTokens = Math.floor(duplicates / config.duplicateRate);
                    tokens += newTokens;
                    duplicates = duplicates % config.duplicateRate;
                }
            }
        }
    }

    return containers;
}

export function runSimulation(config) {
    const results = [];

    for (let i = 0; i < config.simulations; i++) {
        results.push(simulateOneRun(config));
    }

    results.sort((a, b) => a - b);

    const sum = results.reduce((total, value) => total + value, 0);

    return {
        average: sum / results.length,
        lucky: percentile(results, CONSTANTS.VERY_LUCKY_PERCENTILE),
        typical: percentile(results, CONSTANTS.TYPICAL_PERCENTILE),
        conservative: percentile(results, CONSTANTS.CONSERVATIVE_PERCENTILE),
        unlucky: percentile(results, CONSTANTS.VERY_UNLUCKY_PERCENTILE)
    };
}

export function calculateBestCase(config) {
    const missing = Math.max(
        0,
        config.collectionSize - config.elementsCollected - config.collectionTokens
    );

    return Math.ceil(missing / config.elementsPerContainer);
}

export function calculateWorstCase(config) {
    const missing = Math.max(0, config.collectionSize - config.elementsCollected);
    const tokensStillNeeded = Math.max(0, missing - config.collectionTokens);
    const duplicateItemsNeeded = Math.max(
        0,
        (tokensStillNeeded * config.duplicateRate) - config.duplicates
    );

    return Math.ceil(duplicateItemsNeeded / config.elementsPerContainer);
}

export function validateConfig(config) {
    if (!Number.isInteger(config.collectionSize) || config.collectionSize < 1 || config.collectionSize > CONSTANTS.MAX_COLLECTION_SIZE) {
        return `Collection Size must be between 1 and ${CONSTANTS.MAX_COLLECTION_SIZE}.`;
    }

    if (!Number.isInteger(config.elementsCollected) || config.elementsCollected < 0 || config.elementsCollected > config.collectionSize) {
        return "Elements Collected must be between 0 and Collection Size.";
    }

    if (!Number.isInteger(config.collectionTokens) || config.collectionTokens < 0) {
        return "Collection Tokens must be 0 or higher.";
    }

    if (!Number.isInteger(config.duplicateRate) || config.duplicateRate < 1 || config.duplicateRate > CONSTANTS.MAX_DUPLICATE_RATE) {
        return `Duplicate Rate must be between 1 and ${CONSTANTS.MAX_DUPLICATE_RATE}.`;
    }

    if (!Number.isInteger(config.duplicates) || config.duplicates < 0) {
        return "Duplicates must be 0 or higher.";
    }

    if (!Number.isInteger(config.elementsPerContainer) || config.elementsPerContainer < 1 || config.elementsPerContainer > CONSTANTS.MAX_ELEMENTS_PER_CONTAINER) {
        return `Elements Per Container must be between 1 and ${CONSTANTS.MAX_ELEMENTS_PER_CONTAINER}.`;
    }

    return "";
}