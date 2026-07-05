const paths = {
  upload: "M12 16V4M12 4l-4 4M12 4l4 4M5 20h14",
  match: "M4 12h4l2-6 4 12 2-6h4",
  gauge: "M12 20a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm0 0v-4m0-8 3 3",
  edit: "M4 20h4l10-10-4-4L4 16v4Zm10-12 4 4",
  target: "M12 20a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm0-4a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  bell: "M6 16v-5a6 6 0 1 1 12 0v5l2 3H4l2-3Zm5 6h2",
  graduate: "M12 4 2 9l10 5 10-5-10-5Zm-7 8v5c0 1.5 3 3 7 3s7-1.5 7-3v-5",
  briefcase: "M4 8h16v11H4V8Zm4 0V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  repeat: "M4 9a5 5 0 0 1 5-5h9M4 4v5h5M20 15a5 5 0 0 1-5 5H6M20 20v-5h-5",
  users: "M8 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5M14 20c.4-2.6 2-4.3 4.3-4.9",
};

export default function Icon({ name, className = "w-5 h-5" }) {
  const d = paths[name];
  if (!d) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
