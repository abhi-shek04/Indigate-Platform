import { Logo } from "@/components/brand/logo";

export default function Loading() {
  return (
    <div className="min-h-screen grid place-items-center bg-mesh">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse">
          <Logo size={48} withText={false} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand-gradient animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-brand-gradient animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-brand-gradient animate-bounce" />
        </div>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}
