const STORAGE_KEY = "wows-collections-theme";
const VALID_PREFERENCES = new Set(["system", "light", "dark"]);
const systemColorScheme = window.matchMedia("(prefers-color-scheme: dark)");
const buttons = Array.from(document.querySelectorAll("[data-theme-choice]"));
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function getSavedPreference() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return VALID_PREFERENCES.has(saved) ? saved : "system";
    } catch {
        return "system";
    }
}

function resolveTheme(preference) {
    if (preference === "system") {
        return systemColorScheme.matches ? "dark" : "light";
    }

    return preference;
}

function applyTheme(preference, persist = true) {
    const normalizedPreference = VALID_PREFERENCES.has(preference)
        ? preference
        : "system";

    const resolvedTheme = resolveTheme(normalizedPreference);

    document.documentElement.dataset.themePreference = normalizedPreference;
    document.documentElement.dataset.theme = resolvedTheme;
    themeColorMeta?.setAttribute(
        "content",
        resolvedTheme === "dark" ? "#0c1420" : "#edf4f8"
    );

    for (const button of buttons) {
        button.setAttribute(
            "aria-pressed",
            String(button.dataset.themeChoice === normalizedPreference)
        );
    }

    if (!persist) {
        return;
    }

    try {
        localStorage.setItem(STORAGE_KEY, normalizedPreference);
    } catch {
        // The theme still works for this page load when storage is unavailable.
    }
}

for (const button of buttons) {
    button.addEventListener("click", () => {
        applyTheme(button.dataset.themeChoice);
    });
}

systemColorScheme.addEventListener("change", () => {
    const preference = document.documentElement.dataset.themePreference || "system";
    if (preference === "system") {
        applyTheme("system", false);
    }
});

applyTheme(getSavedPreference(), false);
