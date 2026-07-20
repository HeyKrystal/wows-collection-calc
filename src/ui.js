import {
    CONSTANTS,
    runSimulation,
    validateConfig
} from "./calculator.js";
import {
    loadCollections
} from "./collections.js";

const form = document.getElementById("calculatorForm");
const errorBox = document.getElementById("errorBox");
const results = document.getElementById("results");
const emptyState = document.getElementById("emptyState");
const notice = document.getElementById("notice");
const dismissNotice = document.getElementById("dismissNotice");
const collectionSearch = document.getElementById("collectionSearch");
const collectionToggle = document.getElementById("collectionToggle");
const collectionOptions = document.getElementById("collectionOptions");
const collectionCombobox = collectionSearch.closest(".combobox");

let collections = [];
let filteredCollections = [];
let selectedCollection = null;
let activeOptionIndex = -1;

initializeCollectionCombobox();

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

function getBool(id) {
    return Boolean(document.getElementById(id).checked);
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
        isDaily: getBool("isDaily"),
        elementsPerContainer: getInt("elementsPerContainer"),
        simulations: CONSTANTS.SIMULATION_COUNT
    }
}

function updateContainerOutputs(stats) {
    const expectedText =
        stats.typical === stats.conservative
            ? `Around ${formatNumber(stats.typical)}`
            : `${formatNumber(stats.typical)} – ${formatNumber(stats.conservative)}`;

    setText("expectedRange", expectedText);
    setText("averageContainers", stats.average.toFixed(2));
    setText("luckyContainers", formatNumber(stats.lucky));
    setText("unluckyContainers", formatNumber(stats.unlucky));
    setText("bestCaseContainers", formatNumber(stats.bestCase));
    setText("worstCaseContainers", (stats.worstCase < 0 ? '∞' : formatNumber(stats.worstCase)));
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
    setText("worstCaseCost", `${(stats.worstCase < 0 ? '∞' : formatNumber(worstCaseCost))} ${currency}`);
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

function handleCollectionFocus() {
    if (selectedCollection) {
        collectionSearch.select();
        return;
    }

    filterAndRenderCollections(
        collectionSearch.value
    );

    openCollectionOptions();
}

function handleCollectionInput() {
    selectedCollection = null;
    activeOptionIndex = -1;

    updateCollectionToggle();

    filterAndRenderCollections(
        collectionSearch.value.trim()
    );

    openCollectionOptions();
}

function handleCollectionToggle(event) {
    event.preventDefault();
    event.stopPropagation();

    if (selectedCollection) {
        clearSelectedCollection();
        return;
    }

    if (isCollectionOptionsOpen()) {
        closeCollectionOptions();
        return;
    }

    collectionSearch.focus();
    filterAndRenderCollections(collectionSearch.value);
    openCollectionOptions();
}

function filterAndRenderCollections(query) {
    const normalizedQuery = normalizeSearchText(query);

    filteredCollections = collections.filter((collection) => {
        if (normalizedQuery === "") {
            return true;
        }

        const normalizedName =
            normalizeSearchText(collection.name);

        const searchWords =
            normalizedQuery.split(/\s+/);

        return searchWords.every((word) =>
            normalizedName.includes(word)
        );
    });

    renderCollectionOptions();
}

function normalizeSearchText(value) {
    return value
        .toLocaleLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
}

function renderCollectionOptions() {
    collectionOptions.replaceChildren();

    if (filteredCollections.length === 0) {
        const empty = document.createElement("li");

        empty.className = "combobox-empty";
        empty.textContent = "No matching collections found.";

        collectionOptions.appendChild(empty);
        return;
    }

    filteredCollections.forEach((collection, index) => {
        const option = document.createElement("li");

        option.id = `collection-option-${index}`;
        option.className = "combobox-option";
        option.dataset.index = String(index);
        option.setAttribute("role", "option");
        option.setAttribute(
            "aria-selected",
            String(collection.id === selectedCollection?.id)
        );

        if (index === activeOptionIndex) {
            option.classList.add("active");
        }

        if (collection.id === selectedCollection?.id) {
            option.classList.add("selected");
        }

        if (collection.image) {
            const image = document.createElement("img");

            image.className = "combobox-option-image";
            image.src = collection.image;
            image.alt = "";
            image.loading = "lazy";

            option.appendChild(image);
        }

        const text = document.createElement("div");
        text.className = "combobox-option-text";

        const name = document.createElement("div");
        name.className = "combobox-option-name";
        name.textContent = collection.name;

        text.appendChild(name);

        if (collection.id !== "manual") {
            const details = document.createElement("div");

            details.className = "combobox-option-details";
            details.textContent =
                `${collection.size} elements · ` +
                `${collection.duplicateRate}:1 duplicate rate`;

            text.appendChild(details);
        }

        option.appendChild(text);
        collectionOptions.appendChild(option);
    });

    updateActiveCollectionOption();
}

function handleCollectionOptionMouseDown(event) {
    const option = event.target.closest(".combobox-option");

    if (!option) {
        return;
    }

    event.preventDefault();

    const index = Number(option.dataset.index);
    selectCollection(filteredCollections[index]);
}

function handleCollectionKeydown(event) {
    switch (event.key) {
        case "ArrowDown":
            event.preventDefault();

            if (!isCollectionOptionsOpen()) {
                filterAndRenderCollections(
                    collectionSearch.value
                );
                openCollectionOptions();
            }

            moveActiveOption(1);
            break;

        case "ArrowUp":
            event.preventDefault();

            if (!isCollectionOptionsOpen()) {
                filterAndRenderCollections(
                    collectionSearch.value
                );
                openCollectionOptions();
            }

            moveActiveOption(-1);
            break;

        case "Enter":
            if (
                isCollectionOptionsOpen() &&
                activeOptionIndex >= 0
            ) {
                event.preventDefault();

                selectCollection(
                    filteredCollections[activeOptionIndex]
                );
            }
            break;

        case "Escape":
            if (isCollectionOptionsOpen()) {
                event.preventDefault();
                closeCollectionOptions();

                collectionSearch.value =
                    selectedCollection?.name ?? "";

                updateCollectionToggle();
            }
            break;

        case "Tab":
            closeCollectionOptions();

            if (!selectedCollection) {
                restoreOrSelectExactCollection();
            }
            break;
    }
}

function moveActiveOption(direction) {
    if (filteredCollections.length === 0) {
        return;
    }

    activeOptionIndex += direction;

    if (activeOptionIndex < 0) {
        activeOptionIndex =
            filteredCollections.length - 1;
    }

    if (
        activeOptionIndex >=
        filteredCollections.length
    ) {
        activeOptionIndex = 0;
    }

    renderCollectionOptions();
}

function selectCollection(collection) {
    if (!collection) {
        return;
    }

    selectedCollection = collection;
    collectionSearch.value = collection.name;
    activeOptionIndex = -1;

    applyCollectionPreset(collection);
    updateCollectionToggle();
    closeCollectionOptions();
}

function applyCollectionPreset(collection) {
    if (collection.id === "manual") {
        return;
    }

    document.getElementById("collectionSize").value =
        collection.size;

    document.getElementById("duplicateRate").value =
        collection.duplicateRate;
}

function openCollectionOptions() {
    collectionOptions.classList.remove("hidden");
    collectionCombobox.classList.add("open");

    collectionSearch.setAttribute(
        "aria-expanded",
        "true"
    );
}

function closeCollectionOptions() {
    collectionOptions.classList.add("hidden");
    collectionCombobox.classList.remove("open");

    collectionSearch.setAttribute(
        "aria-expanded",
        "false"
    );

    collectionSearch.removeAttribute(
        "aria-activedescendant"
    );
}

function isCollectionOptionsOpen() {
    return !collectionOptions.classList.contains("hidden");
}

function updateActiveCollectionOption() {
    const activeOption =
        collectionOptions.querySelector(
            ".combobox-option.active"
        );

    if (!activeOption) {
        collectionSearch.removeAttribute(
            "aria-activedescendant"
        );
        return;
    }

    collectionSearch.setAttribute(
        "aria-activedescendant",
        activeOption.id
    );

    activeOption.scrollIntoView({
        block: "nearest"
    });
}

function handleOutsideCollectionClick(event) {
    if (!collectionCombobox.contains(event.target)) {
        closeCollectionOptions();
        restoreOrSelectExactCollection();
    }
}

function restoreOrSelectExactCollection() {
    const typedName =
        collectionSearch.value.trim();

    if (typedName === "") {
        selectedCollection = null;
        updateCollectionToggle();
        return;
    }

    const exactMatch = collections.find(
        (collection) =>
            collection.name.localeCompare(
                typedName,
                undefined,
                { sensitivity: "base" }
            ) === 0
    );

    if (exactMatch) {
        selectCollection(exactMatch);
        return;
    }

    collectionSearch.value =
        selectedCollection?.name ?? "";

    updateCollectionToggle();
}

function updateCollectionToggle() {
    const hasSelection = selectedCollection !== null;

    collectionToggle.textContent =
        hasSelection ? "×" : "▾";

    collectionToggle.setAttribute(
        "aria-label",
        hasSelection
            ? "Clear selected collection"
            : "Show collections"
    );

    collectionToggle.classList.toggle(
        "clear",
        hasSelection
    );
}

function clearSelectedCollection() {
    selectedCollection = null;
    activeOptionIndex = -1;

    collectionSearch.value = "";

    updateCollectionToggle();
    closeCollectionOptions();

    collectionSearch.focus();
}

async function initializeCollectionCombobox() {
    try {
        collections = await loadCollections();
    } catch (error) {
        console.error(error);

        collections = [];
        collectionSearch.placeholder = "Collection presets unavailable";
    }

    filterAndRenderCollections("");
    updateCollectionToggle();

    collectionSearch.addEventListener(
        "focus",
        handleCollectionFocus
    );

    collectionSearch.addEventListener(
        "input",
        handleCollectionInput
    );

    collectionSearch.addEventListener(
        "keydown",
        handleCollectionKeydown
    );

    collectionToggle.addEventListener(
        "click",
        handleCollectionToggle
    );

    collectionOptions.addEventListener(
        "mousedown",
        handleCollectionOptionMouseDown
    );

    document.addEventListener(
        "click",
        handleOutsideCollectionClick
    );
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