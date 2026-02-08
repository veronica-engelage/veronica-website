export function MapPlaceholder({
  title,
  center,
}: {
  title: string;
  center?: { lat?: number | null; lng?: number | null };
}) {
  return (
    <div className="card overflow-hidden">
      <div className="relative h-[320px] bg-gradient-to-br from-[rgb(var(--brand)/0.15)] via-transparent to-[rgb(var(--prestige)/0.2)]">
        <div className="absolute inset-0 grid place-items-center text-sm text-muted">
          Mapbox map placeholder
        </div>
      </div>
      <div className="p-4 text-xs text-muted">
        <div className="uppercase tracking-[0.18em]">Map</div>
        <div className="mt-2">
          {title}
          {center?.lat && center?.lng ? (
            <span className="ml-2 text-muted/80">
              • {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
