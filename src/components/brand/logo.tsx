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
      <img
        src="/indobox-logo.png"
        alt="IndiGate logo"
        width={size}
        height={size}
        className="rounded-xl object-contain"
        style={{ width: size, height: size }}
      />
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
  
  if (color && (color.startsWith("http") || color.startsWith("/"))) {
    return (
      <img
        src={color}
        alt={name}
        width={size}
        height={size}
        className={cn("rounded-xl object-cover shrink-0", className)}
        style={{ width: size, height: size }}
      />
    );
  }

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
