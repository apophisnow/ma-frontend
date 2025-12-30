/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// TEST: Verify console logging is working
console.error("🚨 [MAIN.TS] LOADED - Console logging is working!");
console.warn("⚠️ [MAIN.TS] LOADED - Console logging is working!");
console.info("ℹ️ [MAIN.TS] LOADED - Console logging is working!");
console.log("📝 [MAIN.TS] LOADED - Console logging is working!");

// Polyfill for Safari 15 / iOS 15 (AbortSignal.timeout not supported)
if (typeof AbortSignal !== "undefined" && !AbortSignal.timeout) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (AbortSignal as any).timeout = (ms: number): AbortSignal => {
    const controller = new AbortController();
    setTimeout(
      () => controller.abort(new DOMException("TimeoutError", "TimeoutError")),
      ms,
    );
    return controller.signal;
  };
}

// Handle guest_token parameter BEFORE Vue app initialization
// This must be the very first thing that happens to prevent router from processing URL
console.error("🔍 [main.ts] Starting guest_token check");
console.error("🔍 [main.ts] Current URL:", window.location.href);
console.error("🔍 [main.ts] Search params:", window.location.search);
const urlParams = new URLSearchParams(window.location.search);
console.error(
  "🔍 [main.ts] All URL params:",
  Object.fromEntries(urlParams.entries()),
);
const guestToken = urlParams.get("guest_token");
console.error("🔍 [main.ts] guest_token value:", guestToken);
if (guestToken) {
  console.error(
    "✅ [main.ts] Found guest_token in URL, storing for auto-login",
  );
  console.error("✅ [main.ts] Token length:", guestToken.length);
  // Use the same storage key as Login.vue (ma_access_token)
  localStorage.setItem("ma_access_token", guestToken);
  console.error(
    "✅ [main.ts] Token stored, verifying:",
    localStorage.getItem("ma_access_token") ? "SUCCESS" : "FAILED",
  );
  // Clean up URL to remove the token parameter
  urlParams.delete("guest_token");
  const cleanUrl =
    window.location.pathname +
    (urlParams.toString() ? "?" + urlParams.toString() : "") +
    window.location.hash;
  console.error(
    "✅ [main.ts] Cleaning URL from",
    window.location.href,
    "to",
    cleanUrl,
  );
  window.history.replaceState({}, "", cleanUrl);
} else {
  console.error("❌ [main.ts] No guest_token found in URL");
}

// Global styles
import "@/styles/global.css";
import "@/styles/style.css";

// Components
import App from "./App.vue";

// Composables
import { createApp } from "vue";

// Plugins
import { registerPlugins } from "@/plugins";

// Install Sendspin WebSocket interceptor for authenticated connections
import { installSendspinInterceptor } from "@/plugins/sendspin-connection";
installSendspinInterceptor();
console.error("🔥 [MAIN.TS] After SendspinInterceptor install");

const app = createApp(App);
console.error("🔥 [MAIN.TS] After createApp");

registerPlugins(app);

app.mount("#app");
