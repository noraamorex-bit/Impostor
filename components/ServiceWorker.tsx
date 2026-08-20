"use client";

import { useEffect } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Registers the offline worker. Scope has to match where the app is served
 * from — "/" on Vercel, "/Impostor/" on GitHub Pages — or the worker will not
 * be allowed to control the page.
 */
export default function ServiceWorker() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") return;

    const scope = `${BASE_PATH}/`;
    navigator.serviceWorker.register(`${BASE_PATH}/sw.js`, { scope }).catch(() => {
      /* an unsupported or blocked worker just means no offline play */
    });
  }, []);

  return null;
}
