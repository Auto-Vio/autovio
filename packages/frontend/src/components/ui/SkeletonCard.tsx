export default function SkeletonCard() {
  return (
    <div
      className="rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 animate-pulse"
      aria-hidden
    >
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded bg-gray-700 flex-shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 bg-gray-700 rounded w-3/4 max-w-[200px]" />
          <div className="h-3 bg-gray-800 rounded w-1/2 max-w-[120px]" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCardList({ count = 4 }: { count?: number }) {
  return (
    <ul className="space-y-2">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <SkeletonCard />
        </li>
      ))}
    </ul>
  );
}
