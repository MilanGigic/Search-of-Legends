import { useMemo } from "react";

interface PaginationControlsProps {
  position: "top" | "bottom";
  currentPage: number;
  totalPages: number;
  setCurrentPage: (currentPage: number) => void;
}

export default function PaginationControls({
  position,
  currentPage,
  totalPages,
  setCurrentPage,
}: PaginationControlsProps) {
  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    const maxVisiblePages = 4;

    if (totalPages <= 1) return [1];

    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const startPage = Math.max(2, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (currentPage + maxVisiblePages < totalPages) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className={`py-4 flex justify-center items-center space-x-2`}>
      <button
        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-gray-700 hover:bg-gray-700/50 disabled:hover:bg-gray-700 transition-colors duration-100 text-white rounded disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-white">
        {pageNumbers.map((page, index) =>
          page === "..." ? (
            <span key={`${position}-${index}`} className="px-3 py-1">
              ...
            </span>
          ) : (
            <button
              key={`${position}-${index}`}
              onClick={() => setCurrentPage(Number(page))}
              className={`px-1 py-1 rounded cursor-pointer ${
                currentPage === page
                  ? "text-amber-500 font-bold"
                  : "text-gray-300 hover:text-gray-400"
              }`}
            >
              {page}
            </button>
          ),
        )}
      </span>
      <button
        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-gray-700 hover:bg-gray-700/50 disabled:hover:bg-gray-700 transition-colors duration-100 text-white rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
