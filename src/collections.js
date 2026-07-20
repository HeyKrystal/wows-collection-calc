export async function loadCollections() {
    const response = await fetch("./data/collections.json");

    if (!response.ok) {
        throw new Error(
            `Could not load collection data: HTTP ${response.status}`
        );
    }

    const data = await response.json();

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