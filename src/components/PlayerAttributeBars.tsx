type Props = {
  player: any;
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

export default function PlayerAttributeBars({ player }: Props) {
  const attributes = [
    { title: "Firepower", value: clamp((player.ratingS4N || 0) * 65) },
    { title: "Opening", value: clamp(player.openingDuelWinPercent || 0) },
    { title: "Trading", value: clamp((player.tradeKillPercent || 0) * 2.2) },
    { title: "Clutching", value: clamp((player.totalClutches || 0) * 12) },
    {
      title: "Utility",
      value: clamp(
        ((player.heDamage || 0) + (player.molotovDamage || 0)) / 10 +
          (player.flashAssists || 0) * 8
      ),
    },
    { title: "Consistency", value: clamp(player.kastPercent || 0) },
  ];

  return (
    <section className="rounded-[1.25rem] border border-white/10 bg-[#080d15]/75 p-4 shadow-[0_18px_45px_rgba(0,0,0,.28)] backdrop-blur-xl">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-400">
          Perfil de rendimiento
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          Índices internos de Stats4Newbas
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {attributes.map((attribute) => (
          <Bar key={attribute.title} {...attribute} />
        ))}
      </div>
    </section>
  );
}

function Bar({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-black text-zinc-200">{title}</p>
        <p className="text-xs font-black text-yellow-400">
          {Math.round(value)}/100
        </p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-400"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
