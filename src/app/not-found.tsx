"use client";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-mesh px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <Logo size={48} withText={false} />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-6xl font-extrabold tracking-tight text-gradient-brand">
            404
          </h1>
          <h2 className="font-display text-xl font-bold">Page not found</h2>
          <p className="text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Button
          className="bg-brand-gradient text-white hover:opacity-90"
          onClick={() => (window.location.href = "/")}
        >
          Go home
        </Button>
      </div>
    </div>
  );
}
