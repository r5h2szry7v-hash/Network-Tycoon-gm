const SETTINGS_KEY = "portfolio.settings.v1";
const SETTINGS_META_KEY = "portfolio.settings.meta.v1";
let CLOUD = null;
let cloudPromise = null;

function loadCloudServices() {
  if (CLOUD) return Promise.resolve(CLOUD);
  if (cloudPromise) return cloudPromise;
  cloudPromise = Promise.all([
    import("https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js"),
    import("./cloud-save.js?v=portfolio-cloud-v1")
  ]).then(([appSdk, authSdk, storeSdk, saveSdk]) => {
    const app = appSdk.getApp();
    CLOUD = {
      AUTH: authSdk.getAuth(app),
      DB: storeSdk.getFirestore(app),
      doc: storeSdk.doc,
      getDoc: storeSdk.getDoc,
      serverTimestamp: storeSdk.serverTimestamp,
      setDoc: storeSdk.setDoc,
      onAuthStateChanged: authSdk.onAuthStateChanged,
      registerCloudSaveGame: saveSdk.registerCloudSaveGame,
      startCloudSync: saveSdk.startCloudSync
    };
    return CLOUD;
  }).catch(error => {
    cloudPromise = null;
    throw error;
  });
  return cloudPromise;
}
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
  return CLOUD.doc(CLOUD.DB, "users", uid, "settings", "portfolio");
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
    ".portfolio-shell{position:sticky;top:0;z-index:1000;isolation:isolate;display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:48px;padding:6px 12px;background:color-mix(in srgb,Canvas 94%,transparent);color:CanvasText;border-bottom:1px solid color-mix(in srgb,CanvasText 12%,transparent);font:600 calc(14px * var(--portfolio-text-scale,1))/1.2 system-ui,sans-serif;backdrop-filter:blur(14px)}",
    ".portfolio-shell__brand{display:flex;align-items:center;gap:9px;min-width:0}.portfolio-shell__home{display:grid;place-items:center;flex:none;width:32px;height:32px;border:1px solid color-mix(in srgb,CanvasText 14%,transparent);border-radius:11px;background:color-mix(in srgb,#70c9a2 16%,Canvas);color:CanvasText;text-decoration:none;transition:transform .16s,background .16s}.portfolio-shell__home:hover{transform:translateY(-1px);background:color-mix(in srgb,#70c9a2 28%,Canvas)}.portfolio-shell__home svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.portfolio-shell__title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;opacity:.78;font-size:.92em;font-weight:750}",
    ".portfolio-shell__toggle{display:grid;place-items:center;flex:none;width:34px;height:34px;padding:0!important;border-radius:12px!important;background:color-mix(in srgb,#76bde2 18%,Canvas)!important;border-color:color-mix(in srgb,#39799a 24%,CanvasText)!important;cursor:pointer;transition:transform .16s,background .16s,box-shadow .16s}.portfolio-shell__toggle:hover{transform:rotate(12deg);background:color-mix(in srgb,#76bde2 30%,Canvas)!important;box-shadow:0 3px 10px #183d4a1c}.portfolio-shell__toggle svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.portfolio-shell__toggle[aria-expanded=true]{background:color-mix(in srgb,#70c9a2 28%,Canvas)!important}",
    ".portfolio-shell__actions{position:absolute;top:calc(100% + 7px);right:8px;z-index:1001;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:center;gap:8px;width:min(340px,calc(100vw - 16px));max-height:min(70dvh,460px);overflow:auto;padding:12px;border:1px solid color-mix(in srgb,CanvasText 14%,transparent);border-radius:17px;background:color-mix(in srgb,Canvas 96%,transparent);color:CanvasText;box-shadow:0 14px 38px #18384226;backdrop-filter:blur(18px)}.portfolio-shell__actions[hidden]{display:none}.portfolio-shell__actions:not([hidden]){animation:portfolioPanelIn .18s ease-out}@keyframes portfolioPanelIn{from{opacity:0;transform:translateY(-4px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}",
    ".portfolio-shell__setting{display:grid;gap:4px;min-width:0;font-size:.76em;font-weight:800}.portfolio-shell__setting span{opacity:.74}.portfolio-shell select,.portfolio-shell button{min-height:36px;border:1px solid color-mix(in srgb,CanvasText 18%,transparent);border-radius:10px;padding:6px 9px;background:Canvas;color:CanvasText;font:inherit}.portfolio-shell select{width:100%;min-width:0}.portfolio-shell__status{grid-column:1/-1;padding-top:2px;font-size:.76em;opacity:.72;overflow-wrap:anywhere}.portfolio-shell__game-settings{font-weight:800;white-space:nowrap}",
    ".portfolio-shell select:focus-visible,.portfolio-shell button:focus-visible,.portfolio-shell a:focus-visible{outline:3px solid #5b8def;outline-offset:2px}.portfolio-shell__actions .cloud-account-button{grid-column:1/-1;justify-self:stretch;min-height:36px;padding:8px 12px;border-radius:11px;font:800 12px/1.15 system-ui,sans-serif}",
    "html[data-portfolio-motion=reduce] *,html[data-portfolio-motion=reduce] *::before,html[data-portfolio-motion=reduce] *::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}",
    "@media(max-width:420px){.portfolio-shell{padding:6px 9px;gap:7px}.portfolio-shell__brand{gap:7px}.portfolio-shell__title{max-width:calc(100vw - 104px);font-size:.86em}.portfolio-shell__actions{right:7px;padding:10px;gap:7px}}",
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
  const snap = await CLOUD.getDoc(ref);
  if (!snap.exists()) {
    if (local.exists) {
      await CLOUD.setDoc(ref, { schemaVersion: 1, settings: local.settings, updatedAtMs: local.updatedAtMs || Date.now(), updatedAt: CLOUD.serverTimestamp() });
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
    await CLOUD.setDoc(ref, { schemaVersion: 1, settings: local.settings, updatedAtMs: local.updatedAtMs, updatedAt: CLOUD.serverTimestamp() });
    publish(local.settings);
  }
}

export async function mountPortfolioShell(options = {}) {
  const gameId = String(options.gameId || "");
  if (!/^[a-z][A-Za-z0-9-]{1,39}$/.test(gameId)) throw new Error("A valid portfolio gameId is required.");
  const host = options.mount || document.body;
  const themes = Array.isArray(options.themes) ? options.themes.filter(theme =>
    theme && /^[a-z][a-z0-9-]{0,47}$/.test(theme.id) && typeof theme.label === "string") : [];
  installStyles();

  const shell = element("header", { className: "portfolio-shell", "aria-label": "Game portfolio bar" });
  const brand = element("div", { className: "portfolio-shell__brand" });
  const home = element("a", { className: "portfolio-shell__home", href: options.homeUrl || "/", "aria-label": "Game portfolio", title: "Game portfolio" });
  home.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 10.5 12 3.8l8.5 6.7v8.2a1.4 1.4 0 0 1-1.4 1.4h-4.3v-6.3H9.2v6.3H4.9a1.4 1.4 0 0 1-1.4-1.4z"/></svg>';
  brand.append(home);
  brand.append(element("span", { className: "portfolio-shell__title" }, options.title || gameId));
  const settingsToggle = element("button", { className: "portfolio-shell__toggle", type: "button", "aria-label": "Open appearance and sync settings", "aria-expanded": "false", "aria-controls": "portfolio-shell-actions", title: "Appearance and sync settings" });
  settingsToggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z"/><path d="m19.4 13.4 1.1.8-1.6 2.8-1.3-.6a7.8 7.8 0 0 1-1.6.9l-.2 1.4h-3.3l-.2-1.4a7.8 7.8 0 0 1-1.6-.9l-1.3.6-1.6-2.8 1.1-.8a7.5 7.5 0 0 1 0-1.8l-1.1-.8 1.6-2.8 1.3.6a7.8 7.8 0 0 1 1.6-.9l.2-1.4h3.3l.2 1.4a7.8 7.8 0 0 1 1.6.9l1.3-.6 1.6 2.8-1.1.8a7.5 7.5 0 0 1 0 1.8Z"/></svg>';
  const actions = element("div", { className: "portfolio-shell__actions top-actions", id: "portfolio-shell-actions", role: "region", "aria-label": "Appearance and sync settings" });
  actions.hidden = true;

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
  shell.append(brand, settingsToggle, actions);
  host.prepend(shell);

  const setSettingsOpen = open => {
    actions.hidden = !open;
    settingsToggle.setAttribute("aria-expanded", String(open));
    settingsToggle.setAttribute("aria-label", open ? "Close appearance and sync settings" : "Open appearance and sync settings");
    settingsToggle.title = open ? "Close settings" : "Appearance and sync settings";
  };
  settingsToggle.addEventListener("click", () => setSettingsOpen(actions.hidden));
  const outsideClose = event => { if (!shell.contains(event.target)) setSettingsOpen(false); };
  const escapeClose = event => { if (event.key === "Escape" && !actions.hidden) { setSettingsOpen(false); settingsToggle.focus(); } };
  document.addEventListener("pointerdown", outsideClose);
  document.addEventListener("keydown", escapeClose);

  let current = readLocalSettings().settings;
  let disposed = false;
  let authUnsubscribe = () => {};
  let cloudConnected = false;
  let cloudConnectPromise = null;
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
    const user = CLOUD?.AUTH.currentUser || null;
    current = writeLocalSettings(next, user?.uid || null, updatedAtMs);
    publish(current);
    if (!CLOUD || !user) { status.textContent = navigator.onLine === false ? "Saved offline; sync resumes online" : "Saved on this device"; return current; }
    try {
      await CLOUD.setDoc(settingsRef(user.uid), { schemaVersion: 1, settings: current, updatedAtMs, updatedAt: CLOUD.serverTimestamp() });
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

  const connectCloud = () => {
    if (disposed || cloudConnected) return Promise.resolve();
    if (cloudConnectPromise) return cloudConnectPromise;
    cloudConnectPromise = (async () => {
      const cloud = await loadCloudServices();
      cloud.registerCloudSaveGame(gameId, options.storageKeys || [gameId]);
      await cloud.startCloudSync(gameId);
      if (disposed) return;
      cloudConnected = true;
      authUnsubscribe = cloud.onAuthStateChanged(cloud.AUTH, async user => {
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
    })().catch(error => {
      cloudConnectPromise = null;
      if (!disposed) status.textContent = navigator.onLine === false ? "Offline play ready; sync resumes online" : "Local play is ready; cloud sync is unavailable";
      console.warn("Portfolio cloud services could not start:", error);
    });
    return cloudConnectPromise;
  };
  const onlineHandler = () => { void connectCloud(); };
  window.addEventListener("online", onlineHandler);
  void connectCloud();

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
      window.removeEventListener("online", onlineHandler);
      media?.removeEventListener?.("change", mediaHandler);
      document.removeEventListener("pointerdown", outsideClose);
      document.removeEventListener("keydown", escapeClose);
      shell.remove();
    }
  };
}

