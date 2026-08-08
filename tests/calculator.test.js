import { afterEach, describe, expect, it, vi } from "vitest";
import {
    CONSTANTS,
    normalizeStartingTokens,
    runSimulation,
    validateConfig
} from "../src/calculator.js";

const VALID_CONFIG = {
    collectionSize: 16,
    elementsCollected: 0,
    collectionTokens: 0,
    duplicateRate: 4,
    duplicates: 0,
    isDaily: false,
    elementsPerContainer: 1,
    simulations: 10
};

afterEach(() => {
    vi.restoreAllMocks();
});

describe("calculator configuration", () => {
    it("keeps the production simulation constants", () => {
        expect(CONSTANTS.SIMULATION_COUNT).toBe(500000);
        expect(CONSTANTS.TYPICAL_PERCENTILE).toBe(50);
        expect(CONSTANTS.CONSERVATIVE_PERCENTILE).toBe(80);
        expect(CONSTANTS.ELEMENT_CHANCE_IN_DAILY).toBe(0.60);
    });

    it("accepts a valid configuration", () => {
        expect(validateConfig(VALID_CONFIG)).toBe("");
    });

    it("normalizes completed duplicate groups into tokens", () => {
        expect(normalizeStartingTokens(2, 10, 4)).toEqual({
            tokens: 4,
            duplicates: 2
        });
    });
});

describe("simulation behavior", () => {
    it("requires zero containers when saved tokens can finish the collection", () => {
        const stats = runSimulation({
            ...VALID_CONFIG,
            collectionSize: 8,
            elementsCollected: 5,
            collectionTokens: 3
        });

        expect(stats.lucky).toBe(0);
        expect(stats.typical).toBe(0);
        expect(stats.conservative).toBe(0);
        expect(stats.unlucky).toBe(0);
        expect(stats.bestCase).toBe(0);
        expect(stats.average).toBe(0);
    });

    it("produces the deterministic all-new-elements path when random is zero", () => {
        vi.spyOn(Math, "random").mockReturnValue(0);

        const stats = runSimulation({
            ...VALID_CONFIG,
            collectionSize: 4,
            duplicateRate: 4,
            simulations: 20
        });

        expect(stats.lucky).toBe(4);
        expect(stats.typical).toBe(4);
        expect(stats.conservative).toBe(4);
        expect(stats.unlucky).toBe(4);
        expect(stats.bestCase).toBe(4);
        expect(stats.average).toBe(4);
    });
});
