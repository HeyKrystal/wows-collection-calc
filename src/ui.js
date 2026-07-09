import {
    CONSTANTS,
    normalizeStartingTokens,
    runSimulation,
    validateConfig
} from "./calculator.js";

const form = document.getElementById("calculatorForm");
const errorBox = document.getElementById("errorBox");
const results = document.getElementById("results");
const emptyState = document.getElementById("emptyState");
const notice = document.getElementById("notice");
const dismissNotice = document.getElementById("dismissNotice");

if (notice && dismissNotice) {
    dismissNotice.addEventListener("click", () => {
        notice.classList.add("dismissed");
    });
}

function showError(message) {
    errorBox.textContent = message;
    errorBox.style.display = "block";
    results.classList.remove("results-visible");
    results.classList.add("hidden");
    emptyState.classList.remove("hidden");
}

function showResults() {
    results.classList.remove("hidden");

    requestAnimationFrame(() => {
        results.classList.add("results-visible");
    });
}

function clearError() {
    errorBox.textContent = "";
    errorBox.style.display = "none";
}

function formatNumber(value) {
    return new Intl.NumberFormat().format(value);
}

function getInt(id) {
    return Number(document.getElementById(id).value);
}

function setText(id, value) {
    document.getElementById(id).textContent = value;
}

function readConfigFromForm() {
    return {
        collectionSize: getInt("collectionSize"),
        elementsCollected: getInt("elementsCollected"),
        collectionTokens: getInt("collectionTokens"),
        duplicateRate: getInt("duplicateRate"),
        duplicates: getInt("duplicates"),
        elementsPerContainer: getInt("elementsPerContainer"),
        simulations: CONSTANTS.SIMULATION_COUNT
    }
}

function updateContainerOutputs(stats) {
    setText("expectedRange", `${formatNumber(stats.typical)} – ${formatNumber(stats.conservative)}`);
    setText("averageContainers", stats.average.toFixed(2));
    setText("luckyContainers", formatNumber(stats.lucky));
    setText("unluckyContainers", formatNumber(stats.unlucky));
    setText("bestCaseContainers", formatNumber(stats.bestCase));
    setText("worstCaseContainers", formatNumber(stats.worstCase));
}

function updateCostOutputs(stats, containerCost, currency) {
    const luckyCost = stats.lucky * containerCost;
    const unluckyCost = stats.unlucky * containerCost;
    const typicalCost = stats.typical * containerCost;
    const conservativeCost = stats.conservative * containerCost;
    const bestCaseCost = stats.bestCase * containerCost;
    const worstCaseCost = stats.worstCase * containerCost;
    const averageCost = stats.average * containerCost;

    setText("totalCost", `${formatNumber(typicalCost)} – ${formatNumber(conservativeCost)} ${currency}`);
    setText("luckyCost", `${formatNumber(luckyCost)} ${currency}`);
    setText("unluckyCost", `${formatNumber(unluckyCost)} ${currency}`);
    setText("bestCaseCost", `${formatNumber(bestCaseCost)} ${currency}`);
    setText("worstCaseCost", `${formatNumber(worstCaseCost)} ${currency}`);
    setText("averageCost", `${formatNumber(averageCost)} ${currency}`);
}

function updateSummaryOutputs(config, stats, elapsedMs) {
    setText("summaryText", `Based on ${formatNumber(config.simulations)} simulations, a realistic range of required containers is ${formatNumber(stats.typical)} - ${formatNumber(stats.conservative)} containers. ` +
        `The lower end is the ${CONSTANTS.TYPICAL_PERCENTILE}% result, and the higher end is the ${CONSTANTS.CONSERVATIVE_PERCENTILE}% result.`);
    setText("simulationTime", `Time spent on simulation: ${elapsedMs.toFixed(2)} ms`);
}

function showCostOutputs() {
    document.querySelectorAll(".cost-output").forEach((element) => {
        element.classList.remove("hidden");
    });
}

function hideCostOutputs() {
    document.querySelectorAll(".cost-output").forEach((element) => {
        element.classList.add("hidden");
    });
}

form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearError();

    const containerCostRaw = document.getElementById("containerCost").value.trim();
    const containerCost = containerCostRaw === "" ? null : Number(containerCostRaw);
    const currency = document.getElementById("currency").value;

    let config = readConfigFromForm();

    const validationError = validateConfig(config);
    if (validationError) {
        showError(validationError);
        return;
    }
    if (containerCostRaw !== "" && (!Number.isInteger(containerCost) || containerCost < 0)) {
        showError("Container Cost must be blank or a whole number 0 or higher.");
        return;
    }

    // Run simulation and measure runtime.
    const simulationStart = performance.now();
    const stats = runSimulation(config);
    const simulationEnd = performance.now();
    const elapsedMs = simulationEnd - simulationStart;

    // Update Outputs
    updateContainerOutputs(stats);
    if (containerCost !== null) {
        updateCostOutputs(stats, containerCost, currency);
        showCostOutputs();
    } else {
        hideCostOutputs();
    }
    updateSummaryOutputs(config, stats, elapsedMs);

    emptyState.classList.add("hidden");
    showResults();
});