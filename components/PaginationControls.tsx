"use client";

interface PaginationControlsProps {
  page: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (limit: number) => void;
  total: number;
  currentCount: number;
}

export function PaginationControls({
  page,
  pages,
  hasNext,
  hasPrev,
  onPageChange,
  itemsPerPage = 20,
  onItemsPerPageChange,
  total,
  currentCount,
}: PaginationControlsProps) {
  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = startItem + currentCount - 1;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 px-4 rounded-lg" style={{ backgroundColor: "#161B22", border: "1px solid #21262D" }}>
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: "#8B949E" }}>
          Items per page:
        </span>
        {onItemsPerPageChange && (
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-2 py-1 rounded text-xs outline-none"
            style={{
              backgroundColor: "#0D1117",
              borderColor: "#30363D",
              border: "1px solid #30363D",
              color: "#E6EDF3",
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        )}
      </div>

      <div className="text-xs" style={{ color: "#8B949E" }}>
        Showing {startItem}-{endItem} of {total}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "#0D1117",
            borderColor: "#30363D",
            color: "#8B949E",
          }}
        >
          ← Previous
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, pages) }).map((_, i) => {
            let pageNum: number;
            if (pages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= pages - 2) {
              pageNum = pages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className="px-2 py-1 rounded text-xs font-semibold transition-all"
                style={{
                  backgroundColor: pageNum === page ? "#00F0FF" : "#0D1117",
                  border: pageNum === page ? "1px solid #00F0FF" : "1px solid #30363D",
                  color: pageNum === page ? "#0D1117" : "#8B949E",
                }}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "#0D1117",
            borderColor: "#30363D",
            color: "#8B949E",
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
