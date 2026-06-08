type Props = {
    player: any;
  };
  
  function clamp(value: number) {
    return Math.max(0, Math.min(100, value));
  }
  
  export default function PlayerAttributeBars({ player }: Props) {
    const firepower = clamp((player.ratingS4N || 0) * 65);
    const opening = clamp(player.openingDuelWinPercent || 0);
    const trading = clamp((player.tradeKillPercent || 0) * 2.2);
    const clutching = clamp((player.totalClutches || 0) * 12);
    const utility = clamp(
      ((player.heDamage || 0) + (player.molotovDamage || 0)) / 10 +
        (player.flashAssists || 0) * 8
    );
    const consistency = clamp(player.kastPercent || 0);
  
    return (
      <section className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-red-500">
              Perfil de rendimiento
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Índices internos de Stats4Newbas
            </p>
          </div>
        </div>
  
        <div className="grid gap-4 md:grid-cols-2">
          <Bar title="Firepower" value={firepower} />
          <Bar title="Opening" value={opening} />
          <Bar title="Trading" value={trading} />
          <Bar title="Clutching" value={clutching} />
          <Bar title="Utility" value={utility} />
          <Bar title="Consistency" value={consistency} />
        </div>
      </section>
    );
  }
  
  function Bar({ title, value }: { title: string; value: number }) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-black p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xl font-black text-zinc-300">{title}</p>
          <p className="font-bold text-red-500">{Math.round(value)}/100</p>
        </div>
  
        <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-red-600"
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    );
  }