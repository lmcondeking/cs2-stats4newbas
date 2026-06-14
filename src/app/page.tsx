import Image from "next/image";
import Link from "next/link";
import { getDashboardStats } from "@/lib/stats";
import DemoUploader from "@/components/DemoUploader";

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

function getPlayerAvatar(steamid?: string) {
  if (!steamid) return "/avatars/default.png";
  return avatarMap[String(steamid)] || "/avatars/default.png";
}

export default function Home() {
  const { matches, ranking, mvpLeader, entryLeader, clutchLeader, baitLeader } =
    getDashboardStats();

  const totalRounds = matches.reduce((acc, match) => acc + match.rounds, 0);
  const totalKills = ranking.reduce((acc, player) => acc + player.kills, 0);
  const topPlayer = ranking[0];

  const leaderCards = [
    {
      title: "MVP Histórico",
      icon: "🏆",
      player: mvpLeader,
      stat: `${mvpLeader?.mvps || 0} MVPs`,
      border: "border-yellow-500/60",
    },
    {
      title: "Entry King",
      icon: "⚔️",
      player: entryLeader,
      stat: `${entryLeader?.entryKills || 0} entries`,
      border: "border-red-500/60",
    },
    {
      title: "Clutch King",
      icon: "👑",
      player: clutchLeader,
      stat: `${clutchLeader?.totalClutches || 0} clutches`,
      border: "border-purple-500/60",
    },
    {
      title: "Rey del Bait",
      icon: "🐀",
      player: baitLeader,
      stat: `${baitLeader?.baitRounds || 0} bait rounds`,
      border: "border-orange-500/60",
    },
  ];

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-8 text-white">
      <section className="mx-auto max-w-7xl">
        <section className="relative mb-10 overflow-hidden rounded-[2rem] border border-yellow-500/30 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-8 shadow-2xl shadow-red-950/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.25),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(234,179,8,0.18),transparent_30%)]" />

          <div className="relative grid gap-8 md:grid-cols-[1.4fr_0.8fr] md:items-center">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.35em] text-red-400">
                Temporada privada 2026
              </p>

              <h1 className="text-6xl font-black tracking-tight text-white md:text-7xl">
                CS2
                <span className="block bg-gradient-to-r from-red-500 via-yellow-400 to-red-600 bg-clip-text text-transparent">
                  Stats4Newbas
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-xl text-zinc-300">
                Estadísticas reales leídas desde demos de CS2. Ranking, perfiles,
                evolución, armas, mapas y premios internos de la liga.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-4">
                <SeasonStat title="Partidas" value={matches.length} />
                <SeasonStat title="Jugadores" value={ranking.length} />
                <SeasonStat title="Rondas" value={totalRounds} />
                <SeasonStat title="Kills" value={totalKills} />
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-800 bg-black/60 p-6 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
                Season Leader
              </p>

              {topPlayer ? (
                <Link href={`/player/${topPlayer.steamid}`}>
                  <div className="relative mx-auto mt-5 h-32 w-32 overflow-hidden rounded-full border-4 border-yellow-500 shadow-xl shadow-yellow-500/20">
                    <Image
                      src={getPlayerAvatar(topPlayer.steamid)}
                      alt={topPlayer.name}
                      fill
                      sizes="128px"
                      className="object-cover"
                      priority
                    />
                  </div>

                  <h2 className="mt-5 text-3xl font-black text-white">
                    {topPlayer.name}
                  </h2>

                  <p className="mt-3 text-6xl font-black text-yellow-400">
                    {topPlayer.ratingS4N}
                  </p>

                  <p className="mt-2 text-zinc-400">
                    K/D {topPlayer.kd} · ADR {topPlayer.adr}
                  </p>
                </Link>
              ) : (
                <p className="mt-6 text-zinc-400">Sin datos</p>
              )}
            </div>
          </div>
        </section>

        <div className="mb-12 grid gap-4 md:grid-cols-4">
          <NavButton href="#ranking" label="Ranking" active />
          <NavButton href="#especiales" label="Especiales" />
          <NavButton href="#partidas" label="Partidas" />
          <NavButton href="#subir-demo" label="Subir Demo" />
        </div>

        <section className="mb-14">
          <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">
            Podio oficial
          </p>

          <h2 className="mb-7 text-4xl font-black text-white">
            Top 3 Rating S4N
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {ranking.slice(0, 3).map((player, index) => (
              <Link
                key={player.steamid}
                href={`/player/${player.steamid}`}
                className={`group relative overflow-hidden rounded-[2rem] border bg-zinc-950 p-6 text-center shadow-2xl transition hover:-translate-y-1 ${
                  index === 0
                    ? "border-yellow-500/70 shadow-yellow-500/10"
                    : index === 1
                    ? "border-zinc-400/60 shadow-zinc-500/10"
                    : "border-orange-700/70 shadow-orange-500/10"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition group-hover:opacity-100" />

                <p className="relative mb-3 text-5xl">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                </p>

                <div className="relative mx-auto mb-5 h-28 w-28 overflow-hidden rounded-full border-4 border-red-500/70">
                  <Image
                    src={getPlayerAvatar(player.steamid)}
                    alt={player.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>

                <h3 className="relative text-2xl font-black text-white">
                  {player.name}
                </h3>

                <p className="relative mt-3 text-5xl font-black text-red-500">
                  {player.ratingS4N}
                </p>

                <div className="relative mt-5 grid grid-cols-3 gap-2 text-sm">
                  <PodioMini title="K/D" value={player.kd} />
                  <PodioMini title="ADR" value={player.adr} />
                  <PodioMini title="WR" value={`${player.winrate}%`} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="mb-16 grid gap-6 md:grid-cols-4">
          {leaderCards.map((card) => (
            <Link
              key={card.title}
              href={card.player ? `/player/${card.player.steamid}` : "#"}
              className={`rounded-[1.6rem] border ${card.border} bg-zinc-950 p-6 shadow-xl transition hover:-translate-y-1 hover:bg-zinc-900`}
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="text-3xl">{card.icon}</span>
                <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-zinc-400">
                  Leader
                </span>
              </div>

              <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-full border border-red-500">
                <Image
                  src={getPlayerAvatar(card.player?.steamid)}
                  alt={card.player?.name || "Sin datos"}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              <p className="text-sm text-zinc-400">{card.title}</p>

              <h2 className="mt-1 text-2xl font-black text-white">
                {card.player?.name || "Sin datos"}
              </h2>

              <p className="mt-3 text-lg font-black text-red-500">
                {card.stat}
              </p>
            </Link>
          ))}
        </div>

        <div className="grid gap-8">
          <section
            id="ranking"
            className="overflow-hidden rounded-[1.35rem] border border-[#263241] bg-[#101722]"
          >
            <div className="border-b border-[#263241] px-5 py-4">
              <p className="text-xs uppercase tracking-[0.35em] text-[#9aa4b2]">
                Ranking completo
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px]">
                <thead className="bg-[#151d29]">
                  <tr className="text-left text-xs uppercase tracking-widest text-[#9aa4b2]">
                    <th className="px-4 py-4">#</th>
                    <th className="px-4 py-4">Jugador ↕</th>
                    <th className="px-4 py-4 text-center">GC</th>
                    <th className="px-4 py-4 text-[#f4b83f]">Rating ↓</th>
                    <th className="px-4 py-4">PJ ↕</th>
                    <th className="px-4 py-4">WR% ↕</th>
                    <th className="px-4 py-4">K ↕</th>
                    <th className="px-4 py-4">A ↕</th>
                    <th className="px-4 py-4">D ↕</th>
                    <th className="px-4 py-4">ADR ↕</th>
                    <th className="px-4 py-4">K/D ↕</th>
                    <th className="px-4 py-4">HS% ↕</th>
                  </tr>
                </thead>

                <tbody>
                  {ranking.map((player, index) => {
                    const gc = playerMeta[String(player.steamid)]?.gc || "-";
                    const isTop = index === 0;
                    const kdGood = Number(player.kd) >= 1;
                    const rating = Number(player.ratingS4N);
                    const trend =
                      index === 0
                        ? "▲0.24"
                        : index === 1
                        ? "▼0.17"
                        : index === 3
                        ? "▲0.11"
                        : "—";

                    return (
                      <tr
                        key={player.steamid}
                        className="border-t border-[#263241] text-sm text-zinc-200 transition hover:bg-[#172131]"
                      >
                        <td className="px-4 py-4 text-zinc-400">
                          {index + 1}
                        </td>

                        <td className="px-4 py-4">
                          <Link
                            href={`/player/${player.steamid}`}
                            className="flex items-center gap-3"
                          >
                            <span className="relative h-9 w-9 overflow-hidden rounded-full border border-[#3a4655]">
                              <Image
                                src={getPlayerAvatar(player.steamid)}
                                alt={player.name}
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                            </span>

                            <span className="flex min-w-[250px] items-center gap-2">
                              <span className="text-base font-black text-white">
                                {player.name}
                              </span>

                              {isTop && (
                                <span className="rounded-full bg-orange-400 px-2 py-1 text-[10px] font-black uppercase text-black">
                                  🔥 En forma
                                </span>
                              )}

                              <span
                                className={`text-xs font-black ${
                                  trend.startsWith("▲")
                                    ? "text-green-400"
                                    : trend.startsWith("▼")
                                    ? "text-red-400"
                                    : "text-zinc-500"
                                }`}
                              >
                                {trend}
                              </span>
                            </span>
                          </Link>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center gap-2 rounded-md bg-violet-600/90 px-3 py-1 text-xs font-black text-white shadow-lg shadow-violet-900/30">
                            <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-violet-300/30">
                              <span className="h-2 w-2 rounded-full bg-violet-100 shadow-[0_0_8px_rgba(221,214,254,0.9)]" />
                            </span>
                            {gc}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1.5 text-sm font-black ${
                              rating >= 1
                                ? "bg-yellow-500/15 text-[#f4b83f]"
                                : rating >= 0.8
                                ? "bg-green-500/15 text-green-400"
                                : "bg-blue-500/15 text-blue-400"
                            }`}
                          >
                            {player.ratingS4N}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-base">{player.matches}</td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-base">{player.winrate}%</span>
                            <span className="h-2 w-16 overflow-hidden rounded-full bg-[#27313d]">
                              <span
                                className="block h-full rounded-full bg-green-500"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Number(player.winrate)
                                  )}%`,
                                }}
                              />
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-base">{player.kills}</td>
                        <td className="px-4 py-4 text-base">{player.assists}</td>
                        <td className="px-4 py-4 text-base">{player.deaths}</td>
                        <td className="px-4 py-4 text-base">{player.adr}</td>

                        <td
                          className={`px-4 py-4 text-base font-black ${
                            kdGood ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {player.kd}
                        </td>

                        <td className="px-4 py-4 text-base">
                          {player.hsPercent}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section
            id="especiales"
            className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-red-500">
              Premios internos
            </p>

            <h2 className="mb-6 text-3xl font-black text-white">
              Rankings especiales
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <SpecialRanking
                title="⚔️ Mejor Entry"
                ranking={ranking
                  .slice()
                  .sort((a, b) => b.entryKills - a.entryKills)}
                getText={(p) => `${p.entryKills}/${p.entryDeaths}`}
              />

              <SpecialRanking
                title="👑 Clutch King"
                ranking={ranking
                  .slice()
                  .sort((a, b) => b.totalClutches - a.totalClutches)}
                getText={(p) => `${p.totalClutches}`}
              />

              <SpecialRanking
                title="🐀 Rey del Bait"
                ranking={ranking
                  .slice()
                  .sort((a, b) => b.baitRounds - a.baitRounds)}
                getText={(p) => `${p.baitRounds}`}
              />

              <SpecialRanking
                title="🏆 MVP histórico"
                ranking={ranking.slice().sort((a, b) => b.mvps - a.mvps)}
                getText={(p) => `${p.mvps}`}
              />
            </div>
          </section>

          <section
            id="partidas"
            className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-red-500">
              Actividad reciente
            </p>

            <h2 className="mb-6 text-3xl font-black text-white">
              Historial de partidas
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              {matches
                .slice()
                .reverse()
                .slice(0, 8)
                .map((match) => (
                  <div
                    key={match.demoFile}
                    className="rounded-xl border border-zinc-800 bg-black p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xl font-black text-red-500">
                        {match.map}
                      </p>

                      <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-zinc-400">
                        {match.rounds} rondas
                      </span>
                    </div>

                    <p className="mt-3 text-zinc-300">
                      MVP:{" "}
                      <span className="font-bold text-white">
                        {match.mvp?.name || "Sin MVP"}
                      </span>
                    </p>

                    <p className="mt-2 text-sm text-zinc-500">
                      {match.demoFile}
                    </p>
                  </div>
                ))}
            </div>
          </section>

          <section
            id="subir-demo"
            className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-red-500">
              Base de datos
            </p>

            <h2 className="mb-4 text-3xl font-black text-white">Subir Demo</h2>

            <DemoUploader />
          </section>
        </div>
      </section>
    </main>
  );
}

function NavButton({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`rounded-xl border px-6 py-4 text-center font-bold transition ${
        active
          ? "border-red-600 bg-red-600 text-white hover:bg-red-700"
          : "border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-red-600"
      }`}
    >
      {label}
    </a>
  );
}

function SeasonStat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/50 p-4">
      <p className="text-3xl font-black text-red-500">{value}</p>
      <p className="mt-1 text-sm text-zinc-400">{title}</p>
    </div>
  );
}

function PodioMini({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black p-3">
      <p className="text-xs text-zinc-500">{title}</p>
      <p className="font-black text-zinc-200">{value}</p>
    </div>
  );
}

function SpecialRanking({
  title,
  ranking,
  getText,
}: {
  title: string;
  ranking: any[];
  getText: (player: any) => string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black p-4">
      <h3 className="mb-4 text-lg font-black text-white">{title}</h3>

      <div className="space-y-2">
        {ranking.map((p, i) => {
          const gc = playerMeta[String(p.steamid)]?.gc || "-";

          return (
            <div
              key={p.steamid}
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 hover:border-zinc-700"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black ${
                    i === 0
                      ? "bg-yellow-500 text-black"
                      : i === 1
                      ? "bg-zinc-300 text-black"
                      : i === 2
                      ? "bg-orange-600 text-white"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {i + 1}
                </div>

                <div className="relative h-7 w-7 overflow-hidden rounded-full border border-zinc-700">
                  <Image
                    src={getPlayerAvatar(p.steamid)}
                    alt={p.name}
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                </div>

                <span className="flex items-center gap-2">
                  <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full border border-violet-400 text-[9px] font-black text-violet-300">
                    {gc}
                  </span>

                  <Link
                    href={`/player/${p.steamid}`}
                    className="text-sm font-semibold text-white hover:text-red-400"
                  >
                    {p.name}
                  </Link>
                </span>
              </div>

              <span className="text-sm font-black text-yellow-400">{getText(p)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
