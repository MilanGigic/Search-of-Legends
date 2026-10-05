import { ParticipantCardSkeleton } from "./ParticipantCardSkeleton";

function TeamSkeleton() {
  return (
    <div className="flex w-full flex-col items-center gap-4 lg:flex-row lg:gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="w-full">
          <ParticipantCardSkeleton />
        </div>
      ))}
    </div>
  );
}

export function LiveGameSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4 p-8">
      <div className="flex w-full justify-between">
        <TeamSkeleton />
      </div>
      <div className="flex w-full justify-between">
        <TeamSkeleton />
      </div>
    </div>
  );
}
