import { useRef } from "react";

/**
 * Wraps a button/anchor so it subtly pulls toward the cursor on hover.
 * No-ops automatically on touch devices.
 */
export default function MagneticButton({
  as: Tag = "button",
  className = "",
  children,
  ...props
}) {
  const ref = useRef(null);

  function handleMove(e) {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    ref.current.style.transform = `translate(${x * 0.22}px, ${y * 0.32}px)`;
  }

  function handleLeave() {
    if (ref.current) ref.current.style.transform = "translate(0, 0)";
  }

  return (
    <Tag
      ref={ref}
      data-cursor-hover
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      {...props}
    >
      {children}
    </Tag>
  );
}
