import ScoreReadout from "./ScoreReadout";

const LINE_WIDTHS = [88, 64, 100, 46, 72, 58, 90];

export default function ScanCard({ className = "" }) {
  return (
    <div className={`scan-card ${className}`}>
      <div className="scan-card-head">
        <span className="scan-dot" />
        <span className="scan-dot" />
        <span className="scan-dot" />
        <span className="font-mono text-xs text-ink-dim ml-2">resume.pdf</span>
        <span className="ml-auto font-mono text-[10px] text-scan tracking-widest">
          SCANNING
        </span>
      </div>

      <div className="scan-card-body">
        {LINE_WIDTHS.map((w, i) => (
          <div key={i} className="scan-line-bar" style={{ width: `${w}%` }} />
        ))}
        <div className="scan-beam" />
      </div>

      <div className="scan-card-foot">
        <ScoreReadout target={92} label="ATS_MATCH" />
      </div>
    </div>
  );
}
