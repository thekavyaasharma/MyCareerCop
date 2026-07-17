import { useEffect, useRef, useState } from "react";

/**
 * Replaces the default cursor with a small dot + a trailing ring that
 * expands over anything marked data-cursor-hover. Disabled on touch
 * devices and when the user prefers reduced motion.
 */
export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    setActive(true);
    document.documentElement.classList.add("has-custom-cursor");

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;

    function onMove(e) {
      targetX = e.clientX;
      targetY = e.clientY;
      const t = `translate(${targetX}px, ${targetY}px)`;
      if (dotRef.current) dotRef.current.style.transform = t;
      if (ringRef.current) ringRef.current.style.transform = t;

      const hovering = e.target.closest("[data-cursor-hover]");
      if (ringRef.current) {
        ringRef.current.classList.toggle("cursor-ring-active", Boolean(hovering));
      }
    }

    window.addEventListener("mousemove", onMove);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  if (!active) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}