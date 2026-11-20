import { getApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";
import { registerCloudSaveGame, startCloudSync } from "./cloud-save.js";

const SETTINGS_KEY = "portfolio.settings.v1";
const SETTINGS_META_KEY = "portfolio.settings.meta.v1";
const APP = getApp();
const AUTH = getAuth(APP);
const DB = getFirestore(APP);
let activeThemeTokens = new Set();

const DEFAULT_SETTINGS = {
  schemaVersion: 1,
  themeByGame: {},
  appearance: { colorMode: "system" },
  accessibility: { motion: "system", textScale: 1 }
};

function normalizeSettings(input) {
  const value = input && typeof input === "object" ? input : {};
  const appearance = value.appearance && typeof value.appearance === "object" ? value.appearance : {};
  const accessibility = value.accessibility && typeof value.accessibility === "object" ? value.accessibility : {};
  const motion = ["system", "reduce", "full"].includes(accessibility.motion) ? accessibility.motion : "system";
  const colorMode = ["system", "light", "dark"].includes(appearance.colorMode) ? appearance.colorMode : "system";
  const scale = Number(accessibility.textScale);
  const themeByGame = value.themeByGame && typeof value.themeByGame === "object" ? value.themeByGame : {};
  return {
    schemaVersion: 1,
    themeByGame: Object.fromEntries(Object.entries(themeByGame).filter(([key, theme]) =>
      /^[a-z][A-Za-z0-9-]{1,39}$/.test(key) && typeof theme === "string" && theme.length <= 48)),
    appearance: { colorMode },
    accessibility: { motion, textScale: Number.isFinite(scale) ? Math.min(1.25, Math.max(0.9, scale)) : 1 }
  };
}

function readLocalSettings() {
  try {
    const value = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
    const meta = JSON.parse(localStorage.getItem(SETTINGS_META_KEY) || "null") || {};
    return { settings: normalizeSettings(value), updatedAtMs: Number(meta.updatedAtMs) || 0, ownerUid: meta.ownerUid || null, exists: !!value };
  } catch {
    return { settings: normalizeSettings(null), updatedAtMs: 0, ownerUid: null, exists: false };
  }
}

function writeLocalSettings(settings, ownerUid, updatedAtMs) {
  const normalized = normalizeSettings(settings);
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized));
    localStorage.setItem(SETTINGS_META_KEY, JSON.stringify({ ownerUid: ownerUid || null, updatedAtMs: updatedAtMs || Date.now() }));
  } catch {}
  return normalized;
}

function settingsRef(uid) {
  return doc(DB, "users", uid, "settings", "portfolio");
}

function applySettings(settings, gameId, themes) {
  const root = document.documentElement;
  const themeList = Array.isArray(themes) ? themes : [];
  const selectedTheme = themeList.find(theme => theme.id === settings.themeByGame[gameId]) || themeList[0] || null;
  root.dataset.portfolioColorMode = settings.appearance.colorMode;
  root.style.colorScheme = settings.appearance.colorMode === "system" ? "light dark" : settings.appearance.colorMode;
  const reduce = settings.accessibility.motion === "reduce" ||
    (settings.accessibility.motion === "system" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  root.dataset.portfolioMotion = reduce ? "reduce" : "full";
  root.style.setProperty("--portfolio-text-scale", String(settings.accessibility.textScale));
  for (const name of activeThemeTokens) root.style.removeProperty(name);
  activeThemeTokens = new Set();
  if (selectedTheme) {
    root.dataset.portfolioTheme = selectedTheme.id;
    for (const [name, value] of Object.entries(selectedTheme.tokens || {})) {
      if (/^--[a-z0-9-]+$/i.test(name) && typeof value === "string" && value.length <= 80) {
        root.style.setProperty(name, value);
        activeThemeTokens.add(name);
      }
    }
  }
}

function installStyles() {
  if (document.getElementById("portfolio-shell-styles")) return;
  const style = document.createElement("style");
  style.id = "portfolio-shell-styles";
  style.textContent = [
    ".portfolio-shell{position:sticky;top:0;z-index:1000;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;background:color-mix(in srgb,Canvas 94%,transparent);color:CanvasText;border-bottom:1px solid color-mix(in srgb,CanvasText 14%,transparent);font:600 calc(14px * var(--portfolio-text-scale,1))/1.25 system-ui,sans-serif;backdrop-filter:blur(14px)}",
    ".portfolio-shell__brand{display:flex;align-items:center;gap:10px;min-width:0}.portfolio-shell__home{color:inherit;text-decoration:none;font-weight:800;white-space:nowrap}.portfolio-shell__title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;opacity:.78}",
    ".portfolio-shell__actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.portfolio-shell select,.portfolio-shell button{min-height:38px;border:1px solid color-mix(in srgb,CanvasText 20%,transparent);border-radius:10px;padding:7px 10px;background:Canvas;color:CanvasText;font:inherit}",
    ".portfolio-shell select:focus-visible,.portfolio-shell button:focus-visible,.portfolio-shell a:focus-visible{outline:3px solid #5b8def;outline-offset:2px}.portfolio-shell__setting{display:flex;align-items:center;gap:6px}.portfolio-shell__setting span{font-size:.85em}.portfolio-shell__game-settings{font-weight:800;white-space:nowrap}.portfolio-shell__status{font-size:.78em;opacity:.72;white-space:nowrap}",
    "html[data-portfolio-motion=reduce] *,html[data-portfolio-motion=reduce] *::before,html[data-portfolio-motion=reduce] *::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}",
    "@media(max-width:760px){.portfolio-shell{align-items:flex-start;flex-direction:column}.portfolio-shell__actions{justify-content:flex-start;width:100%}.portfolio-shell__setting span{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.portfolio-shell__status{margin-left:auto}}",
    "@media(prefers-reduced-motion:reduce){html:not([data-portfolio-motion=full]) *,html:not([data-portfolio-motion=full]) *::before,html:not([data-portfolio-motion=full]) *::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}"
  ].join("");
  document.head.appendChild(style);
}

function element(tag, attrs = {}, text = "") {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "className") node.className = value;
    else if (key === "value") node.value = value;
    else if (key.startsWith("aria-") || ["href", "type", "title", "role"].includes(key)) node.setAttribute(key, String(value));
  }
  if (text) node.textContent = text;
  return node;
}

async function syncSettings(uid, local, publish) {
  if (!uid) return;
  const ref = settingsRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    if (local.exists) {
      await setDoc(ref, { schemaVersion: 1, settings: local.settings, updatedAtMs: local.updatedAtMs || Date.now(), updatedAt: serverTimestamp() });
    }
    publish(local.settings);
    return;
  }
  const remote = snap.data();
  const remoteSettings = normalizeSettings(remote.settings);
  const remoteTime = Number(remote.updatedAtMs) || remote.updatedAt?.toMillis?.() || 0;
  if (!local.exists || local.ownerUid !== uid || remoteTime >= local.updatedAtMs) {
    publish(writeLocalSettings(remoteSettings, uid, remoteTime));
  } else {
    await setDoc(ref, { schemaVersion: 1, settings: local.settings, updatedAtMs: local.updatedAtMs, updatedAt: serverTimestamp() });
    publish(local.settings);
  }
}

export async function mountPortfolioShell(options = {}) {
  const gameId = String(options.gameId || "");
  if (!/^[a-z][A-Za-z0-9-]{1,39}$/.test(gameId)) throw new Error("A valid portfolio gameId is required.");
  registerCloudSaveGame(gameId, options.storageKeys || [gameId]);
  const host = options.mount || document.body;
  const themes = Array.isArray(options.themes) ? options.themes.filter(theme =>
    theme && /^[a-z][a-z0-9-]{0,47}$/.test(theme.id) && typeof theme.label === "string") : [];
  installStyles();

  const shell = element("header", { className: "portfolio-shell", "aria-label": "Game settings and account" });
  const brand = element("div", { className: "portfolio-shell__brand" });
  brand.append(element("a", { className: "portfolio-shell__home", href: options.homeUrl || "/" }, "Game portfolio"));
  brand.append(element("span", { className: "portfolio-shell__title" }, options.title || gameId));
  const actions = element("div", { className: "portfolio-shell__actions top-actions" });

  const addSelect = (caption, label, choices) => {
    const wrapper = element("label", { className: "portfolio-shell__setting" });
    wrapper.append(element("span", {}, caption));
    const select = element("select", { "aria-label": label });
    for (const [value, text] of choices) select.append(element("option", { value }, text));
    wrapper.append(select);
    actions.append(wrapper);
    return select;
  };

  let themeSelect = null, modeSelect = null, motionSelect = null, scaleSelect = null;
  if (options.inlineSettings !== false) {
    themeSelect = addSelect("Theme", "Game theme", themes.map(theme => [theme.id, theme.label]));
    modeSelect = addSelect("Color", "Color mode", [["system", "Device color mode"], ["light", "Light"], ["dark", "Dark"]]);
    motionSelect = addSelect("Motion", "Motion preference", [["system", "Device motion"], ["reduce", "Reduce motion"], ["full", "Full motion"]]);
    scaleSelect = addSelect("Text", "Text size", [["0.9", "90%"], ["1", "100%"], ["1.1", "110%"], ["1.25", "125%"]]);
  }
  const status = element("span", { className: "portfolio-shell__status", role: "status", "aria-live": "polite" }, "Device settings");
  actions.append(status);
  shell.append(brand, actions);
  host.prepend(shell);

  let current = readLocalSettings().settings;
  let disposed = false;
  const publish = next => {
    current = normalizeSettings(next);
    applySettings(current, gameId, themes);
    if (themeSelect) themeSelect.value = themes.find(theme => theme.id === current.themeByGame[gameId])?.id || themes[0]?.id || "";
    if (modeSelect) modeSelect.value = current.appearance.colorMode;
    if (motionSelect) motionSelect.value = current.accessibility.motion;
    if (scaleSelect) scaleSelect.value = String(current.accessibility.textScale);
    document.dispatchEvent(new CustomEvent("portfolio:settings", { detail: { gameId, settings: current } }));
    if (typeof options.onSettingsChange === "function") options.onSettingsChange(current);
  };

  const save = async patch => {
    const next = normalizeSettings({
      ...current,
      ...patch,
      themeByGame: { ...current.themeByGame, ...(patch.themeByGame || {}) },
      appearance: { ...current.appearance, ...(patch.appearance || {}) },
      accessibility: { ...current.accessibility, ...(patch.accessibility || {}) }
    });
    const updatedAtMs = Date.now();
    current = writeLocalSettings(next, AUTH.currentUser?.uid || null, updatedAtMs);
    publish(current);
    const user = AUTH.currentUser;
    if (!user) { status.textContent = "Saved on this device"; return current; }
    try {
      await setDoc(settingsRef(user.uid), { schemaVersion: 1, settings: current, updatedAtMs, updatedAt: serverTimestamp() });
      localStorage.setItem(SETTINGS_META_KEY, JSON.stringify({ ownerUid: user.uid, updatedAtMs }));
      status.textContent = user.isAnonymous ? "Saved to this guest session" : "Settings synced";
    } catch (error) {
      status.textContent = "Saved on this device; sync will retry when available";
      console.warn("Portfolio settings could not sync:", error);
    }
    return current;
  };

  if (themeSelect) themeSelect.addEventListener("change", () => save({ themeByGame: { [gameId]: themeSelect.value } }));
  if (modeSelect) modeSelect.addEventListener("change", () => save({ appearance: { colorMode: modeSelect.value } }));
  if (motionSelect) motionSelect.addEventListener("change", () => save({ accessibility: { motion: motionSelect.value } }));
  if (scaleSelect) scaleSelect.addEventListener("change", () => save({ accessibility: { textScale: Number(scaleSelect.value) } }));
  publish(current);

  const authUnsubscribe = onAuthStateChanged(AUTH, async user => {
    if (!user || disposed) return;
    status.textContent = "Syncing settings…";
    try {
      await syncSettings(user.uid, readLocalSettings(), publish);
      if (!disposed) status.textContent = user.isAnonymous ? "Guest settings saved" : "Settings synced";
    } catch (error) {
      if (!disposed) status.textContent = "Settings stay on this device";
      console.warn("Portfolio settings could not load:", error);
    }
  });

  startCloudSync(gameId).catch(error => {
    status.textContent = "Local play is ready; cloud sync is unavailable";
    console.warn("Portfolio account setup could not start:", error);
  });

  const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const mediaHandler = () => {
    if (current.accessibility.motion === "system") applySettings(current, gameId, themes);
  };
  media?.addEventListener?.("change", mediaHandler);

  return {
    getSettings: () => JSON.parse(JSON.stringify(current)),
    updateSettings: save,
    dispose() {
      disposed = true;
      authUnsubscribe();
      media?.removeEventListener?.("change", mediaHandler);
      shell.remove();
    }
  };
}

