type MapStat = Record<string, any>;

function cleanMap(map?: string) {
  return String(map || "sin datos").replace("de_", "").toUpperCase();
}

export default function MapPerformanceTable({ maps }: { maps: MapStat[] }) {
  const sortedMaps = [...maps].sort(
    (a, b) => Number(b.ratingS4N || 0) - Number(a.ratingS4N || 0)
  );

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#070b12]/70">
      <div className="hidden grid-cols-[145px_55px_1fr_1fr_1fr_1fr_75px] gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 md:grid">
        <span>Mapa</span>
        <span>PJ</span>
        <span>Rating</span>
        <span>K/D</span>
        <span>KAST</span>
        <span>ADR</span>
        <span>WR%</span>
      </div>

      <div className="divide-y divide-white/10">
        {sortedMaps.map((map, index) => (
          <div
            key={map.map}
            className="grid gap-3 px-3 py-3 md:grid-cols-[145px_55px_1fr_1fr_1fr_1fr_75px] md:items-center md:gap-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    index === 0
                      ? "bg-emerald-400"
                      : index === sortedMaps.length - 1
                      ? "bg-red-400"
                      : "bg-yellow-400"
                  }`}
                />
                <p className="truncate text-sm font-black text-white">{cleanMap(map.map)}</p>
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500">
                {index === 0 ? "Mejor mapa" : index === sortedMaps.length - 1 ? "A mejorar" : "Rendimiento"}
              </p>
            </div>

            <Value label="PJ" value={map.matches} />
            <BarMetric label="Rating" value={Number(map.ratingS4N || 0)} max={2} text={map.ratingS4N} color="yellow" />
            <BarMetric label="K/D" value={Number(map.kd || 0)} max={2} text={map.kd} color="blue" />
            <BarMetric label="KAST" value={Number(map.kastPercent || 0)} max={100} text={`${map.kastPercent || 0}%`} color="purple" />
            <BarMetric label="ADR" value={Number(map.adr || 0)} max={140} text={map.adr} color="green" />
            <BarMetric label="WR" value={Number(map.winrate || 0)} max={100} text={`${map.winrate}%`} color="orange" compact />
          </div>
        ))}
      </div>
    </div>
  );
}

function Value({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 md:hidden">
        {label}
      </p>
      <p className="text-sm font-black text-white">{value}</p>
    </div>
  );
}

function BarMetric({
  label,
  value,
  max,
  text,
  color,
  compact = false,
}: {
  label: string;
  value: number;
  max: number;
  text: string | number;
  color: "yellow" | "blue" | "purple" | "green" | "orange";
  compact?: boolean;
}) {
  const width = Math.min(100, (value / max) * 100);
  const colorClass = {
    yellow: "bg-yellow-400",
    blue: "bg-blue-500",
    purple: "bg-violet-500",
    green: "bg-emerald-500",
    orange: "bg-orange-400",
  }[color];

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 md:hidden">
          {label}
        </p>
        <p className="text-xs font-black text-white">{text}</p>
      </div>
      {!compact && (
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <span className={`block h-full rounded-full ${colorClass}`} style={{ width: `${width}%` }} />
        </div>
      )}
    </div>
  );
}
