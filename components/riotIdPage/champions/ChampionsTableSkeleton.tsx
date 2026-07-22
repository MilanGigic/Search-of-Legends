const NAME_WIDTHS = ["w-16", "w-20", "w-24", "w-16", "w-20"];

function ChampionStatsRowSkeleton({
  index = 0,
}: {
  /** Used only to vary placeholder widths so rows don't look perfectly uniform */
  index?: number;
}) {
  const nameWidth = NAME_WIDTHS[index % NAME_WIDTHS.length];
  return (
    <div
      className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] items-center px-4 py-2.5 border-b border-white/5 last:border-b-0 animate-pulse"
      aria-hidden="true"
    >
      {/* champion icon + name */}
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-full bg-gray-700/40 shrink-0" />
        <div className={`h-3 ${nameWidth} rounded bg-gray-700/40`} />
      </div>

      {/* KDA ratio + K/D/A line */}
      <div className="flex flex-col items-center gap-1">
        <div className="h-3 w-8 rounded bg-gray-700/40" />
        <div className="h-2 w-12 rounded bg-gray-700/25" />
      </div>

      {/* Games */}
      <div className="flex justify-center">
        <div className="h-3 w-6 rounded bg-gray-700/40" />
      </div>

      {/* WR percent + W/L line */}
      <div className="flex flex-col items-center gap-1">
        <div className="h-3 w-9 rounded bg-gray-700/40" />
        <div className="h-2 w-12 rounded bg-gray-700/25" />
      </div>

      {/* CS/min */}
      <div className="flex justify-center">
        <div className="h-3 w-6 rounded bg-gray-700/40" />
      </div>

      {/* DMG/min */}
      <div className="flex justify-center">
        <div className="h-3 w-10 rounded bg-gray-700/40" />
      </div>
    </div>
  );
}

export default function ChampionsTableSkeleton() {
  return (
    <div className="bg-[#121624] border border-white/10 rounded-lg shadow-sm shadow-black/30 max-w-4xl overflow-hidden mx-auto mt-8">
      {/* Header row stays static — column labels are known before data loads */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] items-center px-4 py-3 border-b border-white/10">
        <div />
        <div className="text-center text-sm font-semibold text-gray-300">
          KDA
        </div>
        <div className="flex items-center justify-center gap-1 text-sm font-semibold text-gray-300">
          <span className="text-xs">↓</span>Games
        </div>
        <div className="text-center text-sm font-semibold text-gray-300">
          WR
        </div>
        <div className="text-center text-sm font-semibold text-gray-300">
          CS/min
        </div>
        <div className="text-center text-sm font-semibold text-gray-300">
          DMG/min
        </div>
      </div>

      {/* Scrollable placeholder rows, matching the scrollbar in the reference table */}
      <div className="max-h-[600px] overflow-y-auto">
        {Array.from({ length: 9 }).map((_, i) => (
          <ChampionStatsRowSkeleton key={i} index={i} />
        ))}
      </div>
    </div>
  );
}
