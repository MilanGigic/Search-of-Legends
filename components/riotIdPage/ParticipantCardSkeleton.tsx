export function ParticipantCardSkeleton() {
  return (
    <div className="relative flex h-[367px] w-full animate-pulse flex-col items-center justify-between overflow-hidden rounded-lg border border-white/10 bg-neutral-900 py-1">
      {/* Champion name (top) */}
      <div className="mt-1 h-4 w-24 rounded bg-neutral-800" />

      {/* Footer */}
      <div className="flex w-full flex-col items-center gap-1">
        {/* Spells + runes */}
        <div className="flex w-full items-center justify-between px-3">
          <div className="flex items-center gap-1">
            <div className="size-[26px] rounded-full bg-neutral-800" />
            <div className="size-[26px] rounded-full bg-neutral-800" />
          </div>
          <div className="flex items-center gap-1">
            <div className="size-[26px] scale-110 rounded-full bg-neutral-800" />
            <div className="size-[26px] scale-90 rounded-full bg-neutral-800" />
          </div>
        </div>

        {/* Player name */}
        <div className="my-2 h-6 w-32 rounded bg-neutral-800" />

        {/* Rank */}
        <div className="mb-1 flex items-center gap-2">
          <div className="size-8 rounded-full bg-neutral-800" />
          <div className="h-4 w-28 rounded bg-neutral-800" />
        </div>
      </div>
    </div>
  );
}
