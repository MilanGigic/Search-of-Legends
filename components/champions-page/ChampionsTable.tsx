"use client";

import { flexRender, Row, Table as TableType } from "@tanstack/react-table";
import { memo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCompletedName } from "@/lib/riot";
import { useDataStore } from "@/lib/store/useConstantDataStore";

interface ChampionsTableProps {
  table: TableType<MetaChampion>;
}

// Static, literal class strings so Tailwind's compiler picks them up.
// Only ever applied to <th> — <td> width is inherited from table-fixed.
const COLUMN_WIDTH: Record<string, string> = {
  rank: "lg:w-[6%]",
  championName: "lg:w-[22%]",
  lane: "lg:w-[12%]",
  tier: "lg:w-[10%]",
  winRate: "lg:w-[12%]",
  pickRate: "lg:w-[12%]",
  gamesPlayed: "lg:w-[14%]",
};

const CARD_ROW_HEIGHT = 64;
const TABLE_ROW_HEIGHT = 48;

const tierColors: Record<string, string> = {
  S_PLUS: "text-cyan-300",
  S: "text-amber-400",
  A: "text-rose-400",
  B: "text-violet-400",
  C: "text-blue-400",
  D: "text-slate-400",
  F: "text-slate-500",
};

function tierLabel(tier: string) {
  return tier === "S_PLUS" ? "S+" : tier;
}

/* ---------------------------------------------------------------- */
/* Mobile: card row, < md                                            */
/* ---------------------------------------------------------------- */

function ChampionCardContent({
  row,
  version,
}: {
  row: Row<MetaChampion>;
  version: string;
}) {
  const champ = row.original;
  const winRate = Math.round((champ.wins / champ.gamesPlayed) * 100);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-700/70 bg-gradient-to-r from-[#121624] to-[#1B1F35] px-3 py-2">
      <span className="w-6 shrink-0 text-center text-sm font-semibold text-slate-400">
        {champ.rank}
      </span>
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-black/40">
        <Image
          src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.championImage}`}
          alt={champ.championName}
          fill
          sizes="40px"
          loading="eager"
          className="object-cover"
        />
      </div>
      <span className="min-w-0 flex-1 truncate font-semibold">
        {champ.championName}
      </span>
      <span
        className={`w-9 shrink-0 text-center font-semibold ${
          tierColors[champ.tier!] ?? "text-slate-400"
        }`}
      >
        {tierLabel(champ.tier!)}
      </span>
      <span className="w-12 shrink-0 text-right text-sm text-slate-300">
        {winRate}%
      </span>
    </div>
  );
}

const MemoChampionCardContent = memo(
  ChampionCardContent,
) as typeof ChampionCardContent;

/* ---------------------------------------------------------------- */
/* Tablet / Desktop: native <tr>, md and up                          */
/* ---------------------------------------------------------------- */

function ChampionTableRow({ row }: { row: Row<MetaChampion> }) {
  const router = useRouter();
  const { setSelectedChampion } = useDataStore();

  const navigate = () => {
    setSelectedChampion(row.original);
    router.push(
      `/champions/${getCompletedName(row.original.championName)}?role=${row.original.lane}`,
    );
  };

  return (
    <tr
      onClick={navigate}
      onKeyDown={(e) => e.key === "Enter" && navigate()}
      tabIndex={0}
      className="cursor-pointer border-t border-gray-700/70 outline-none hover:bg-white/5 focus-visible:bg-white/10 focus-visible:ring-1 focus-visible:ring-cyan-400"
    >
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className="overflow-hidden px-3 py-2 text-center lg:px-4 lg:py-3"
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}

const MemoChampionTableRow = memo(ChampionTableRow) as typeof ChampionTableRow;

/* ---------------------------------------------------------------- */
/* Main component                                                    */
/* ---------------------------------------------------------------- */

export default function ChampionsTable({ table }: ChampionsTableProps) {
  const { version } = useDataStore();
  const rows = table.getRowModel().rows;
  const headerGroups = table.getHeaderGroups();
  const columnCount = table.getVisibleFlatColumns().length;

  const cardParentRef = useRef<HTMLDivElement>(null);
  const cardVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => cardParentRef.current,
    estimateSize: () => CARD_ROW_HEIGHT,
    overscan: 8,
  });

  const tableParentRef = useRef<HTMLDivElement>(null);
  const tableVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableParentRef.current,
    estimateSize: () => TABLE_ROW_HEIGHT,
    overscan: 8,
  });

  const tableVirtualItems = tableVirtualizer.getVirtualItems();
  const paddingTop = tableVirtualItems[0]?.start ?? 0;
  const paddingBottom =
    tableVirtualizer.getTotalSize() -
    (tableVirtualItems[tableVirtualItems.length - 1]?.end ?? 0);

  return (
    <div className="w-full text-white">
      {/* ---------- Mobile card list, < 768px ---------- */}
      <div
        ref={cardParentRef}
        className="h-[70dvh] w-full overflow-y-auto md:hidden"
      >
        <div
          className="relative w-full"
          style={{ height: cardVirtualizer.getTotalSize() }}
        >
          {cardVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <Link
                key={row.id}
                href={`/champions/${getCompletedName(row.original.championName)}?role=${row.original.lane}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <MemoChampionCardContent row={row} version={version} />
              </Link>
            );
          })}
        </div>
      </div>

      {/* ---------- Tablet (md–lg) / Desktop (lg+), native table ---------- */}
      <div
        ref={tableParentRef}
        className="hidden overflow-x-auto overflow-y-auto md:block md:max-h-[70vh]"
      >
        <table className="w-full lg:table-fixed">
          <thead className="sticky top-0 bg-[#121624]">
            {headerGroups.map((hg) => (
              <tr key={hg.id} className="border-b border-gray-700/70">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`select-none px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400 lg:px-4 lg:py-3 lg:text-sm ${
                        COLUMN_WIDTH[header.column.id] ?? ""
                      } ${canSort ? "cursor-pointer" : "cursor-default"}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {sortDir === "asc"
                          ? "↑"
                          : sortDir === "desc"
                            ? "↓"
                            : null}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {paddingTop > 0 && (
              <tr aria-hidden style={{ height: paddingTop }}>
                <td colSpan={columnCount} />
              </tr>
            )}
            {tableVirtualItems.map((virtualRow) => (
              <MemoChampionTableRow
                key={rows[virtualRow.index].id}
                row={rows[virtualRow.index]}
              />
            ))}
            {paddingBottom > 0 && (
              <tr aria-hidden style={{ height: paddingBottom }}>
                <td colSpan={columnCount} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
