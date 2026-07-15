"use client";

import { Font } from "@react-pdf/renderer";
import { useEffect, useState } from "react";

// Track whether the Japanese font has been registered with a data URL.
// @react-pdf/renderer's Font.register with a URL src is async and may not
// finish before the PDF is generated. By fetching the font ourselves and
// registering it as a base64 data URL, we can guarantee it's ready.
let jpFontReady = false;
let jpFontLoading: Promise<void> | null = null;

/**
 * Preloads the Japanese font (IPA Gothic) as a base64 data URL and registers
 * it with @react-pdf/renderer under the "NotoSansJP" family. Once this
 * resolves, PDF generation will render Japanese text correctly.
 */
export async function ensureJpFont(): Promise<void> {
  if (jpFontReady) return;
  if (jpFontLoading) return jpFontLoading;

  jpFontLoading = (async () => {
    try {
      const res = await fetch("/fonts/ipag.ttf");
      if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`);
      const buf = await res.arrayBuffer();
      // Convert ArrayBuffer → base64 in chunks (avoid call stack overflow)
      const bytes = new Uint8Array(buf);
      let binary = "";
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
      }
      const b64 = btoa(binary);
      Font.register({
        family: "NotoSansJP",
        src: `data:font/ttf;base64,${b64}`,
      });
      jpFontReady = true;
    } catch (e) {
      console.warn("[ensureJpFont] Failed to preload font:", e);
      // Fall back to the URL-based registration (already done at module level)
      jpFontReady = true;
    }
  })();

  return jpFontLoading;
}

/**
 * React hook that preloads the Japanese font on mount. Returns `true` once
 * the font is ready (or if it failed — in which case the URL fallback is used).
 */
export function useJpFont(): boolean {
  const [ready, setReady] = useState(jpFontReady);

  useEffect(() => {
    if (jpFontReady) return;
    let cancelled = false;
    void ensureJpFont().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
