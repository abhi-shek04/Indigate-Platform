"use client";

import { useApp } from "@/lib/store";
import { translate } from "@/lib/i18n";

export function useT() {
  const locale = useApp((s) => s.locale);
  return {
    locale,
    t: (key: string, vars?: Record<string, string | number>) =>
      translate(locale, key, vars),
    // helper to pick localized field
    pick: (en: string | null, ja: string | null) =>
      locale === "ja" && ja ? ja : en ?? ja ?? "",
  };
}

export type TFunc = ReturnType<typeof useT>["t"];
