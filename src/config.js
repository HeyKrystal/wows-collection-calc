export const CONFIG = {
    /**
     * Shared normalized Wargaming collection data.
     *
     * The Pages URL is preferred. The raw GitHub URL is used as a fallback
     * if the Pages-hosted source is unavailable.
     */
    collectionData: {
        urls: [
            "https://heykrystal.github.io/wows-shared-data/v1/collections.json",
            "https://raw.githubusercontent.com/HeyKrystal/wows-shared-data/main/public/v1/collections.json"
        ],
        requestTimeoutMs: 8000
    }
};
