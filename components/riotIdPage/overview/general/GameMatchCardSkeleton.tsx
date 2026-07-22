export default function GameMatchCardSkeleton() {
  return (
    <div className="container animate-pulse border-b border-gray-700/30 last:border-b-0">
      {/* User vs Opponent header row */}
      <div className="bg-gradient-to-b from-[#121624] to-[#1B1F35]">
        <div className="max-w-[468px] md:max-w-[864px] mx-auto grid grid-cols-3 items-center py-1.5">
          {/* left riot id */}
          <div className="flex justify-center">
            <div className="h-3.5 w-20 md:w-28 rounded bg-gray-700/40" />
          </div>

          {/* middle: queue type + time / duration */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="h-2.5 w-14 rounded bg-gray-700/30" />
            <div className="h-3 w-24 rounded bg-gray-700/40" />
          </div>

          {/* right riot id */}
          <div className="flex justify-center">
            <div className="h-3.5 w-20 md:w-28 rounded bg-gray-700/40" />
          </div>
        </div>
      </div>

      {/* UserVsOpponent placeholder */}
      <div className="flex items-center justify-between px-3 md:px-8 py-3 gap-3">
        {/* user side: champion portrait + kda/cs */}
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 md:h-12 md:w-12 rounded-full bg-gray-700/40 shrink-0" />
          <div className="flex flex-col gap-1.5">
            <div className="h-2.5 w-16 rounded bg-gray-700/40" />
            <div className="h-2 w-10 rounded bg-gray-700/25" />
          </div>
        </div>

        <div className="h-3 w-5 rounded bg-gray-700/20 shrink-0" />

        {/* opponent side: mirrored */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end gap-1.5">
            <div className="h-2.5 w-16 rounded bg-gray-700/40" />
            <div className="h-2 w-10 rounded bg-gray-700/25" />
          </div>
          <div className="h-9 w-9 md:h-12 md:w-12 rounded-full bg-gray-700/40 shrink-0" />
        </div>
      </div>

      {/* Tab bar: General / Details / Runes */}
      <section className="flex justify-center w-full border-t border-gray-700/20">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="w-1/3 py-5 flex items-center justify-center gap-2"
          >
            <div className="h-4 w-4 rounded bg-gray-700/30" />
            <div className="hidden sm:block h-3 w-12 rounded bg-gray-700/30" />
          </div>
        ))}
      </section>

      {/* Expand / collapse toggle bar */}
      <div className="w-full h-8 bg-[#2A2A40]/40" />
    </div>
  );
}
