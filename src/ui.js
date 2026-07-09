import {
    CONSTANTS,
    normalizeStartingTokens,
    runSimulation,
    calculateBestCase,
    calculateWorstCase,
    validateConfig
} from "./calculator.js";

const form = document.getElementById("calculatorForm");
const errorBox = document.getElementById("errorBox");
const results = document.getElementById("results");
const emptyState = document.getElementById("emptyState");

document
    .getElementById("dismissNotice")
    .addEventListener("click", () => {
        document.getElementById("notice").classList.add("dismissed");
    });

function getInt(id) {
    return Number(document.getElementById(id).value);
}

function showError(message) {
    errorBox.textContent = message;
    errorBox.style.display = "block";
    results.classList.add("hidden");
    emptyState.classList.remove("hidden");
}

function clearError() {
    errorBox.textContent = "";
    errorBox.style.display = "none";
}

function formatNumber(value) {
    return new Intl.NumberFormat().format(value);
}

form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearError();

    const containerCostRaw = document.getElementById("containerCost").value.trim();
    const containerCost = containerCostRaw === "" ? null : Number(containerCostRaw);

    let config = {
        collectionSize: getInt("collectionSize"),
        elementsCollected: getInt("elementsCollected"),
        collectionTokens: getInt("collectionTokens"),
        duplicateRate: getInt("duplicateRate"),
        duplicates: getInt("duplicates"),
        elementsPerContainer: getInt("elementsPerContainer"),
        simulations: CONSTANTS.SIMULATION_COUNT
    };

    const validationError = validateConfig(config);

    if (validationError) {
        showError(validationError);
        return;
    }

    if (containerCostRaw !== "" && (!Number.isInteger(containerCost) || containerCost < 0)) {
        showError("Container Cost must be blank or a whole number 0 or higher.");
        return;
    }

    const normalized = normalizeStartingTokens(
        config.collectionTokens,
        config.duplicates,
        config.duplicateRate
    );

    config.collectionTokens = normalized.tokens;
    config.duplicates = normalized.duplicates;

    const simulationStart = performance.now();
    const stats = runSimulation(config);
    const simulationEnd = performance.now();
    const elapsedMs = simulationEnd - simulationStart;

    const bestCase = calculateBestCase(config);
    const worstCase = calculateWorstCase(config);

    document.getElementById("expectedRange").textContent =
        `${formatNumber(stats.typical)} – ${formatNumber(stats.conservative)}`;

    document.getElementById("averageContainers").textContent = stats.average.toFixed(2);
    document.getElementById("veryLuckyContainers").textContent = formatNumber(stats.lucky);
    document.getElementById("veryUnluckyContainers").textContent = formatNumber(stats.unlucky);
    document.getElementById("bestCaseContainers").textContent = formatNumber(bestCase);
    document.getElementById("worstCaseContainers").textContent = formatNumber(worstCase);

    const costBox = document.getElementById("costBox");

    if (containerCost !== null) {
        const currency = document.getElementById("currency").value;
        const typicalCost = stats.typical * containerCost;
        const conservativeCost = stats.conservative * containerCost;

        document.getElementById("totalCost").textContent =
            `${formatNumber(typicalCost)} – ${formatNumber(conservativeCost)} ${currency}`;
        costBox.classList.remove("hidden");
    } else {
        costBox.classList.add("hidden");
    }

    document.getElementById("summaryText").textContent =
        `Based on ${formatNumber(config.simulations)} simulations, a realistic planning range is ${formatNumber(stats.typical)} - ${formatNumber(stats.conservative)} containers. ` +
        `The lower end is the ${CONSTANTS.TYPICAL_PERCENTILE}% result, and the higher end is the ${CONSTANTS.CONSERVATIVE_PERCENTILE}% result.`;

    document.getElementById("simulationTime").textContent =
        `Time spent on simulation: ${elapsedMs.toFixed(2)} ms`;


    emptyState.classList.add("hidden");
    results.classList.remove("hidden");
});