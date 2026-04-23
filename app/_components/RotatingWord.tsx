"use client";

import { useEffect, useState } from "react";

const DEFAULT_WORDS = [
  "erhvervsforsikring",
  "bygningsforsikring",
  "arbejdsskadeforsikring",
  "cyberforsikring",
  "produktansvarsforsikring",
  "bestyrelsesansvarsforsikring",
  "driftstabsforsikring",
  "transportforsikring",
  "entrepriseforsikring",
  "ejendomsforsikring",
  "ansvarsforsikring",
  "kollektiv ulykkesforsikring",
];

export function RotatingWord({ words = DEFAULT_WORDS, color = "var(--color-nordan-accent-soft)" }: { words?: string[]; color?: string }) {
  const [i, setI] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const startDelay = setTimeout(() => {
      const id = setInterval(() => {
        setAnimating(true);
        setTimeout(() => {
          setI((v) => (v + 1) % words.length);
          setAnimating(false);
        }, 240);
      }, 2000);
      (window as unknown as { __rotIv?: number }).__rotIv = id as unknown as number;
    }, 1000);
    return () => {
      clearTimeout(startDelay);
      const iv = (window as unknown as { __rotIv?: number }).__rotIv;
      if (iv) clearInterval(iv);
    };
  }, [words.length]);

  return (
    <span
      className="inline-block align-baseline"
      style={{
        color,
        transform: animating ? "translateY(-12px)" : "translateY(0)",
        opacity: animating ? 0 : 1,
        transition: "transform 240ms ease, opacity 240ms ease",
        whiteSpace: "nowrap",
      }}
    >
      {words[i]}
    </span>
  );
}
