import { useEffect, useState } from "react";
import { useReveal } from "../hooks/useReveal";

export default function ScoreReadout({ target = 92, label = "ATS_MATCH" }) {
  const [ref, visible] = useReveal();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(target);
      return;
    }
    const duration = 1400;
    const start = performance.now();
    let raf;
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, target]);

  return (
    <div ref={ref} className="font-mono text-xs tracking-widest flex items-baseline gap-2">
      <span className="text-ink-dim">{label}</span>
      <span className="text-2xl text-signal font-medium">{value}</span>
      <span className="text-ink-dim">/100</span>
    </div>
  );
}
