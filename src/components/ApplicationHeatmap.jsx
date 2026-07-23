import { useMemo } from "react";
import { Flame, Trophy } from "lucide-react";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Level 0 = no activity, 1-4 = increasing intensity buckets.
function levelFor(count) {
  if (!count) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

const LEVEL_CLASSES = [
  "bg-ink/[0.06]",
  "bg-emerald-900/70",
  "bg-emerald-700/80",
  "bg-emerald-500/90",
  "bg-emerald-400",
];

/**
 * Builds a Sunday-aligned grid covering the last ~53 weeks, ending today.
 * Each week is a column of 7 days (Sun -> Sat), matching the standard
 * GitHub/LeetCode contribution-graph layout.
 */
function buildCalendar() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  start.setDate(start.getDate() - start.getDay()); // rewind to the Sunday on/before

  const days = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return { weeks, today };
}

function computeStreaks(counts, days, today) {
  let longest = 0;
  let run = 0;
  for (const d of days) {
    if (counts[toDateKey(d)]) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }

  let current = 0;
  const cursor = new Date(today);
  while (counts[toDateKey(cursor)]) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { longest, current };
}

export default function ApplicationHeatmap({ applications = [] }) {
  const { weeks, today, counts, totalApplications, streaks } = useMemo(() => {
    const { weeks, today } = buildCalendar();

    const counts = {};
    for (const job of applications) {
      if (!job?.appliedAt) continue;
      const key = toDateKey(new Date(job.appliedAt));
      counts[key] = (counts[key] || 0) + 1;
    }

    const allDays = weeks.flat();
    const streaks = computeStreaks(counts, allDays, today);

    return {
      weeks,
      today,
      counts,
      totalApplications: applications.length,
      streaks,
    };
  }, [applications]);

  // Figure out which week columns should carry a month label — only when
  // that week's first day rolls into a new month vs. the previous column.
  let lastMonth = -1;
  const monthLabels = weeks.map((week) => {
    const month = week[0].getMonth();
    if (month !== lastMonth) {
      lastMonth = month;
      return MONTH_LABELS[month];
    }
    return null;
  });

  return (
    <div className="bg-surface border border-line rounded-2xl p-6">
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="font-display text-lg text-ink">Application Activity</h2>
          <p className="text-xs text-ink-dim mt-1">
            {totalApplications === 0
              ? "Nothing logged yet — apply to a match to start your streak."
              : `${totalApplications} application${totalApplications === 1 ? "" : "s"} total`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Flame size={15} className="text-amber-500" />
            <span className="font-display text-lg text-ink leading-none">
              {streaks.current}
            </span>
            <span className="text-xs text-ink-dim">day streak</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy size={15} className="text-indigo-400" />
            <span className="font-display text-lg text-ink leading-none">
              {streaks.longest}
            </span>
            <span className="text-xs text-ink-dim">best</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1 min-w-max">
          {/* Month labels */}
          <div className="flex gap-[3px] pl-7">
            {weeks.map((_, i) => (
              <div key={i} className="w-[11px] text-[10px] text-ink-dim shrink-0">
                {monthLabels[i] || ""}
              </div>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {/* Day-of-week labels (Mon/Wed/Fri only, matching GitHub's style) */}
            <div className="flex flex-col gap-[3px] pr-1 shrink-0">
              {["", "Mon", "", "Wed", "", "Fri", ""].map((label, i) => (
                <div
                  key={i}
                  className="h-[11px] w-6 text-[10px] text-ink-dim leading-[11px]"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Weeks grid */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => {
                  const isFuture = day > today;
                  const key = toDateKey(day);
                  const count = counts[key] || 0;
                  const level = levelFor(count);
                  const dateLabel = day.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <div
                      key={di}
                      title={
                        isFuture
                          ? undefined
                          : `${count} application${count === 1 ? "" : "s"} on ${dateLabel}`
                      }
                      className={`w-[11px] h-[11px] rounded-[2px] ${
                        isFuture ? "opacity-0" : LEVEL_CLASSES[level]
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1.5 mt-2 pr-1">
            <span className="text-[10px] text-ink-dim">Less</span>
            {LEVEL_CLASSES.map((cls, i) => (
              <div key={i} className={`w-[11px] h-[11px] rounded-[2px] ${cls}`} />
            ))}
            <span className="text-[10px] text-ink-dim">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}