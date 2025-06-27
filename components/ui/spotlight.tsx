"use client";

import { useEffect, useRef } from "react";

export default function Spotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = spotlightRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      if (!el) return;
      const { clientX: x, clientY: y } = e;
      el.style.background = `radial-gradient(
        100px circle at ${x}px ${y}px,
        rgba(255, 255, 255, 0.03),
        transparent 80%
      )`;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={spotlightRef}
      className="pointer-events-none fixed inset-0 z-50 transition-all duration-700 ease-out"
    />
  );
}
