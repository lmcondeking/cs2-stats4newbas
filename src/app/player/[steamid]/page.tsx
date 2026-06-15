import { getDashboardStats } from "@/lib/stats";
import Image from "next/image";
import Link from "next/link";
import PlayerCharts from "@/components/PlayerCharts";
import PlayerAttributeBars from "@/components/PlayerAttributeBars";
import PlayerBadges from "@/components/PlayerBadges";

type Props = {
  params: Promise<{
    steamid: string;
  }>;
};

const avatarMap: Record<string, string> = {
  "76561198810129628": "/avatars/conde.png",
  "76561199037068708": "/avatars/Ari.png",
  "76561198827102122": "/avatars/tomi.png",
  "76561199082720391": "/avatars/nico.png",
  "76561198072925518": "/avatars/ludo.png",
  "76561198051821859": "/avatars/tenedor.png",
};

const playerMeta: Record<string, { gc: number }> = {
  "76561198810129628": { gc: 8 },
  "76561199037068708": { gc: 13 },
  "76561198827102122": { gc: 14 },
  "76561199082720391": { gc: 8 },
  "76561198072925518": { gc: 8 },
  "76561198051821859": { gc: 5 },
};

function getPlayerAvatar(steamid: string) {
  return avatarMap[steamid] || "/avatars/default.png";
}

export default async function PlayerPage({ params }: Props) {
  const { steamid } = await params;

  const { ranking, matches } = getDashboardStats();

  const player = ranking.find((p) => String(p.steamid) === String(steamid));

  if (!player) {
    return (
      <main className="min-h-screen bg-[#05080d] p-10 text-white">
        <Link href="/" className="text-red-500">
          ← Volver
        </Link>

        <h1 className="mt-10 text-4xl font-black">Jugador no encontrado</h1>

        <p className="mt-4 text-zinc-400">SteamID buscado: {steamid}</p>
      </main>
    );
  }

  const gc = playerMeta[String(player.steamid)]?.gc || "-";

  const playerMatches = matches
    .filter((match) =>
      match.players.some((p) => String(p.steamid) === String(player.steamid))
    )
    .map((match, index) => {
      const matchPlayer = match.players.find(
        (p) => String(p.steamid) === String(player.steamid)
      );

      return {
        ...match,
        matchNumber: index + 1,
        player: matchPlayer,
      };
    });

  const chartData = playerMatches.map((match, index) => ({
    match: `${match.map} #${index + 1}`,
    rating: Number(match.player?.ratingS4N || 0),
    adr: Number(match.player?.adr || 0),
    kd: Number(match.player?.kd || 0),
  }));

  const recentMatches = playerMatches.slice(-14);
  const winCount = playerMatches.filter(
    (match) => match.winnerTeam && match.player?.team === match.winnerTeam
  ).length;

  return (
    <main className="min-h-screen bg-[#05080d] px-6 py-8 text-white">
      <section className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 transition hover:text-red-400"
        >
          ← Volver al ranking
        </Link>

        <section className="mt-6 overflow-hidden rounded-[1.75rem] border border-[#263241] bg-gradient-to-br from-[#111a26] via-[#080d14] to-[#05080d] shadow-2xl shadow-black/40">
          <div className="grid gap-6 p-6 md:grid-cols-[1.35fr_0.85fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-red-500">
                Perfil de jugador
              </p>

              <div className="mt-4 flex items-center gap-5">
                <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-[#334155] bg-black shadow-xl">
                  <Image
                    src={getPlayerAvatar(String(player.steamid))}
                    alt={player.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                    priority
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-violet-400 text-xs font-black text-violet-300 shadow-[0_0_10px_rgba(167,139,250,0.35)]">
                      {gc}
                    </span>

                    <h1 className="text-5xl font-black tracking-tight text-white">
                      {player.name}
                    </h1>

                    <span className="inline-flex items-center gap-2 rounded-md bg-violet-600/90 px-3 py-1 text-xs font-black text-white shadow-lg shadow-violet-900/30">
                      <span className="h-2 w-2 rounded-full bg-violet-100 shadow-[0_0_8px_rgba(221,214,254,0.9)]" />
                      GC {gc}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-zinc-500">
                    SteamID: {player.steamid}
                  </p>

                  <div className="mt-3">
                    <PlayerBadges player={player} ranking={ranking} />
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-4">
                <MiniStat title="Partidas" value={player.matches} />
                <MiniStat title="Winrate" value={`${player.winrate}%`} />
                <MiniStat title="MVPs" value={player.mvps} />
                <MiniStat title="Victorias" value={winCount} />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[#263241] bg-black/50 p-5 text-center">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#9aa4b2]">
                Rating S4N
              </p>

              <p
                className={`mt-3 text-7xl font-black ${getRatingColor(
                  Number(player.ratingS4N)
                )}`}
              >
                {player.ratingS4N}
              </p>

              <p className="mt-3 text-sm text-zinc-400">
                Impact {player.impactRating} · KAST {player.kastPercent}%
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <MiniStat title="CT K/D" value={player.ctKd} />
                <MiniStat title="T K/D" value={player.tKd} />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[1.5rem] border border-[#263241] bg-[#101722] p-5">
          <div className="mb-4 flex items-center justify-between border-b border-[#263241] pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
                Resumen rápido
              </p>
              <h2 className="text-2xl font-black text-white">
                Perfil estadístico
              </h2>
            </div>

            <div className="text-right text-sm text-zinc-400">
              Últimas {recentMatches.length} partidas
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-[#9aa4b2]">
                Forma reciente
              </p>

              <div className="flex flex-wrap gap-2">
                {recentMatches.map((match) => {
                  const result =
                    match.winnerTeam && match.player?.team === match.winnerTeam
                      ? "W"
                      : "L";

                  return (
                    <span
                      key={match.demoFile}
                      className={`flex h-8 w-8 items-center justify-center rounded-md border text-xs font-black ${
                        result === "W"
                          ? "border-green-500/50 bg-green-500/15 text-green-400"
                          : "border-red-500/50 bg-red-500/15 text-red-400"
                      }`}
                      title={match.map}
                    >
                      {result}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <InfoCard
                icon="🏆"
                title="Mejor mapa"
                value={
                  player.bestMap
                    ? String(player.bestMap.map).replace("de_", "").toUpperCase()
                    : "Sin datos"
                }
                sub={
                  player.bestMap
                    ? `Rating ${player.bestMap.ratingS4N}`
                    : "Sin datos"
                }
                tone="green"
              />

              <InfoCard
                icon="💀"
                title="Peor mapa"
                value={
                  player.worstMap
                    ? String(player.worstMap.map).replace("de_", "").toUpperCase()
                    : "Sin datos"
                }
                sub={
                  player.worstMap
                    ? `Rating ${player.worstMap.ratingS4N}`
                    : "Sin datos"
                }
                tone="red"
              />

              <InfoCard
                icon="🎯"
                title="Arma favorita"
                value={
                  player.favoriteWeapon
                    ? String(player.favoriteWeapon.weapon).toUpperCase()
                    : "Sin datos"
                }
                sub={
                  player.favoriteWeapon
                    ? `${player.favoriteWeapon.kills} kills`
                    : "Sin datos"
                }
                tone="yellow"
              />
            </div>
          </div>
        </section>

        <section className="mt-6">
          <PlayerAttributeBars player={player} />
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Card title="Impact Rating" value={player.impactRating} />
          <Card title="KAST%" value={`${player.kastPercent}%`} />
          <Card title="K/D" value={player.kd} />
          <Card title="ADR" value={player.adr} />
          <Card title="HS%" value={`${player.hsPercent}%`} />
          <Card title="Diff" value={player.diff} />
          <Card title="Kills" value={player.kills} />
          <Card title="Deaths" value={player.deaths} />
          <Card title="Assists" value={player.assists} />
          <Card title="Entry Kills" value={player.entryKills} />
          <Card title="Entry Deaths" value={player.entryDeaths} />
          <Card title="Entry Ratio" value={player.entryRatio} />
          <Card
            title="Opening Duel Win%"
            value={`${player.openingDuelWinPercent}%`}
          />
          <Card title="First Kill%" value={`${player.firstKillPercent}%`} />
          <Card title="Trade Kill%" value={`${player.tradeKillPercent}%`} />
          <Card title="Trade Kills" value={player.tradeKills} />
          <Card title="Clutches" value={player.totalClutches} />
          <Card title="Bait Rounds" value={player.baitRounds} />
          <Card title="HE Damage" value={player.heDamage} />
          <Card title="Flash Assists" value={player.flashAssists} />
          <Card title="Molotov Damage" value={player.molotovDamage} />
        </div>

        <section className="mt-8 rounded-[1.5rem] border border-[#263241] bg-[#101722] p-5">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-[#9aa4b2]">
            Rendimiento por mapa
          </p>

          <div className="grid gap-3 md:grid-cols-4">
            {player.mapStats?.map((map: any) => (
              <div
                key={map.map}
                className="rounded-xl border border-[#263241] bg-black/45 p-4"
              >
                <p className="inline-flex rounded-md bg-yellow-500/15 px-2 py-1 text-xs font-black text-yellow-400">
                  {String(map.map).replace("de_", "").toUpperCase()}
                </p>

                <p className="mt-3 text-sm text-zinc-400">
                  {map.matches} partidas · WR {map.winrate}%
                </p>

                <p className="mt-2 text-xl font-black text-yellow-400">
                  {map.ratingS4N} rating
                </p>

                <p className="mt-1 text-sm text-zinc-300">
                  {map.kd} K/D · {map.adr} ADR
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-[#263241] bg-[#101722] p-5">
          <details>
            <summary className="cursor-pointer list-none">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
                    Historial
                  </p>
                  <h2 className="text-2xl font-black text-white">
                    Historial del jugador
                  </h2>
                </div>

                <span className="rounded-full border border-[#334155] bg-black px-4 py-2 text-sm font-bold text-zinc-300">
                  Abrir / cerrar
                </span>
              </div>
            </summary>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-[#151d29]">
                  <tr className="text-left text-xs uppercase tracking-widest text-[#9aa4b2]">
                    <th className="px-4 py-4">Mapa</th>
                    <th className="px-4 py-4">K</th>
                    <th className="px-4 py-4">A</th>
                    <th className="px-4 py-4">D</th>
                    <th className="px-4 py-4">ADR</th>
                    <th className="px-4 py-4">KAST</th>
                    <th className="px-4 py-4">Impact</th>
                    <th className="px-4 py-4">K/D</th>
                    <th className="px-4 py-4">HS%</th>
                    <th className="px-4 py-4">Rating</th>
                    <th className="px-4 py-4">Resultado</th>
                  </tr>
                </thead>

                <tbody>
                  {playerMatches.map((match) => {
                    const result =
                      match.winnerTeam && match.player?.team === match.winnerTeam
                        ? "WIN"
                        : "LOSS";

                    return (
                      <tr
                        key={match.demoFile}
                        className="border-t border-[#263241] text-sm text-zinc-200"
                      >
                        <td className="px-4 py-3 font-black text-red-400">
                          {match.map}
                        </td>
                        <td className="px-4 py-3">{match.player?.kills}</td>
                        <td className="px-4 py-3">{match.player?.assists}</td>
                        <td className="px-4 py-3">{match.player?.deaths}</td>
                        <td className="px-4 py-3">{match.player?.adr}</td>
                        <td className="px-4 py-3">
                          {match.player?.kastPercent}%
                        </td>
                        <td className="px-4 py-3">
                          {match.player?.impactRating}
                        </td>
                        <td className="px-4 py-3">{match.player?.kd}</td>
                        <td className="px-4 py-3">
                          {match.player?.hsPercent}%
                        </td>
                        <td className="px-4 py-3 font-black text-yellow-400">
                          {match.player?.ratingS4N}
                        </td>
                        <td
                          className={
                            result === "WIN"
                              ? "px-4 py-3 font-black text-green-400"
                              : "px-4 py-3 font-black text-red-400"
                          }
                        >
                          {result}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </details>
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-[#263241] bg-[#101722] p-5">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-red-500">
            Evolución por partida
          </p>

          <PlayerCharts data={chartData} />
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-[#263241] bg-[#101722] p-5">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-red-500">
            Kills por arma
          </p>

          <div className="grid gap-3 md:grid-cols-4">
            {Object.entries(player.weapons || {})
              .sort((a, b) => Number(b[1]) - Number(a[1]))
              .slice(0, 12)
              .map(([weapon, kills]) => (
                <div
                  key={weapon}
                  className="rounded-xl border border-[#263241] bg-black/45 p-4"
                >
                  <p className="text-xs uppercase tracking-widest text-zinc-500">
                    {weapon}
                  </p>
                  <p className="mt-2 text-2xl font-black text-yellow-400">
                    {Number(kills)}
                  </p>
                </div>
              ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-[#263241] bg-[#101722] p-4">
      <p className="text-xs uppercase tracking-wider text-zinc-500">{title}</p>
      <p className="mt-2 text-2xl font-black text-red-500">{value}</p>
    </div>
  );
}

function MiniStat({
  title,
  value,
}: {
  title: string | number;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-[#263241] bg-black/45 p-3">
      <p className="text-[11px] uppercase tracking-widest text-zinc-500">
        {title}
      </p>
      <p className="mt-1 text-lg font-black text-red-500">{value}</p>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  value,
  sub,
  tone,
}: {
  icon: string;
  title: string;
  value: string;
  sub: string;
  tone: "green" | "red" | "yellow";
}) {
  const toneClass =
    tone === "green"
      ? "border-green-500/40 bg-green-500/10 text-green-400"
      : tone === "red"
      ? "border-red-500/40 bg-red-500/10 text-red-400"
      : "border-yellow-500/40 bg-yellow-500/10 text-yellow-400";

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-widest opacity-80">
        {icon} {title}
      </p>
      <p className="mt-2 text-xl font-black">{value}</p>
      <p className="mt-1 text-xs text-zinc-300">{sub}</p>
    </div>
  );
}

function getRatingColor(rating: number) {
  if (rating >= 1.2) return "text-green-400";
  if (rating >= 1.0) return "text-yellow-400";
  return "text-red-500";
}
