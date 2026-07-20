/*
 * This script querys the Wargaming api to get collection and collection element data.
 * It then compiles it down to only the necessary dataset for the webapp.
 */
import {
    mkdir,
    readFile,
    writeFile
} from "node:fs/promises";

const API_BASE_URL = "https://api.worldofwarships.com/wows/encyclopedia";
const APPLICATION_ID = process.env.WG_APPLICATION_ID;

const COLLECTIONS_ENDPOINT = "collections";
const ELEMENTS_ENDPOINT = "collectioncards";

const OUTPUT_PATH = "data/collections.json";

if (!APPLICATION_ID) {
    throw new Error(
        "WG_APPLICATION_ID is missing. " +
        "Set it as an environment variable before running this script."
    );
}

/**
 * Fetch all records from a Wargaming API endpoint.
 */
async function fetchAllRecords(endpoint) {
    /*
     * Start with a normal request that makes no pagination assumptions.
     * Defaults to single page, can be updated if WG implements pagination.
     */
    const firstResponse = await fetchEndpoint(endpoint);

    const records = [
        ...Object.values(firstResponse.data ?? {})
    ];

    const totalPages = Number(
        firstResponse.meta?.page_total ?? 1
    );

    if (
        !Number.isInteger(totalPages) || totalPages > 100
    ) {
        throw new Error(
            `${endpoint} returned an invalid page count: ${totalPages}`
        );
    }

    if (totalPages <= 1) {
        console.log(
            `${endpoint} returned ${records.length} records ` +
            "in a single response."
        );

        return records;
    }

    console.log(
        `${endpoint} reports ${totalPages} pages.`
    );

    /*
     * Page 1 was already returned, so begin at page 2.
     */
    const remainingRequests = [];

    for (
        let pageNumber = 2;
        pageNumber <= totalPages;
        pageNumber++
    ) {
        remainingRequests.push(
            fetchEndpoint(endpoint, pageNumber)
        );
    }

    /*
     * Fetch the remaining pages concurrently.
     */
    const remainingResponses =
        await Promise.all(remainingRequests);

    for (const response of remainingResponses) {
        records.push(
            ...Object.values(response.data ?? {})
        );
    }

    console.log(
        `${endpoint} returned ${records.length} total records.`
    );

    return records;
}

async function fetchEndpoint(endpoint, pageNumber = null) {
    const url = new URL(`${API_BASE_URL}/${endpoint}/`);

    const parameters = {
        application_id: APPLICATION_ID,
        language: "en"
    };

    /*
     * The initial request does not specify a page.
     * Additional requests only add page_no if the API says
     * more pages exist.
     */
    if (pageNumber !== null) {
        parameters.page_no = String(pageNumber);
    }

    url.search = new URLSearchParams(parameters);

    // Never log this URL because it contains the API key.
    const response = await fetch(url, {
        headers: {
            Accept: "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(
            `${endpoint} returned HTTP ${response.status}.`
        );
    }

    const body = await response.json();

    if (body.status !== "ok") {
        throw new Error(
            `${endpoint} returned an API error: ` +
            JSON.stringify(body.error)
        );
    }

    return body;
}

/**
 * Count how many collection elements belong to each collection.
 *
 * Returns:
 *
 * Map {
 *   "4279212976" => 36,
 *   "4286553008" => 16
 * }
 */
function countElementsByCollection(elements) {
    const counts = new Map();

    for (const element of elements) {
        const collectionId =
            String(element.collection_id);

        const currentCount =
            counts.get(collectionId) ?? 0;

        counts.set(
            collectionId,
            currentCount + 1
        );
    }

    return counts;
}

/**
 * Convert the raw API collections into the small shape
 * used by the browser application.
 */
function compileCollections(rawCollections, rawElements) {
    const elementCounts = countElementsByCollection(rawElements);

    return rawCollections
        .map((collection) => {
            const id =
                String(collection.collection_id);

            return {
                id: Number(collection.collection_id),
                name: collection.name,
                size: elementCounts.get(id) ?? 0,
                duplicateRate:
                    Number(collection.card_cost),
                image: collection.image ?? null
            };
        })
        /*
         * Exclude malformed or incomplete entries.
         */
        .filter((collection) =>
            Number.isInteger(collection.id) &&
            typeof collection.name === "string" &&
            collection.name.trim() !== "" &&
            Number.isInteger(collection.size) &&
            collection.size > 0 &&
            Number.isInteger(
                collection.duplicateRate
            ) &&
            collection.duplicateRate > 0
        )
        .sort((left, right) =>
            left.name.localeCompare(
                right.name,
                "en",
                {
                    sensitivity: "base"
                }
            )
        );
}

/**
 * Read the existing generated file.
 *
 * Returning null for a missing file makes the first run easy.
 */
async function readExistingOutput() {
    try {
        const contents = await readFile(
            OUTPUT_PATH,
            "utf8"
        );

        if (contents.trim() === "") {
            console.log(
                `${OUTPUT_PATH} is empty. It will be replaced.`
            );

            return null;
        }

        try {
            return JSON.parse(contents);
        } catch {
            console.log(
                `${OUTPUT_PATH} contains invalid JSON. It will be replaced.`
            );

            return null;
        }
    } catch (error) {
        if (error.code === "ENOENT") {
            console.log(
                `${OUTPUT_PATH} does not exist yet. It will be created.`
            );

            return null;
        }

        throw error;
    }
}

/**
 * Compare only actual collection data.
 *
 * We intentionally do not compare updatedAt, because that
 * timestamp changes every run and would create useless commits.
 */
function collectionsChanged(
    existingOutput,
    newCollections
) {
    const existingCollections =
        existingOutput?.collections ?? [];

    return (
        JSON.stringify(existingCollections) !==
        JSON.stringify(newCollections)
    );
}

async function main() {
    console.log("Starting collection-data update.");

    /*
     * These requests are independent, so run them together.
     */
    const [
        rawCollections,
        rawElements
    ] = await Promise.all([
        fetchAllRecords(COLLECTIONS_ENDPOINT),
        fetchAllRecords(ELEMENTS_ENDPOINT)
    ]);

    console.log(
        `Fetched ${rawCollections.length} collections.`
    );

    console.log(
        `Fetched ${rawElements.length} collection elements.`
    );

    const compiledCollections =
        compileCollections(
            rawCollections,
            rawElements
        );

    console.log(
        `Compiled ${compiledCollections.length} valid collections.`
    );

    const existingOutput =
        await readExistingOutput();

    if (
        !collectionsChanged(
            existingOutput,
            compiledCollections
        )
    ) {
        console.log(
            "Collection data has not changed."
        );

        return;
    }

    const output = {
        updatedAt: new Date().toISOString(),
        collections: compiledCollections
    };

    await mkdir("data", {
        recursive: true
    });

    await writeFile(
        OUTPUT_PATH,
        `${JSON.stringify(output, null, 2)}\n`,
        "utf8"
    );

    console.log(
        `Updated ${OUTPUT_PATH}.`
    );
}

await main();
