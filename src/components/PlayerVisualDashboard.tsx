"use client";

type Player = Record<string, any>;

export default function PlayerVisualDashboard({ player }: { player: Player }) {
  const cards = [
    { label: "K/D", value: Number(player.kd || 0), max: 2, color: "#84cc16", detail: `${player.kills} K / ${player.deaths} D` },
    { label: "Rating S4N", value: Number(player.ratingS4N || 0), max: 2, color: "#facc15", detail: `Impact ${player.impactRating}` },
    { label: "Win Rate", value: Number(player.winrate || 0), max: 100, color: "#22c55e", suffix: "%", detail: `${player.wins || 0} W / ${player.losses || 0} L` },
    { label: "HS%", value: Number(player.hsPercent || 0), max: 100, color: "#a78bfa", suffix: "%", detail: `${player.headshots || 0} headshots` },
  ];

  const weapons = Object.entries(player.weapons || {})
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 5);

  const maxWeapon = Math.max(1, ...weapons.map(([, kills]) => Number(kills)));

  return (
    <section className="s4n-card mt-5 rounded-[1.35rem] border border-white/10 p-5">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-400">
          Panel Pro
        </p>
        <h2 className="mt-1 text-xl font-black text-white">
          Rendimiento visual
        </h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((card) => (
            <RingStat key={card.label} {...card} />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
              Entry Success
            </p>
            <p className="mt-2 text-3xl font-black text-orange-400">
              {player.openingDuelWinPercent}%
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <span
                className="block h-full rounded-full bg-orange-400"
                style={{ width: `${Math.min(100, Number(player.openingDuelWinPercent || 0))}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Mini label="Entries" value={player.entryKills} />
              <Mini label="Deaths" value={player.entryDeaths} />
              <Mini label="Ratio" value={player.entryRatio} />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
              Armas más usadas
            </p>
            <div className="mt-4 grid gap-3">
              {weapons.map(([weapon, kills]) => (
                <div key={weapon}>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="text-xs font-black uppercase text-zinc-300">
                      {weapon}
                    </span>
                    <span className="text-xs font-black text-yellow-400">
                      {Number(kills)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <span
                      className="block h-full rounded-full bg-blue-500"
                      style={{ width: `${(Number(kills) / maxWeapon) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RingStat({
  label,
  value,
  max,
  color,
  suffix = "",
  detail,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  suffix?: string;
  detail: string;
}) {
  const progress = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <div className="flex items-center gap-4">
        <div
          className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(${color} ${progress}%, rgba(255,255,255,0.08) ${progress}% 100%)`,
          }}
        >
          <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#090f18]">
            <span className="text-xl font-black text-white">
              {value}{suffix}
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
            {label}
          </p>
          <p className="mt-2 text-sm text-zinc-500">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}
