import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = 32,
  withText = true,
  textClassName,
}: {
  className?: string;
  size?: number;
  withText?: boolean;
  textClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="relative grid place-items-center rounded-xl bg-brand-gradient shadow-glow-brand"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="text-white"
          style={{ width: size * 0.62, height: size * 0.62 }}
        >
          <path
            d="M3 8.5C3 6 5 4.5 12 4.5S21 6 21 8.5v1.2c0 .4-.3.7-.7.7H3.7c-.4 0-.7-.3-.7-.7V8.5Z"
            fill="currentColor"
            opacity="0.95"
          />
          <path
            d="M5.5 11v8.2c0 .4.3.7.7.7h1.6c.4 0 .7-.3.7-.7V11M15.5 11v8.2c0 .4.3.7.7.7h1.6c.4 0 .7-.3.7-.7V11"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="12" cy="14.2" r="1.4" fill="currentColor" />
        </svg>
      </div>
      {withText && (
        <span
          className={cn(
            "font-display font-extrabold tracking-tight text-[1.35rem] leading-none",
            textClassName,
          )}
        >
          Indi<span className="text-gradient-brand">Gate</span>
        </span>
      )}
    </div>
  );
}

export function CompanyAvatar({
  name,
  color,
  size = 40,
  className,
}: {
  name: string;
  color?: string | null;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const bg =
    color && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)
      ? color
      : "var(--saffron)";
  return (
    <div
      className={cn(
        "grid place-items-center rounded-xl font-bold text-white shrink-0",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: bg,
        fontSize: size * 0.36,
      }}
    >
      {initials}
    </div>
  );
}

export function CandidateAvatar({
  name,
  photoUrl,
  size = 40,
  className,
}: {
  name: string;
  photoUrl?: string | null;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        width={size}
        height={size}
        className={cn("rounded-full object-cover shrink-0", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={cn(
        "grid place-items-center rounded-full font-semibold text-white shrink-0 bg-brand-gradient",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}
