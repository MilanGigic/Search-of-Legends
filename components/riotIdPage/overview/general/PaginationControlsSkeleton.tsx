export default function PaginationControlsSkeleton({
  position,
}: {
  position: "top" | "bottom";
}) {
  return (
    <div
      className="py-1 flex justify-center items-center space-x-2 animate-pulse"
      aria-hidden="true"
    >
      {/* Previous button */}
      <div className="w-16 h-7 rounded bg-gray-700/50" />

      {/* Page numbers */}
      <div className="flex items-center space-x-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`${position}-${i}`}
            className="w-4 h-5 rounded bg-gray-700/30"
          />
        ))}
      </div>

      {/* Next button */}
      <div className="w-16 h-7 rounded bg-gray-700/50" />
    </div>
  );
}
