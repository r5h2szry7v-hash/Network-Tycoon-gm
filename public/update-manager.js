(function () {
  "use strict";

  if (!("serviceWorker" in navigator) || window.__portfolioUpdateManagerLoaded) return;
  window.__portfolioUpdateManagerLoaded = true;

  const UPDATE_URL = "/version.json";
  const WORKER_URL = "/service-worker.js";
  const POLL_MS = 30 * 60 * 1000;
  const VERSION_MESSAGE = "PORTFOLIO_GET_VERSION";
  let registration = null;
  let waitingWorker = null;
  let latestVersion = "";
  let toast = null;
  let applyRequested = false;
  let reloadStarted = false;
  let checking = false;

  function readVersion() {
    return fetch(UPDATE_URL + "?t=" + Date.now(), {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" }
    }).then(function (response) {
      if (!response.ok) throw new Error("Version check failed");
      return response.json();
    }).then(function (data) {
      return typeof data.version === "string" ? data.version : "";
    });
  }

  function workerVersion(worker) {
    return new Promise(function (resolve) {
      if (!worker || typeof MessageChannel === "undefined") return resolve("");
      const channel = new MessageChannel();
      const timeout = setTimeout(function () {
        channel.port1.close();
        resolve("");
      }, 1200);
      channel.port1.onmessage = function (event) {
        clearTimeout(timeout);
        channel.port1.close();
        resolve(event.data && typeof event.data.version === "string" ? event.data.version : "");
      };
      worker.postMessage({ type: VERSION_MESSAGE }, [channel.port2]);
    });
  }

  function addStyles() {
    if (document.getElementById("portfolio-update-styles")) return;
    const style = document.createElement("style");
    style.id = "portfolio-update-styles";
    style.textContent = [
      "#portfolio-update-toast{position:fixed;z-index:2147483000;right:max(12px,env(safe-area-inset-right));bottom:max(12px,calc(env(safe-area-inset-bottom) + 12px));display:flex;align-items:center;gap:12px;max-width:min(440px,calc(100vw - 24px));padding:10px 12px;border:1px solid color-mix(in srgb,CanvasText 18%,transparent);border-radius:14px;background:Canvas;color:CanvasText;box-shadow:0 8px 30px #0003;font:600 14px/1.3 system-ui,-apple-system,sans-serif}",
      "#portfolio-update-toast[hidden]{display:none}#portfolio-update-toast .portfolio-update-copy{min-width:0;flex:1}#portfolio-update-toast strong{display:block;font-weight:800}#portfolio-update-toast small{display:block;margin-top:2px;font-size:12px;opacity:.75}",
      "#portfolio-update-toast button{min-height:44px;min-width:100px;padding:9px 12px;border:0;border-radius:10px;background:#276b5a;color:#fff;font:800 13px/1 system-ui,-apple-system,sans-serif;cursor:pointer}#portfolio-update-toast button:focus-visible{outline:3px solid #6098ff;outline-offset:2px}#portfolio-update-toast button:disabled{opacity:.7}",
      "@media(max-width:430px){#portfolio-update-toast{left:12px;right:12px;bottom:max(12px,calc(env(safe-area-inset-bottom) + 12px));max-width:none;gap:8px;padding:8px 9px}#portfolio-update-toast button{min-width:92px;padding:8px;font-size:12px}}",
      "@media(prefers-reduced-motion:reduce){#portfolio-update-toast{scroll-behavior:auto}}"
    ].join("");
    document.head.appendChild(style);
  }

  function ensureToast() {
    if (toast || !document.body) return toast;
    addStyles();
    toast = document.createElement("aside");
    toast.id = "portfolio-update-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.hidden = true;
    const copy = document.createElement("div");
    copy.className = "portfolio-update-copy";
    const title = document.createElement("strong");
    title.textContent = "Update Available";
    const detail = document.createElement("small");
    detail.textContent = "Your progress is saved on this device.";
    copy.append(title, detail);
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Update Now";
    button.addEventListener("click", applyUpdate);
    toast.append(copy, button);
    document.body.appendChild(toast);
    return toast;
  }

  function showUpdate() {
    const node = ensureToast();
    if (node) node.hidden = false;
  }

  function hideUpdate() {
    if (toast) toast.hidden = true;
  }

  function showChecking() {
    const button = toast && toast.querySelector("button");
    if (button) {
      button.disabled = true;
      button.textContent = "Checking…";
    }
  }

  function resetButton() {
    const button = toast && toast.querySelector("button");
    if (button) {
      button.disabled = false;
      button.textContent = "Update Now";
    }
  }

  function requestActivation() {
    if (!waitingWorker) return false;
    applyRequested = true;
    waitingWorker.postMessage({ type: "PORTFOLIO_SKIP_WAITING" });
    setTimeout(function () {
      if (applyRequested && !reloadStarted && registration && registration.active) {
        workerVersion(registration.active).then(function (version) {
          if (version && version === latestVersion) reloadForUpdate();
        });
      }
    }, 1800);
    return true;
  }

  function reloadForUpdate() {
    if (!applyRequested || reloadStarted) return;
    reloadStarted = true;
    try {
      sessionStorage.setItem("portfolio.pwa.appliedVersion", latestVersion || "updated");
    } catch (_) {}
    window.dispatchEvent(new CustomEvent("portfolio:before-update"));
    window.location.reload();
  }

  function applyUpdate() {
    if (applyRequested || !registration) return;
    showChecking();
    if (waitingWorker) {
      requestActivation();
      return;
    }
    registration.update().then(function () {
      if (registration.waiting) {
        waitingWorker = registration.waiting;
        showUpdate();
        requestActivation();
      } else {
        resetButton();
        const detail = toast && toast.querySelector("small");
        if (detail) detail.textContent = "The update is still downloading. Try again in a moment.";
      }
    }).catch(resetButton);
  }

  function watchRegistration(reg) {
    registration = reg;
    if (reg.waiting && navigator.serviceWorker.controller) {
      waitingWorker = reg.waiting;
      showUpdate();
    }
    reg.addEventListener("updatefound", function () {
      const installing = reg.installing;
      if (!installing) return;
      installing.addEventListener("statechange", function () {
        if (installing.state === "installed" && navigator.serviceWorker.controller) {
          waitingWorker = reg.waiting || installing;
          showUpdate();
        }
      });
    });
    reg.addEventListener("controllerchange", function () {
      if (applyRequested) reloadForUpdate();
    });
  }

  async function checkForUpdates() {
    if (checking || !navigator.onLine || document.visibilityState === "hidden") return;
    checking = true;
    try {
      latestVersion = await readVersion();
      if (registration) {
        const activeVersion = await workerVersion(registration.active);
        if (activeVersion && latestVersion && activeVersion !== latestVersion && !registration.waiting) {
          await registration.update();
        }
      }
    } catch (_) {
      // Offline or a transient network failure: keep the current app usable.
    } finally {
      checking = false;
    }
  }

  async function start() {
    if (!document.body) return;
    try {
      registration = await navigator.serviceWorker.getRegistration("/");
      if (!registration) {
        registration = await navigator.serviceWorker.register(WORKER_URL, { scope: "/" });
      }
      watchRegistration(registration);
      await checkForUpdates();
      await registration.update().catch(function () {});
      if (registration.waiting && navigator.serviceWorker.controller) {
        waitingWorker = registration.waiting;
        showUpdate();
      }
    } catch (_) {
      // Unsupported hosting, private mode, or offline startup must not block play.
    }
    window.setInterval(checkForUpdates, POLL_MS);
  }

  window.addEventListener("online", checkForUpdates);
  window.addEventListener("pageshow", function () {
    if (document.visibilityState !== "hidden") checkForUpdates();
  });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") checkForUpdates();
  });
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
