export default function ChampionStatsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-[#121624] border border-white/10 rounded-lg shadow-sm shadow-black/30 overflow-hidden">
      {/* Header — static, columns are known ahead of data */}
      <div className="grid grid-cols-[40px_1fr_1fr_1fr] items-center px-4 py-3 border-b border-white/5">
        <div />
        <div className="text-center text-sm font-semibold text-gray-300">
          KDA
        </div>
        <div className="text-center text-sm font-semibold text-gray-300">
          Games
        </div>
        <div className="text-center text-sm font-semibold text-gray-300">
          WR
        </div>
      </div>

      {/* Rows — champion identity is data, so the icon pulses too */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[40px_1fr_1fr_1fr] items-center px-4 py-2.5 border-b border-white/5 last:border-b-0 animate-pulse"
          aria-hidden="true"
        >
          <div className="h-9 w-9 rounded-full bg-gray-700/40" />
          <div className="flex flex-col items-center gap-1">
            <div className="h-3 w-8 rounded bg-gray-700/40" />
            <div className="h-2 w-12 rounded bg-gray-700/25" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-3 w-6 rounded bg-gray-700/40" />
            <div className="h-2 w-10 rounded bg-gray-700/25" />
          </div>
          <div className="flex justify-center">
            <div className="h-3 w-9 rounded bg-gray-700/40" />
          </div>
        </div>
      ))}

      {/* Footer link — static chrome, not loading */}
      <div className="text-center text-xs text-gray-500 py-2.5">
        More Champions...
      </div>
    </div>
  );
}
