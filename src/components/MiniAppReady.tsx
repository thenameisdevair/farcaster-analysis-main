"use client";

import { useEffect } from "react";

// We type as any so TS doesn’t complain if SDK types change
let miniSdk: any = null;

// Lazy init so it doesn’t explode during SSR
function getMiniSdk() {
  if (!miniSdk) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { MiniAppClient } = require("@farcaster/miniapp-sdk");
      miniSdk = new MiniAppClient();
    } catch (e) {
      console.warn("Mini App SDK not available (probably not inside Farcaster):", e);
    }
  }
  return miniSdk;
}

export function MiniAppReady() {
  useEffect(() => {
    const sdk = getMiniSdk();
    if (!sdk) return;

    try {
      sdk.actions.ready();
    } catch (e) {
      console.warn("Failed to call sdk.actions.ready()", e);
    }
  }, []);

  return null;
}
