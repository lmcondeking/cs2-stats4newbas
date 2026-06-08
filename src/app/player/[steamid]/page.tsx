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

function getPlayerAvatar(steamid: string) {
  return avatarMap[steamid] || "/avatars/default.png";
}

export default async function PlayerPage({ params }: Props) {
  const { steamid } = await params;

  const { ranking, matches } = getDashboardStats();

  const player = ranking.find((p) => String(p.steamid) === String(steamid));

  if (!player) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <Link href="/" className="text-red-500">
          ← Volver
        </Link>

        <h1 className="mt-10 text-4xl font-black">Jugador no encontrado</h1>

        <p className="mt-4 text-zinc-400">SteamID buscado: {steamid}</p>
      </main>
    );
  }

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

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-red-500">
          ← Volver al ranking
        </Link>

        <div
          className={`mt-8 overflow-hidden rounded-3xl border ${getRatingBorder(
            Number(player.ratingS4N)
          )} bg-gradient-to-br from-zinc-950 via-black to-zinc-900`}
        >
          <div className="grid gap-8 p-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-red-500">
                Perfil de jugador
              </p>

              <div className="mt-4 flex items-center gap-5">
                <div
                  className={`relative h-24 w-24 overflow-hidden rounded-3xl border ${getRatingBorder(
                    Number(player.ratingS4N)
                  )} bg-black`}
                >
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
                  <h1 className="text-6xl font-black text-white">
                    {player.name}
                  </h1>

                  <p className="mt-2 text-zinc-400">
                    SteamID: {player.steamid}
                  </p>

                  <PlayerBadges player={player} ranking={ranking} />
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <MiniStat title="Partidas" value={player.matches} />
                <MiniStat title="Winrate" value={`${player.winrate}%`} />
                <MiniStat title="MVPs" value={player.mvps} />
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-black/60 p-6 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
                Rating S4N
              </p>

              <p
                className={`mt-4 text-7xl font-black ${getRatingColor(
                  Number(player.ratingS4N)
                )}`}
              >
                {player.ratingS4N}
              </p>

              <p className="mt-4 text-zinc-400">
                Impact {player.impactRating} · KAST {player.kastPercent}%
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <MiniStat title="CT K/D" value={player.ctKd} />
                <MiniStat title="T K/D" value={player.tKd} />
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10">
          <PlayerCharts data={chartData} />
        </section>

        <PlayerAttributeBars player={player} />

        <div className="mt-10 grid gap-6 md:grid-cols-4">
          <Card title="Impact Rating" value={player.impactRating} />
          <Card title="KAST%" value={`${player.kastPercent}%`} />
          <Card title="K/D" value={player.kd} />
          <Card title="ADR" value={player.adr} />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <Card title="HS%" value={`${player.hsPercent}%`} />
          <Card title="Diff" value={player.diff} />
          <Card title="Kills" value={player.kills} />
          <Card title="Deaths" value={player.deaths} />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <Card title="Assists" value={player.assists} />
          <Card title="Entry Kills" value={player.entryKills} />
          <Card title="Entry Deaths" value={player.entryDeaths} />
          <Card title="Entry Ratio" value={player.entryRatio} />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <Card
            title="Opening Duel Win%"
            value={`${player.openingDuelWinPercent}%`}
          />
          <Card title="First Kill%" value={`${player.firstKillPercent}%`} />
          <Card title="Trade Kill%" value={`${player.tradeKillPercent}%`} />
          <Card title="Trade Kills" value={player.tradeKills} />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <Card title="CT K/D" value={player.ctKd} />
          <Card title="T K/D" value={player.tKd} />
          <Card title="Clutches" value={player.totalClutches} />
          <Card title="Bait Rounds" value={player.baitRounds} />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <Card title="HE Damage" value={player.heDamage} />
          <Card title="Flash Assists" value={player.flashAssists} />
          <Card title="Molotov Damage" value={player.molotovDamage} />
          <Card
            title="Arma favorita"
            value={
              player.favoriteWeapon
                ? `${player.favoriteWeapon.weapon} (${player.favoriteWeapon.kills})`
                : "Sin datos"
            }
          />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card
            title="Mejor mapa"
            value={
              player.bestMap
                ? `${player.bestMap.map} (${player.bestMap.ratingS4N})`
                : "Sin datos"
            }
          />

          <Card
            title="Peor mapa"
            value={
              player.worstMap
                ? `${player.worstMap.map} (${player.worstMap.ratingS4N})`
                : "Sin datos"
            }
          />
        </div>

        <section className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-4 text-3xl font-black text-red-500">
            Historial del jugador
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-zinc-700 text-left text-zinc-400">
                  <th className="py-2">Mapa</th>
                  <th>K</th>
                  <th>A</th>
                  <th>D</th>
                  <th>ADR</th>
                  <th>KAST</th>
                  <th>Impact</th>
                  <th>K/D</th>
                  <th>HS%</th>
                  <th>Rating</th>
                  <th>Resultado</th>
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
                      className="border-b border-zinc-900"
                    >
                      <td className="py-3 font-bold text-red-500">
                        {match.map}
                      </td>
                      <td>{match.player?.kills}</td>
                      <td>{match.player?.assists}</td>
                      <td>{match.player?.deaths}</td>
                      <td>{match.player?.adr}</td>
                      <td>{match.player?.kastPercent}%</td>
                      <td>{match.player?.impactRating}</td>
                      <td>{match.player?.kd}</td>
                      <td>{match.player?.hsPercent}%</td>
                      <td>{match.player?.ratingS4N}</td>
                      <td
                        className={
                          result === "WIN"
                            ? "font-bold text-green-400"
                            : "font-bold text-red-400"
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
        </section>

        <section className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-4 text-3xl font-black text-red-500">
            Rendimiento por mapa
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-zinc-700 text-left text-zinc-400">
                  <th className="py-2">Mapa</th>
                  <th>PJ</th>
                  <th>WR</th>
                  <th>K</th>
                  <th>D</th>
                  <th>K/D</th>
                  <th>ADR</th>
                  <th>Rating</th>
                </tr>
              </thead>

              <tbody>
                {player.mapStats?.map((map: any) => (
                  <tr key={map.map} className="border-b border-zinc-900">
                    <td className="py-3 font-bold text-red-500">{map.map}</td>
                    <td>{map.matches}</td>
                    <td>{map.winrate}%</td>
                    <td>{map.kills}</td>
                    <td>{map.deaths}</td>
                    <td>{map.kd}</td>
                    <td>{map.adr}</td>
                    <td>{map.ratingS4N}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-4 text-3xl font-black text-red-500">
            Kills por arma
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(player.weapons || {})
              .sort((a, b) => Number(b[1]) - Number(a[1]))
              .slice(0, 12)
              .map(([weapon, kills]) => (
                <div
                  key={weapon}
                  className="rounded-xl border border-zinc-800 bg-black p-4"
                >
                  <p className="text-sm text-zinc-400">{weapon}</p>
                  <p className="mt-2 text-2xl font-black text-red-500">
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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
      <p className="text-sm text-zinc-400">{title}</p>
      <p className="mt-2 text-3xl font-black text-red-500">{value}</p>
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
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-xs text-zinc-500">{title}</p>
      <p className="mt-1 text-xl font-black text-red-500">{value}</p>
    </div>
  );
}

function getRatingColor(rating: number) {
  if (rating >= 1.2) return "text-green-400";
  if (rating >= 1.0) return "text-yellow-400";
  return "text-red-500";
}

function getRatingBorder(rating: number) {
  if (rating >= 1.2) return "border-green-500";
  if (rating >= 1.0) return "border-yellow-500";
  return "border-red-600";
}