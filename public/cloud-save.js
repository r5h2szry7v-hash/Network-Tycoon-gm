import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import {
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  isSignInWithEmailLink,
  linkWithRedirect,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInAnonymously,
  signInWithEmailLink,
  signInWithRedirect,
  signOut
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBhsKlogLmtsL92MvrCWV8ER4IA4hJ-pKk",
  authDomain: "network-tycoon-gm.web.app",
  projectId: "network-tycoon-gm",
  storageBucket: "network-tycoon-gm.firebasestorage.app",
  messagingSenderId: "948292690047",
  appId: "1:948292690047:web:88608b2a151682ca7f9f4a"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const gameStorage = {
  networkTycoon: [
    "network-tycoon-prototype-v2",
    "network-tycoon-appearance-v1",
    "network-tycoon-player-preferences-v1",
    "network-tycoon-player-legacy-v1"
  ],
  matchGarden: ["matchGarden"]
};
const emailKey = "firebaseCloudPendingEmail";
const pendingProviderKey = "firebaseCloudPendingProvider";
const pendingProviderSignInKey = "firebaseCloudProviderSignIn";
let gameId = null;
let activeUid = null;
let ready = false;
let suppress = false;
let dirtyDuringBoot = false;
let syncTimer = 0;
let syncQueue = Promise.resolve();
let button = null;
let modal = null;
let statusText = "";

const metaKey = id => "__firebaseCloudMeta_" + id;
const saveRef = (uid, id) => doc(db, "users", uid, "saves", id);

function parseMeta(id) {
  try { return JSON.parse(localStorage.getItem(metaKey(id)) || "null") || {}; }
  catch { return {}; }
}
function putMeta(id, value) {
  try { localStorage.setItem(metaKey(id), JSON.stringify(value)); } catch {}
}
function localPayload(id) {
  const out = {};
  for (const key of gameStorage[id] || []) {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) out[key] = value;
    } catch {}
  }
  return out;
}
function hasPayload(payload) { return Object.keys(payload || {}).length > 0; }
function equalPayload(a, b) {
  const ak = Object.keys(a || {}).sort(), bk = Object.keys(b || {}).sort();
  return ak.length === bk.length && ak.every((key, i) => key === bk[i] && a[key] === b[key]);
}
function setLocalPayload(id, payload) {
  suppress = true;
  try {
    for (const key of gameStorage[id] || []) {
      if (Object.prototype.hasOwnProperty.call(payload || {}, key)) {
        localStorage.setItem(key, String(payload[key]));
      } else {
        localStorage.removeItem(key);
      }
    }
  } finally { suppress = false; }
}
function currentPayload() { return gameId ? localPayload(gameId) : {}; }
function friendlyError(error) {
  const code = error?.code || "";
  const messages = {
    "auth/operation-not-allowed": "That sign-in method is not enabled in Firebase yet.",
    "auth/unauthorized-domain": "Add this website domain under Firebase Authentication → Settings → Authorized domains.",
    "auth/invalid-action-code": "This email sign-in link expired or was already used. Request a new link.",
    "permission-denied": "Firestore rules are not allowing this save yet.",
    "auth/email-already-in-use": "An account already uses this email. Sign in with its existing provider instead of creating another account.",
    "auth/credential-already-in-use": "This Google account is already registered. Choose Google again to sign in to that account and sync your saves.",
    "auth/account-exists-with-different-credential": "This email already belongs to an account using a different sign-in method. Use that existing method to continue."
  };
  return messages[code] || error?.message || "The cloud save could not be completed.";
}
function restoreReloadKey(uid, id) { return `__firebaseCloudRestoreReload:${id}:${uid}`; }
function clearRestoreReload(uid, id) {
  try { sessionStorage.removeItem(restoreReloadKey(uid, id)); } catch {}
}
function setStatus(message) {
  statusText = message;
  const node = modal?.querySelector("[data-cloud-status]");
  if (node) node.textContent = message;
  updateButton();
}
function updateButton() {
  if (!button) return;
  const user = auth.currentUser;
  const linked = !!user && !user.isAnonymous;
  const shortLabel = linked ? "☁ Synced" : "☁ Log in";
  if (button) {
    const label = button.querySelector("[data-cloud-label]");
    if (label) label.textContent = shortLabel;
    button.setAttribute("aria-label", linked ? "Cloud account settings" : "Log in to sync your progress across devices");
    if (statusText) button.title = statusText;
  }
  document.querySelectorAll("[data-cloud-login]").forEach(entry => {
    const label = entry.querySelector("[data-cloud-label]");
    if (label) label.textContent = linked ? "☁ Account synced" : "☁ Log in to sync";
    entry.setAttribute("aria-label", linked ? "Cloud account settings" : "Log in to sync your progress across devices");
    if (statusText) entry.title = statusText;
  });
  if (modal) {
    const name = user?.displayName || user?.email || (linked ? "Linked account" : "Guest");
    const account = modal.querySelector("[data-cloud-account]");
    if (account) account.textContent = name + (linked ? " · linked" : " · this device");
    const signout = modal.querySelector("[data-cloud-signout]");
    if (signout) signout.hidden = !linked;
  }
}
function mountStyles() {
  if (document.getElementById("firebase-cloud-styles")) return;
  const style = document.createElement("style");
  style.id = "firebase-cloud-styles";
  style.textContent = `
.cloud-account-button{border:1px solid #d6e7e1;background:#f7fffb;color:#146b62;border-radius:999px;padding:9px 13px;font:800 12px/1.15 system-ui,sans-serif;white-space:nowrap;cursor:pointer;box-shadow:0 4px 12px #123b3514;transition:transform .16s,box-shadow .16s}
.cloud-account-button:hover{transform:translateY(-1px);box-shadow:0 7px 16px #123b3520}.cloud-home-login{border:1px solid #b8ddd0!important;border-radius:999px!important;background:#effaf5!important;color:#126e61!important;padding:9px 13px!important;font:800 12px/1.15 system-ui,sans-serif!important;white-space:nowrap;box-shadow:0 4px 12px #123b3514;font-weight:900!important}.cloud-account-button:focus-visible,.cloud-home-login:focus-visible,.cloud-card button:focus-visible,.cloud-card input:focus-visible{outline:3px solid #8e7bf2;outline-offset:2px}
.cloud-overlay{position:fixed;inset:0;z-index:10000;background:#102937b8;display:grid;place-items:center;padding:18px;backdrop-filter:blur(5px);font-family:system-ui,sans-serif}
.cloud-card{width:min(100%,430px);background:#fff;border:1px solid #e1e7e9;border-radius:22px;padding:23px;box-shadow:0 25px 80px #061c2b55;color:#183847}
.cloud-card h2{font:850 24px/1.05 system-ui,sans-serif;margin:0 0 9px;letter-spacing:-.04em}
.cloud-card p{color:#627984;font-size:14px;line-height:1.5;margin:8px 0 14px}
.cloud-account-name{display:inline-flex;align-items:center;gap:7px;border-radius:99px;background:#eff8f3;color:#267665;padding:7px 11px;font-size:12px;font-weight:800;margin-bottom:7px}
.cloud-provider-list{display:grid;gap:9px;margin-top:13px}
.cloud-card button{border:1px solid #d6e1e4;background:#f7faf9;color:#203d48;border-radius:12px;padding:12px 14px;font:800 14px system-ui,sans-serif;cursor:pointer;text-align:left}
.cloud-card button:hover{background:#eef7f4;border-color:#9fcbc0}
.cloud-card .cloud-primary{background:#158777;color:white;border-color:#158777}.cloud-card .cloud-primary:hover{background:#0f766a}
.cloud-card .cloud-apple{background:#1b2730;color:#fff;border-color:#1b2730}
.cloud-card .cloud-signout{border-color:#f1d5d2;color:#99473f;background:#fff8f7;text-align:center}
.cloud-card button:disabled{opacity:.58;cursor:not-allowed}
.cloud-card .cloud-cancel{background:transparent;border-color:transparent;color:#617680;text-align:center;width:100%;margin-top:8px}
.cloud-email-field{width:100%;border:1px solid #cddadd;border-radius:11px;padding:12px;font:15px system-ui,sans-serif;margin:4px 0 2px}
.cloud-status{min-height:20px;color:#42776f;font-size:12px;line-height:1.45;margin-top:8px}
.cloud-conflict-actions{display:grid;gap:9px;margin-top:16px}
@media(max-width:650px){.cloud-account-button{padding:8px 9px;font-size:11px}.cloud-home-login{padding:8px 9px!important;font-size:11px!important}.cloud-account-button [data-cloud-long]{display:none}.cloud-card{padding:20px}.cloud-overlay{padding:12px}}
`;
  document.head.appendChild(style);
}
function ensureButton() {
  if (button || !gameId) return;
  mountStyles();
  button = gameId === "matchGarden" ? document.querySelector("[data-cloud-login]") : null;
  if (button) {
    button.classList.add("cloud-account-button");
  } else {
    button = document.createElement("button");
    button.type = "button";
    button.className = "cloud-account-button";
    button.innerHTML = '<span data-cloud-label>☁ Log in</span>';
    button.addEventListener("click", openAccountModal);
    const target = document.querySelector(".top-actions");
    if (target) target.appendChild(button);
    else {
      button.style.position = "fixed";
      button.style.right = "14px";
      button.style.bottom = "calc(14px + env(safe-area-inset-bottom))";
      button.style.zIndex = "500";
      document.body.appendChild(button);
    }
  }
  document.querySelectorAll("[data-cloud-login]").forEach(entry => {
    if (entry.dataset.cloudBound) return;
    entry.dataset.cloudBound = "true";
    entry.addEventListener("click", openAccountModal);
  });
  updateButton();
}
function showChoice(title, message, choices) {
  return new Promise(resolve => {
    mountStyles();
    const overlay = document.createElement("div");
    overlay.className = "cloud-overlay";
    overlay.innerHTML = '<section class="cloud-card" role="dialog" aria-modal="true"></section>';
    const card = overlay.firstElementChild;
    card.innerHTML = `<h2>${title}</h2><p>${message}</p><div class="cloud-conflict-actions"></div>`;
    const actions = card.querySelector(".cloud-conflict-actions");
    for (const choice of choices) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = choice.label;
      if (choice.primary) b.className = "cloud-primary";
      b.onclick = () => { overlay.remove(); resolve(choice.value); };
      actions.appendChild(b);
    }
    document.body.appendChild(overlay);
  });
}
async function writeCloud(uid, id, payload) {
  const modifiedAtMs = Date.now();
  await setDoc(saveRef(uid, id), {
    schemaVersion: 1,
    gameId: id,
    payload,
    updatedAtMs: modifiedAtMs,
    updatedAt: serverTimestamp()
  });
  putMeta(id, { ownerUid: uid, modifiedAtMs });
  clearRestoreReload(uid, id);
  setStatus("Progress synced to your account.");
}
async function restoreCloud(uid, id, payload, timestampMs) {
  const nextPayload = payload || {};
  let reloadAlreadyUsed = false;
  try { reloadAlreadyUsed = sessionStorage.getItem(restoreReloadKey(uid, id)) === "1"; } catch {}
  setLocalPayload(id, nextPayload);
  const restoredPayload = localPayload(id);
  if (!equalPayload(restoredPayload, nextPayload)) {
    setStatus("Your cloud save is safe, but this browser could not keep its device copy. Check site storage settings, then open account settings to try again.");
    return;
  }
  putMeta(id, { ownerUid: uid, modifiedAtMs: Number(timestampMs) || Date.now() });
  setStatus("Cloud progress restored.");
  if (id === gameId) {
    // The games read localStorage during startup. Reload once to apply the
    // restored save, then stop if a browser fails to retain that copy.
    if (reloadAlreadyUsed) {
      setStatus("The cloud save is safe, but this browser did not finish loading its restored copy. Check site storage settings, then reload once.");
      return;
    }
    try { sessionStorage.setItem(restoreReloadKey(uid, id), "1"); }
    catch {
      setStatus("The cloud save is safe, but this browser blocked the one-time restore reload. Check site storage settings, then reload once.");
      return;
    }
    window.location.reload();
  }
}
async function syncGameInternal(uid, id) {
  if (!uid || !id) return;
  const local = localPayload(id);
  const meta = parseMeta(id);
  const snap = await getDoc(saveRef(uid, id));
  if (!snap.exists()) {
    if (hasPayload(local)) await writeCloud(uid, id, local);
    else setStatus("Guest progress is saving on this device.");
    return;
  }
  const remote = snap.data();
  const cloud = remote?.payload && typeof remote.payload === "object" ? remote.payload : {};
  const cloudTime = Number(remote.updatedAtMs) || remote.updatedAt?.toMillis?.() || 0;
  if (!hasPayload(local)) {
    await restoreCloud(uid, id, cloud, cloudTime);
    return;
  }
  if (equalPayload(local, cloud)) {
    clearRestoreReload(uid, id);
    putMeta(id, { ownerUid: uid, modifiedAtMs: Math.max(meta.modifiedAtMs || 0, cloudTime) });
    setStatus("Progress is synced.");
    return;
  }
  if (meta.ownerUid === uid) {
    if ((meta.modifiedAtMs || 0) > cloudTime) await writeCloud(uid, id, local);
    else await restoreCloud(uid, id, cloud, cloudTime);
    return;
  }
  const useDevice = await showChoice(
    "Choose the save to keep",
    "This browser has progress, and your account also has a cloud save. Choose which version should continue on this device.",
    [
      { label: "Keep this device's progress", value: "device", primary: true },
      { label: "Use the cloud progress", value: "cloud" }
    ]
  );
  if (useDevice === "device") await writeCloud(uid, id, local);
  else await restoreCloud(uid, id, cloud, cloudTime);
}
function syncGame(uid, id) {
  const task = syncQueue.then(() => syncGameInternal(uid, id));
  syncQueue = task.catch(() => {});
  return task;
}
async function getInitialUser() {
  if (auth.currentUser) return auth.currentUser;
  return await new Promise(resolve => {
    let done = false;
    let unsubscribe = () => {};
    const finish = user => {
      if (done) return;
      done = true;
      unsubscribe();
      resolve(user);
    };
    unsubscribe = onAuthStateChanged(auth, user => finish(user), () => finish(null));
    setTimeout(() => finish(auth.currentUser), 4000);
  });
}
async function completeEmailLink() {
  if (!isSignInWithEmailLink(auth, window.location.href)) return false;
  let email = localStorage.getItem(emailKey);
  if (!email) email = window.prompt("Enter the email address where you received the sign-in link:");
  if (!email) return true;
  await signInWithEmailLink(auth, email, window.location.href);
  localStorage.removeItem(emailKey);
  history.replaceState({}, document.title, location.pathname);
  return true;
}
function installStorageWatcher() {
  const originalSet = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    originalSet.call(this, key, value);
    if (this !== localStorage || suppress || !gameId || !gameStorage[gameId].includes(String(key))) return;
    if (!ready) { dirtyDuringBoot = true; return; }
    const meta = parseMeta(gameId);
    putMeta(gameId, { ownerUid: auth.currentUser?.uid || meta.ownerUid || null, modifiedAtMs: Date.now() });
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      const user = auth.currentUser;
      if (user && gameId) writeCloud(user.uid, gameId, localPayload(gameId)).catch(error => {
        console.warn("Cloud save could not sync:", error);
        setStatus("Saved on this device. Cloud sync will retry when available.");
      });
    }, 900);
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && auth.currentUser && gameId) {
      clearTimeout(syncTimer);
      writeCloud(auth.currentUser.uid, gameId, localPayload(gameId)).catch(() => {});
    }
  });
}
function openAccountModal() {
  mountStyles();
  if (modal) modal.remove();
  const overlay = document.createElement("div");
  overlay.className = "cloud-overlay";
  overlay.innerHTML = `
    <section class="cloud-card" role="dialog" aria-modal="true" aria-labelledby="cloud-title">
      <h2 id="cloud-title">Save across devices</h2>
      <p>Guest play keeps progress on this device. Link an account to continue the same games on another device.</p>
      <div class="cloud-account-name" data-cloud-account>Guest · this device</div>
      <div class="cloud-provider-list">
        <button type="button" class="cloud-primary" data-provider="google">Continue with Google</button>
        <button type="button" class="cloud-apple" data-provider="apple" disabled aria-disabled="true" title="Apple sign-in setup is pending">Apple sign-in coming soon</button>
        <input class="cloud-email-field" type="email" inputmode="email" autocomplete="email" placeholder="Email address" aria-label="Email address">
        <button type="button" data-provider="email">Email me a sign-in link</button>
        <button type="button" class="cloud-signout" data-cloud-signout hidden>Sign out of account</button>
      </div>
      <div class="cloud-status" data-cloud-status aria-live="polite"></div>
      <button type="button" class="cloud-cancel" data-cloud-close>Close</button>
    </section>`;
  modal = overlay;
  document.body.appendChild(overlay);
  overlay.querySelector("[data-cloud-close]").onclick = () => { overlay.remove(); modal = null; };
  overlay.addEventListener("click", e => { if (e.target === overlay) { overlay.remove(); modal = null; } });
  overlay.querySelector('[data-provider="google"]').onclick = () => connectProvider("google.com");
  overlay.querySelector('[data-provider="apple"]').onclick = () => setStatus("Apple sign-in will be available when Apple Developer setup is complete.");
  overlay.querySelector('[data-provider="email"]').onclick = sendEmailLink;
  overlay.querySelector("[data-cloud-signout]").onclick = async () => {
    try {
      const signedOutName = auth.currentUser?.displayName || auth.currentUser?.email || "your account";
      await signOut(auth);
      const result = await signInAnonymously(auth);
      activeUid = result.user.uid;
      await syncGame(result.user.uid, gameId);
      setStatus(`Signed out of ${signedOutName}. You are now playing as a guest on this device.`);
      updateButton();
    } catch (error) { setStatus(friendlyError(error)); }
  };
  updateButton();
  if (statusText) setStatus(statusText);
}
async function connectProvider(id) {
  if (id !== "google.com") return;
  let current = auth.currentUser;
  if (!current) current = (await signInAnonymously(auth)).user;
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  if (current.providerData.some(p => p.providerId === id)) {
    setStatus("Google is already linked to this account.");
    return;
  }
  const signInExisting = localStorage.getItem(pendingProviderSignInKey) === id;
  localStorage.removeItem(pendingProviderSignInKey);
  localStorage.setItem(pendingProviderKey, id);
  setStatus("Opening Google sign-in securely… This page will return here when you finish.");
  try {
    if (signInExisting) await signInWithRedirect(auth, provider);
    else await linkWithRedirect(current, provider);
  } catch (error) {
    localStorage.removeItem(pendingProviderKey);
    const existingAccount = ["auth/credential-already-in-use", "auth/account-exists-with-different-credential", "auth/email-already-in-use"].includes(error.code);
    if (existingAccount && !signInExisting) {
      localStorage.setItem(pendingProviderSignInKey, id);
      setStatus("This Google account is already registered, so Firebase could not attach it to the temporary guest profile. Choose Google again to sign in to the existing account. Your device save stays here while we check which cloud save to use.");
    } else {
      setStatus(friendlyError(error));
    }
  }
}
async function sendEmailLink() {
  const input = modal?.querySelector(".cloud-email-field");
  const email = input?.value?.trim();
  if (!email) { setStatus("Enter your email address first."); input?.focus(); return; }
  try {
    localStorage.setItem(emailKey, email);
    await sendSignInLinkToEmail(auth, email, {
      url: location.origin + location.pathname,
      handleCodeInApp: true
    });
    setStatus("Check your email. Open the link on this device to carry over its guest save.");
  } catch (error) { setStatus(friendlyError(error)); }
}
async function startCloudSync(id) {
  gameId = gameStorage[id] ? id : null;
  ensureButton();
  installStorageWatcher();
  let redirectResult = null;
  let redirectError = null;
  try { redirectResult = await getRedirectResult(auth); }
  catch (error) { redirectError = error; }
  let user = await getInitialUser();
  try {
    const completedLink = await completeEmailLink();
    if (completedLink) user = await getInitialUser();
    if (!user) user = (await signInAnonymously(auth)).user;
    activeUid = user?.uid || null;
    if (user && gameId) {
      try { await syncGame(user.uid, gameId); }
      catch (error) {
        console.warn("Cloud save unavailable; local save remains active:", error);
        setStatus("Local save is active. Cloud sync needs Firebase Auth and Firestore rules.");
      }
    }
    if (redirectResult?.user) {
      localStorage.removeItem(pendingProviderKey);
      localStorage.removeItem(pendingProviderSignInKey);
      setStatus("Google sign-in complete. Your progress is syncing.");
    } else if (redirectError) {
      const pendingProvider = localStorage.getItem(pendingProviderKey);
      if (pendingProvider && ["auth/credential-already-in-use", "auth/account-exists-with-different-credential", "auth/email-already-in-use"].includes(redirectError.code)) {
        localStorage.setItem(pendingProviderSignInKey, pendingProvider);
        setStatus("This Google account is already registered, so Firebase could not attach it to the temporary guest profile. Choose Google again to sign in to the existing account. Your device save stays here while we check which cloud save to use.");
      } else {
        setStatus(friendlyError(redirectError));
      }
      localStorage.removeItem(pendingProviderKey);
    }
  } catch (error) {
    console.warn("Firebase sign-in could not start:", error);
    setStatus(friendlyError(error));
  }
  ready = true;
  if (dirtyDuringBoot && auth.currentUser && gameId) {
    dirtyDuringBoot = false;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => writeCloud(auth.currentUser.uid, gameId, localPayload(gameId))
      .catch(() => setStatus("Saved on this device. Cloud sync will retry when available.")), 500);
  }
  updateButton();
  if (redirectError) openAccountModal();
  onAuthStateChanged(auth, async next => {
    updateButton();
    if (!ready || !next || next.uid === activeUid) return;
    activeUid = next.uid;
    if (gameId) {
      try { await syncGame(next.uid, gameId); }
      catch (error) { setStatus(friendlyError(error)); }
    }
  });
  return auth.currentUser;
}
export { startCloudSync };


