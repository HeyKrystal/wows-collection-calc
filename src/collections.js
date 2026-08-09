import { CONFIG } from "./config.js";

export async function loadCollections() {
    const data = await loadCollectionData();
    const collections = Array.isArray(data)
        ? data
        : data.collections;

    if (!Array.isArray(collections)) {
        throw new Error(
            "Collection data does not contain a collections array."
        );
    }

    return collections
        .filter(isValidCollection)
        .sort((left, right) =>
            left.name.localeCompare(right.name, undefined, {
                sensitivity: "base"
            })
        );
}

async function loadCollectionData() {
    const errors = [];

    for (const url of CONFIG.collectionData.urls) {
        try {
            return await fetchJson(
                url,
                CONFIG.collectionData.requestTimeoutMs
            );
        } catch (error) {
            errors.push(`${url}: ${error.message}`);
            console.warn(
                `Could not load collection data from ${url}.`,
                error
            );
        }
    }

    throw new Error(
        "Could not load collection data from any configured source. " +
        errors.join(" | ")
    );
}

async function fetchJson(url, timeoutMs) {
    const controller = new AbortController();
    const timeoutId = setTimeout(
        () => controller.abort(),
        timeoutMs
    );

    try {
        const response = await fetch(url, {
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        if (error.name === "AbortError") {
            throw new Error(
                `Request timed out after ${timeoutMs} ms`
            );
        }

        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

function isValidCollection(collection) {
    return (
        collection &&
        collection.id !== undefined &&
        typeof collection.name === "string" &&
        collection.name.trim() !== "" &&
        Number.isInteger(collection.size) &&
        collection.size > 0 &&
        Number.isInteger(collection.duplicateRate) &&
        collection.duplicateRate > 0
    );
}
