let colorSchemeQuery;
let colorSchemeListener;

const applyColorScheme = (preference) => {
  const dark = preference === "dark"
    || (preference === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.dataset.themePreference = preference;
};

export const applyThemePreference = (preference) => {
  if (typeof window === "undefined") return;
  const validPreference = ["light", "dark", "system"].includes(preference) ? preference : "light";

  if (colorSchemeQuery && colorSchemeListener) {
    colorSchemeQuery.removeEventListener("change", colorSchemeListener);
    colorSchemeQuery = null;
    colorSchemeListener = null;
  }

  window.localStorage.setItem("lifehub-theme-preference", validPreference);
  window.dispatchEvent(new CustomEvent("lifehub:theme-changed", { detail: validPreference }));
  applyColorScheme(validPreference);

  if (validPreference === "system") {
    colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    colorSchemeListener = () => applyColorScheme("system");
    colorSchemeQuery.addEventListener("change", colorSchemeListener);
  }
};

export const getStoredThemePreference = () => {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem("lifehub-theme-preference") || "light";
};
