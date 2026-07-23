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
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold bg-background border border-border text-foreground shadow-sm transition-colors hover:bg-foreground hover:text-background outline-none",
            className,
          )}
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs uppercase">{locale === "ja" ? "JP" : "EN"}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem onClick={() => setLocale("en")}>
          <span className="mr-2 font-bold text-xs text-muted-foreground">EN</span> English
          {locale === "en" && <span className="ml-auto text-crimson">●</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("ja")}>
          <span className="mr-2 font-bold text-xs text-muted-foreground">JP</span> 日本語
          {locale === "ja" && <span className="ml-auto text-crimson">●</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
