"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import teemoShroom from "@/assets/icons/teemo-shroom.png";

interface Shroom {
  top: string;
  side: "left" | "right";
  rotation: number;
  id: string;
}

const generateEdgeShrooms = (count = 6): Shroom[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `shroom-${i}`,
    top: `${Math.floor(Math.random() * 90)}%`,
    side: Math.random() > 0.5 ? "left" : "right",
    rotation: Math.random() * 360,
  }));
};

export default function BackgroundShrooms() {
  const [shrooms, setShrooms] = useState<Shroom[]>([]);

  useEffect(() => {
    setShrooms(generateEdgeShrooms());
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      shrooms.forEach((shroom) => {
        const el = document.getElementById(shroom.id);
        if (el) {
          const angle = (scrollY * 0.3 + shroom.rotation) % 360;
          el.style.transform = `rotate(${angle}deg)`;
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [shrooms]);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 hidden sm:block">
      {shrooms.map((shroom) => (
        <div
          key={shroom.id}
          id={shroom.id}
          className="absolute opacity-50 transition-transform duration-300"
          style={{
            top: shroom.top,
            [shroom.side]: "0px",
            width: "100px",
            height: "100px",
            transform: `rotate(${shroom.rotation}deg)`,
          }}
        >
          <Image
            src={teemoShroom}
            alt="shroom"
            width={100}
            height={100}
            className="object-contain grayscale mix-blend-soft-light"
          />
        </div>
      ))}
    </div>
  );
}
