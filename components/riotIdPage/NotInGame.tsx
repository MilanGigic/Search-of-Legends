type Props = {
  gameName: string;
  tagLine: string;
  profileHref: string;
  checking: boolean;
  onRetry: () => void;
  variant?: "offline" | "error";
};

export default function NotInGame({
  gameName,
  tagLine,
  profileHref,
  checking,
  onRetry,
  variant = "offline",
}: Props) {
  const isError = variant === "error";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
        <svg
          viewBox="0 0 24 24"
          className="size-7 text-neutral-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2v10" />
          <path d="M18.4 6.6a9 9 0 1 1-12.8 0" />
        </svg>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">
          {isError ? (
            "Couldn't check for a live game"
          ) : (
            <>
              {gameName}
              <span className="text-neutral-400">#{tagLine}</span> is not in a
              game right now
            </>
          )}
        </h1>
        <p className="mx-auto max-w-md text-sm text-neutral-400">
          {isError
            ? "Something went wrong while contacting Riot. Try again in a moment."
            : "Live games can take a short while to show up after they start. If they just queued, check again soon."}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          disabled={checking}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/15 disabled:opacity-50"
        >
          {checking ? "Checking..." : "Check again"}
        </button>
      </div>
    </div>
  );
}
