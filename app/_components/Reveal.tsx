"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
};

export function Reveal({ children, delay = 0, className = "", as = "div" }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  const style = delay ? { transitionDelay: `${delay}ms` } : undefined;
  const cls = `reveal ${visible ? "is-visible" : ""} ${className}`.trim();

  const commonProps = {
    // biome-ignore lint/suspicious/noExplicitAny: polymorphic ref
    ref: ref as unknown as React.Ref<any>,
    className: cls,
    style,
  };

  if (as === "li") return <li {...commonProps}>{children}</li>;
  if (as === "section") return <section {...commonProps}>{children}</section>;
  if (as === "article") return <article {...commonProps}>{children}</article>;
  return <div {...commonProps}>{children}</div>;
}
