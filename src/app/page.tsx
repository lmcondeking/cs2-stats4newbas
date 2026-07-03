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

function getPlayerAvatar(steamid?: string) {
  if (!steamid) return "/avatars/default.png";
  return avatarMap[String(steamid)] || "/avatars/default.png";
}

function getPlayerGc(player: any) {
  return player?.gcLevel || "-";
}

function getTrendLabel(player: any) {
  const delta = Number(player?.formDelta || 0);
  if (Math.abs(delta) < 0.01) return "—";
  return `${delta > 0 ? "▲" : "▼"}${Math.abs(delta).toFixed(2)}`;
}

function getTrendClass(player: any) {
  const delta = Number(player?.formDelta || 0);
  if (delta > 0) return "text-green-400";
  if (delta < 0) return "text-red-400";
  return "text-zinc-500";
}

function formatMapName(map?: string) {
  if (!map) return "N/A";
  return String(map).replace("de_", "").toUpperCase();
}

export default function Home() {
  const { matches, ranking, mvpLeader, entryLeader, clutchLeader, baitLeader } =
    getDashboardStats();

  const totalRounds = matches.reduce((acc, match) => acc + match.rounds, 0);
  const totalKills = ranking.reduce((acc, player) => acc + player.kills, 0);
  const topPlayer = ranking[0];

  const latestMatches = matches.slice().reverse().slice(0, 10);

  const leaderCards = [
    {
      title: "MVP Histórico",
      subtitle: "Más veces jugador clave",
      icon: "🏆",
      player: mvpLeader,
      stat: `${mvpLeader?.mvps || 0}`,
      label: "MVPs",
      border: "border-yellow-500/45",
      accent: "text-yellow-400",
    },
    {
      title: "Entry King",
      subtitle: "Abre rondas y genera ventaja",
      icon: "⚔️",
      player: entryLeader,
      stat: `${entryLeader?.entryKills || 0}`,
      label: "entries",
      border: "border-red-500/45",
      accent: "text-red-400",
    },
    {
      title: "Clutch King",
      subtitle: "Rey de situaciones límite",
      icon: "👑",
      player: clutchLeader,
      stat: `${clutchLeader?.totalClutches || 0}`,
      label: "clutches",
      border: "border-purple-500/45",
      accent: "text-purple-400",
    },
    {
      title: "Rey del Bait",
      subtitle: "El especialista en sobrevivir",
      icon: "🐀",
      player: baitLeader,
      stat: `${baitLeader?.baitRounds || 0}`,
      label: "bait rounds",
      border: "border-orange-500/45",
      accent: "text-orange-400",
    },
  ];

  return (
    <main className="min-h-screen bg-[#060a10] px-5 py-5 text-white">
      <section className="mx-auto max-w-6xl">
        <header className="sticky top-0 z-20 -mx-5 mb-5 border-b border-[#1f2a38] bg-[#060a10]/90 px-5 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <Link href="/" className="text-2xl font-black tracking-tight">
              <span className="text-red-500">S4</span>
              <span className="text-yellow-400">N</span>
            </Link>

            <nav className="flex items-center gap-6 text-sm font-bold text-zinc-400">
              <a href="#ranking" className="border-b-2 border-yellow-400 pb-2 text-white">
                Ranking
              </a>
              <a href="#especiales" className="transition hover:text-white">
                Premios
              </a>
              <a href="#partidas" className="transition hover:text-white">
                Partidas
              </a>
              <a href="#subir-demo" className="transition hover:text-white">
                Subir Demo
              </a>
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <span className="rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-red-400">
                Temporada 2026
              </span>

              {topPlayer && (
                <div className="relative h-9 w-9 overflow-hidden rounded-full border border-yellow-500/60">
                  <Image
                    src={getPlayerAvatar(topPlayer.steamid)}
                    alt={topPlayer.name}
                    fill
                    sizes="36px"
                    className="object-cover"
                    priority
                  />
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="relative mb-5 overflow-hidden rounded-[1.6rem] border border-[#263241] bg-[#101722] shadow-2xl shadow-black/35">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(239,68,68,0.22),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(245,158,11,0.14),transparent_34%)]" />
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-l from-red-950/40 to-transparent md:block" />

          <div className="relative grid gap-5 p-6 md:grid-cols-[1.4fr_0.75fr] md:items-stretch">
            <div>
              <p className="mb-3 inline-flex rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.25em] text-red-400">
                Liga privada de amigos
              </p>

              <h1 className="text-5xl font-black leading-none tracking-tight text-white md:text-6xl">
                CS2
                <span className="block bg-gradient-to-r from-red-500 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Stats4Newbas
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-300">
                Estadísticas reales leídas desde demos de CS2. Ranking, perfiles,
                evolución, mapas y premios internos de la liga.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <SeasonStat icon="🎮" title="Partidas" value={matches.length} />
                <SeasonStat icon="👥" title="Jugadores" value={ranking.length} />
                <SeasonStat icon="🎯" title="Rondas" value={totalRounds} />
                <SeasonStat icon="💀" title="Kills" value={totalKills} />
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-[#263241] bg-black/45 p-5 text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-yellow-400">
                Season Leader
              </p>

              {topPlayer ? (
                <Link href={`/player/${topPlayer.steamid}`}>
                  <div className="relative mx-auto mt-4 h-24 w-24 overflow-hidden rounded-full border-4 border-yellow-500 shadow-xl shadow-yellow-500/15">
                    <Image
                      src={getPlayerAvatar(topPlayer.steamid)}
                      alt={topPlayer.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                      priority
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-violet-400 text-[11px] font-black text-violet-300">
                      {getPlayerGc(topPlayer)}
                    </span>
                    <h2 className="text-xl font-black text-white">
                      {topPlayer.name}
                    </h2>
                  </div>

                  <p className="mt-2 text-5xl font-black text-yellow-400">
                    {topPlayer.ratingS4N}
                  </p>

                  <p className="mt-2 text-sm text-zinc-400">
                    K/D {topPlayer.kd} · ADR {topPlayer.adr}
                  </p>
                </Link>
              ) : (
                <p className="mt-6 text-zinc-400">Sin datos</p>
              )}
            </div>
          </div>
        </section>

        <section className="mb-5 rounded-[1.35rem] border border-[#263241] bg-[#101722] p-5">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-400">
            Podio oficial
          </p>

          <h2 className="mt-1 text-2xl font-black text-white">
            Top 3 Rating S4N
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {ranking.slice(0, 3).map((player, index) => (
              <Link
                key={player.steamid}
                href={`/player/${player.steamid}`}
                className={`group relative overflow-hidden rounded-[1.2rem] border bg-black/35 p-4 text-center transition hover:-translate-y-0.5 ${
                  index === 0
                    ? "border-yellow-500/65 shadow-lg shadow-yellow-500/10 md:order-2"
                    : index === 1
                    ? "border-zinc-400/45 md:order-1"
                    : "border-orange-600/55 md:order-3"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition group-hover:opacity-100" />

                <p className="relative text-3xl">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                </p>

                <div className="relative mx-auto mt-2 h-20 w-20 overflow-hidden rounded-full border-2 border-red-500/70">
                  <Image
                    src={getPlayerAvatar(player.steamid)}
                    alt={player.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                <div className="relative mt-3 flex items-center justify-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-violet-400 text-[10px] font-black text-violet-300">
                    {getPlayerGc(player)}
                  </span>
                  <h3 className="whitespace-nowrap text-base font-black text-white">
                    {player.name}
                  </h3>
                </div>

                <p className="relative mt-2 text-3xl font-black text-yellow-400">
                  {player.ratingS4N}
                </p>

                <p className="relative mt-1 text-xs text-zinc-400">
                  K/D {player.kd} · ADR {player.adr} · WR {player.winrate}%
                </p>
              </Link>
            ))}
          </div>
        </section>

        <div className="mb-5 grid gap-4 md:grid-cols-4">
          {leaderCards.map((card) => (
            <Link
              key={card.title}
              href={card.player ? `/player/${card.player.steamid}` : "#"}
              className={`rounded-[1.15rem] border ${card.border} bg-[#101722] p-4 transition hover:-translate-y-0.5 hover:bg-[#131d2a]`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-2xl">{card.icon}</span>
                <span className={`text-2xl font-black ${card.accent}`}>
                  {card.stat}
                </span>
              </div>

              <p className="text-xs uppercase tracking-widest text-zinc-500">
                {card.title}
              </p>

              <div className="mt-2 flex items-center gap-3">
                <div className="relative h-9 w-9 overflow-hidden rounded-full border border-[#334155]">
                  <Image
                    src={getPlayerAvatar(card.player?.steamid)}
                    alt={card.player?.name || "Sin datos"}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>

                <div>
                  <h2 className="whitespace-nowrap text-sm font-black text-white">
                    {card.player?.name || "Sin datos"}
                  </h2>
                  <p className="text-xs text-zinc-500">{card.label}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid gap-5">
          <section
            id="ranking"
            className="overflow-hidden rounded-[1.25rem] border border-[#263241] bg-[#101722]"
          >
            <div className="border-b border-[#263241] px-5 py-3">
              <p className="text-xs uppercase tracking-[0.35em] text-[#9aa4b2]">
                Ranking completo
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px]">
                <thead className="bg-[#151d29]">
                  <tr className="text-left text-[11px] uppercase tracking-widest text-[#9aa4b2]">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Jugador ↕</th>
                    <th className="px-4 py-3 text-center">GC</th>
                    <th className="px-4 py-3 text-[#f4b83f]">Rating ↓</th>
                    <th className="px-4 py-3">PJ ↕</th>
                    <th className="px-4 py-3">WR% ↕</th>
                    <th className="px-4 py-3">K ↕</th>
                    <th className="px-4 py-3">A ↕</th>
                    <th className="px-4 py-3">D ↕</th>
                    <th className="px-4 py-3">ADR ↕</th>
                    <th className="px-4 py-3">K/D ↕</th>
                    <th className="px-4 py-3">HS% ↕</th>
                  </tr>
                </thead>

                <tbody>
                  {ranking.map((player, index) => {
                    const gc = getPlayerGc(player);
                    const isInForm = player.formStatus === "EN FORMA";
                    const kdGood = Number(player.kd) >= 1;
                    const rating = Number(player.ratingS4N);
                    const trend = getTrendLabel(player);

                    return (
                      <tr
                        key={player.steamid}
                        className="border-t border-[#263241] text-sm text-zinc-200 transition hover:bg-[#172131]"
                      >
                        <td className="px-4 py-3 text-zinc-400">
                          {index + 1}
                        </td>

                        <td className="px-4 py-3">
                          <Link
                            href={`/player/${player.steamid}`}
                            className="flex items-center gap-3"
                          >
                            <span className="relative h-8 w-8 overflow-hidden rounded-full border border-[#3a4655]">
                              <Image
                                src={getPlayerAvatar(player.steamid)}
                                alt={player.name}
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            </span>

                            <span className="flex min-w-[285px] items-center gap-2">
                              <span className="whitespace-nowrap text-sm font-black text-white">
                                {player.name}
                              </span>

                              {isInForm && (
                                <span className="whitespace-nowrap rounded-full bg-orange-400 px-2 py-0.5 text-[9px] font-black uppercase text-black">
                                  🔥 En forma
                                </span>
                              )}

                              <span
                                className={`text-[11px] font-black ${getTrendClass(player)}`}
                              >
                                {trend}
                              </span>
                            </span>
                          </Link>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-2 rounded-md bg-violet-600/90 px-3 py-1 text-[11px] font-black text-white shadow-lg shadow-violet-900/30">
                            <span className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full bg-violet-300/30">
                              <span className="h-1.5 w-1.5 rounded-full bg-violet-100 shadow-[0_0_8px_rgba(221,214,254,0.9)]" />
                            </span>
                            {gc}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-black ${
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

                        <td className="px-4 py-3">{player.matches}</td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span>{player.winrate}%</span>
                            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-[#27313d]">
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

                        <td className="px-4 py-3">{player.kills}</td>
                        <td className="px-4 py-3">{player.assists}</td>
                        <td className="px-4 py-3">{player.deaths}</td>
                        <td className="px-4 py-3">{player.adr}</td>

                        <td
                          className={`px-4 py-3 font-black ${
                            kdGood ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {player.kd}
                        </td>

                        <td className="px-4 py-3">{player.hsPercent}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section
            id="especiales"
            className="rounded-[1.25rem] border border-[#263241] bg-[#0b0f16] p-5"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-red-500">
              Premios internos
            </p>

            <h2 className="mb-4 text-2xl font-black text-white">
              Rankings especiales
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
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
            className="rounded-[1.25rem] border border-[#263241] bg-[#101722] p-5"
          >
            <details>
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-red-500">
                      Actividad reciente
                    </p>

                    <h2 className="text-2xl font-black text-white">
                      Historial de partidas
                    </h2>
                  </div>

                  <span className="rounded-full border border-[#334155] bg-black px-4 py-2 text-sm font-bold text-zinc-300">
                    Abrir / cerrar
                  </span>
                </div>
              </summary>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {latestMatches.map((match) => (
                  <div
                    key={match.demoFile}
                    className="rounded-xl border border-[#263241] bg-black/45 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-black text-yellow-400">
                          {formatMapName(match.map)}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {match.demoFile}
                        </p>
                      </div>

                      <span className="rounded-full bg-[#151d29] px-3 py-1 text-xs font-bold text-zinc-400">
                        {match.rounds} rondas
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-zinc-300">
                      MVP:{" "}
                      <span className="font-bold text-white">
                        {match.mvp?.name || "Sin MVP"}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </details>
          </section>

          <section
            id="subir-demo"
            className="rounded-[1.25rem] border border-[#263241] bg-[#101722] p-5"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-red-500">
              Base de datos
            </p>

            <h2 className="mb-4 text-2xl font-black text-white">Subir Demo</h2>

            <DemoUploader />
          </section>
        </div>
      </section>
    </main>
  );
}

function SeasonStat({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-[#263241] bg-black/35 p-3">
      <p className="text-lg">{icon}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
      <p className="text-[11px] uppercase tracking-widest text-zinc-500">
        {title}
      </p>
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
    <div className="rounded-xl border border-[#263241] bg-black/40 p-4">
      <h3 className="mb-3 text-base font-black text-white">{title}</h3>

      <div className="space-y-2">
        {ranking.map((p, i) => {
          const gc = getPlayerGc(p);

          return (
            <div
              key={p.steamid}
              className="flex items-center justify-between rounded-lg border border-[#263241] bg-[#0b0f16] px-3 py-1.5 hover:border-zinc-700"
            >
              <div className="flex items-center gap-2.5">
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
                    className="whitespace-nowrap text-sm font-semibold text-white hover:text-red-400"
                  >
                    {p.name}
                  </Link>
                </span>
              </div>

              <span className="text-sm font-black text-yellow-400">
                {getText(p)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
