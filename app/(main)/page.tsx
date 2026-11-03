import { getTopFiveChampions } from "@/actions/champions/getTopFiveChampions";
import HomePage from "@/components/HomePage/HomePage";
import { fetchLatestVersion } from "@/lib/riot-server";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="flex justify-center items-center mx-auto bg-gradient-to-br from-[#121624] to-[#1B1F35]/20">
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}

async function HomeContent() {
  const [version, topFiveChampions] = await Promise.all([
    fetchLatestVersion(),
    getTopFiveChampions(),
  ]);
  return <HomePage champions={topFiveChampions} version={version} />;
}

// ---------- Loading skeleton ----------
function Bone({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-slate-700/40 ${className}`} />
  );
}

function HomeSkeleton() {
  return (
    <div
      className="w-full max-w-6xl px-2 pb-24"
      aria-busy="true"
      aria-label="Loading home page"
    >
      {/* Hero */}
      <section className="flex flex-col items-center gap-4 pt-12">
        <Bone className="h-12 w-24" /> {/* SoL title */}
        <Bone className="h-5 w-80 max-w-full" /> {/* tagline */}
        <Bone className="h-5 w-48" /> {/* "Such as: ..." */}
        <Bone className="mt-6 h-8 w-full max-w-md" /> {/* search input */}
      </section>

      {/* Feature cards */}
      <section className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-800/20 p-5"
          >
            <Bone className="h-5 w-36" />
            <Bone className="h-4 w-56 max-w-full" />
          </div>
        ))}
      </section>

      {/* Tables */}
      <section className="mt-10 flex flex-col items-start justify-center gap-8 lg:flex-row">
        {/* Top champions */}
        <div className="w-full lg:w-[360px]">
          <Bone className="mx-auto mb-4 h-5 w-52" />
          <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-3">
            <Bone className="h-4 w-full" /> {/* header */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="mt-3 grid grid-cols-[2.5rem_1fr_3rem_5rem_4rem] items-center gap-3"
              >
                <Bone className="h-10 w-10" />
                <Bone className="h-4 w-full" />
                <Bone className="h-4 w-full" />
                <Bone className="h-4 w-full" />
                <Bone className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="w-full lg:w-[360px]">
          <div className="mb-4 flex items-center justify-center gap-6">
            <Bone className="h-5 w-28" />
            <Bone className="h-5 w-24" /> {/* region tabs */}
          </div>
          <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-3">
            <Bone className="h-4 w-full" /> {/* header */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="mt-3 grid grid-cols-[3rem_1fr_5rem_3.5rem] items-center gap-3"
              >
                <Bone className="h-4 w-full" />
                <div className="flex items-center gap-3">
                  <Bone className="h-8 w-8 shrink-0 rounded-full" />
                  <Bone className="h-4 w-full" />
                </div>
                <Bone className="h-6 w-full" />
                <Bone className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-12 flex flex-col items-center gap-4">
        <Bone className="h-9 w-80 max-w-full" />
        <Bone className="h-9 w-96 max-w-full" />
        <Bone className="mt-4 h-5 w-56" />
      </section>
      <section className="mt-10 flex flex-col gap-3">
        <Bone className="h-6 w-96 max-w-full" />
        <Bone className="h-5 w-64" />
      </section>
    </div>
  );
}
