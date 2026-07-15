"use client";

import { useApp } from "@/lib/store";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function LocaleToggle({ className }: { className?: string }) {
  const locale = useApp((s) => s.locale);
  const setLocale = useApp((s) => s.setLocale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-accent transition-colors",
          className,
        )}
      >
        <Globe className="h-4 w-4" />
        <span className="font-semibold uppercase">{locale === "ja" ? "JP" : "EN"}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem onClick={() => setLocale("en")}>
          <span className="mr-2">🇬🇧</span> English
          {locale === "en" && <span className="ml-auto text-crimson">●</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("ja")}>
          <span className="mr-2">🇯🇵</span> 日本語
          {locale === "ja" && <span className="ml-auto text-crimson">●</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
