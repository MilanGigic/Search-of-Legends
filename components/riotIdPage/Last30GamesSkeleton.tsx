export default function Last30GamesSkeleton() {
  return (
    <div className="bg-[#121624] border border-white/10 rounded-lg shadow-sm shadow-black/30 px-4 pt-4 pb-1">
      {/* Title — static label, not data */}
      <p className="text-center text-sm font-semibold text-gray-200 mb-2">
        Last 30 Games
      </p>

      {/* Win-rate gauge placeholder */}
      <div
        className="relative w-36 h-20 mx-auto animate-pulse"
        aria-hidden="true"
      >
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <path
            d="M20,100 A80,80 0 0 1 180,100"
            fill="none"
            stroke="currentColor"
            strokeWidth="14"
            strokeLinecap="round"
            className="text-gray-700/30"
          />
        </svg>
        <div className="absolute inset-x-0 bottom-1 flex flex-col items-center gap-1.5">
          <div className="h-5 w-12 rounded bg-gray-700/40" />
          <div className="h-2.5 w-16 rounded bg-gray-700/25" />
        </div>
      </div>

      {/* Recent champion rows */}
      <div className="divide-y divide-white/5 mt-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2.5 animate-pulse"
            aria-hidden="true"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-700/40 shrink-0" />
              <div className="flex flex-col gap-1">
                <div className="h-3 w-14 rounded bg-gray-700/40" />
                <div className="h-2 w-8 rounded bg-gray-700/25" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <div className="h-3 w-6 rounded bg-gray-700/40" />
              <div className="h-2 w-6 rounded bg-gray-700/25" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
