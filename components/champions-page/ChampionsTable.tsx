"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import { flexRender, Table as TableProp } from "@tanstack/react-table";

interface ChampionsTableProps {
  table: TableProp<MetaChampion>;
  // gameVersion: string | null;
}

// Sorting doesn't really work
// Finish the UI so it looks nicer
// Add something on the top so the table doesn't get blocked by search

export default function ChampionsTable({
  table,
  // gameVersion,
}: ChampionsTableProps) {
  return (
    <Table className="text-white w-full">
      <TableCaption>Champions tierlist. Master+</TableCaption>
      <TableHeader className="">
        {table.getHeaderGroups().map((hg) => (
          <TableRow key={hg.id}>
            {hg.headers.map((header) => {
              const canSort = header.column.getCanSort();

              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : (
                    <div
                      className={`flex text-slate-400 font-semibold uppercase tracking-wide items-center justify-center gap-2 select-none ${
                        canSort ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{
                        asc: "↑",
                        desc: "↓",
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>

      <TableBody className="bg-gradient-to-b from-[#121624] via-[#1B1F35] to-[#121624] z-50">
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} className="text-center hover:bg-white/15">
            {row.getVisibleCells().map((cell) => {
              const value = flexRender(
                cell.column.columnDef.cell,
                cell.getContext(),
              );

              return (
                <TableCell
                  key={cell.id}
                  className="border-t border-gray-700/70 rounded-lg"
                >
                  {value}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
