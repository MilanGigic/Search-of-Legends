"use client";
import { flexRender, Row, Table as TableProp } from "@tanstack/react-table";
import { memo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface ChampionsTableProps {
  table: TableProp<MetaChampion>;
}

// Shared grid template so header and rows always line up
const GRID_COLS = "grid-cols-[60px_1fr_100px_80px_100px_100px_100px]";

function ChampionRow({ row }: { row: Row<MetaChampion> }) {
  return (
    <div
      className={`grid ${GRID_COLS} items-center text-center hover:bg-white/15 border-t border-gray-700/70`}
    >
      {row.getVisibleCells().map((cell) => (
        <div key={cell.id} className="py-2">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </div>
      ))}
    </div>
  );
}

const MemoChampionRow = memo(ChampionRow) as typeof ChampionRow;

export default function ChampionsTable({ table }: ChampionsTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 10,
  });

  return (
    <div className="w-full text-white">
      <div className="text-center text-slate-500 text-sm py-2">
        Champions tierlist. Master+
      </div>

      {/* Header row: a normal (non-virtualized) grid row */}
      <div className={`grid ${GRID_COLS} border-b border-gray-700/70`}>
        {table.getHeaderGroups().map((hg) =>
          hg.headers.map((header) => {
            const canSort = header.column.getCanSort();
            return (
              <div
                key={header.id}
                onClick={header.column.getToggleSortingHandler()}
                className={`flex text-slate-400 font-semibold uppercase tracking-wide items-center justify-center gap-2 select-none py-2 ${
                  canSort ? "cursor-pointer" : "cursor-default"
                }`}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                {{
                  asc: "↑",
                  desc: "↓",
                }[header.column.getIsSorted() as string] ?? null}
              </div>
            );
          }),
        )}
      </div>

      {/* Virtualized scroll container for body rows only */}
      <div
        ref={parentRef}
        className="w-full overflow-auto"
        style={{ height: "1000px" }}
      >
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            position: "relative",
            width: "100%",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <div
                key={row.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="bg-gradient-to-r from-[#121624] to-[#1B1F35]"
              >
                <MemoChampionRow row={row} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
