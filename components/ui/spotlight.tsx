"use client";

export function Spotlight({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full bg-gradient-radial from-blue-400/70 to-transparent blur-3xl ${className}`}
      style={{ filter: "blur(150px)" }}
    />
  );
}
