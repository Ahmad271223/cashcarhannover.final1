import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { HelmetProvider } from "react-helmet-async";

// Suppress PostHog analytics errors (from Emergent platform)
const originalError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('postMessage') ||
    args[0]?.includes?.('PerformanceServerTiming') ||
    args[0]?.toString?.().includes?.('posthog')) {
    return; // Suppress PostHog errors
  }
  originalError.apply(console, args);
};

// Suppress uncaught errors from PostHog
window.addEventListener('error', (event) => {
  if (event.message?.includes?.('postMessage') ||
    event.message?.includes?.('PerformanceServerTiming') ||
    event.filename?.includes?.('posthog')) {
    event.preventDefault();
    return false;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes?.('postMessage') ||
    event.reason?.message?.includes?.('PerformanceServerTiming') ||
    event.reason?.stack?.includes?.('posthog')) {
    event.preventDefault();
    return false;
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);
