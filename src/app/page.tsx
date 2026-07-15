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

const footballTeams = [
  {
    name: "River Plate",
    shortName: "River",
    color: "from-red-500/20 to-white/5",
    border: "border-red-500/40",
    members: ["76561198827102122", "76561199082720391"],
  },
  {
    name: "Boca Juniors",
    shortName: "Boca",
    color: "from-blue-500/20 to-yellow-500/10",
    border: "border-blue-500/40",
    members: ["76561199037068708", "76561198072925518"],
  },
  {
    name: "Independiente",
    shortName: "Rojo",
    color: "from-red-600/25 to-black/10",
    border: "border-red-600/45",
    members: ["76561198810129628"],
  },
  {
    name: "Vélez Sarsfield",
    shortName: "Vélez",
    color: "from-blue-400/20 to-white/5",
    border: "border-sky-400/40",
    members: ["76561198051821859"],
  },
];

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
  if (delta > 0) return "text-emerald-400";
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
  const secondPlayer = ranking[1];
  const latestMatches = matches.slice().reverse().slice(0, 10);

  const topPlayerClub = topPlayer
    ? footballTeams.find((team) =>
        team.members.includes(String(topPlayer.steamid))
      )
    : null;

  const leaderGap =
    topPlayer && secondPlayer
      ? Number(
          (Number(topPlayer.ratingS4N) - Number(secondPlayer.ratingS4N)).toFixed(2)
        )
      : 0;

  const leaderCards = [
    { title: "MVP Histórico", icon: "🏆", player: mvpLeader, stat: `${mvpLeader?.mvps || 0}`, label: "MVPs", accent: "text-yellow-400", border: "border-yellow-500/35" },
    { title: "Entry King", icon: "⚔️", player: entryLeader, stat: `${entryLeader?.entryKills || 0}`, label: "entradas", accent: "text-red-400", border: "border-red-500/35" },
    { title: "Clutch King", icon: "👑", player: clutchLeader, stat: `${clutchLeader?.totalClutches || 0}`, label: "clutches", accent: "text-violet-400", border: "border-violet-500/35" },
    { title: "Rey del Bait", icon: "🐀", player: baitLeader, stat: `${baitLeader?.baitRounds || 0}`, label: "bait rounds", accent: "text-orange-400", border: "border-orange-500/35" },
  ];

  const teamRanking = footballTeams
    .map((team) => {
      const members = ranking.filter((player) =>
        team.members.includes(String(player.steamid))
      );

      const matches = members.reduce((acc, player) => acc + Number(player.matches || 0), 0);
      const kills = members.reduce((acc, player) => acc + Number(player.kills || 0), 0);
      const deaths = members.reduce((acc, player) => acc + Number(player.deaths || 0), 0);
      const mvps = members.reduce((acc, player) => acc + Number(player.mvps || 0), 0);
      const clutches = members.reduce((acc, player) => acc + Number(player.totalClutches || 0), 0);
      const rating =
        members.length > 0
          ? Number(
              (
                members.reduce((acc, player) => acc + Number(player.ratingS4N || 0), 0) /
                members.length
              ).toFixed(2)
            )
          : 0;
      const adr =
        members.length > 0
          ? Number(
              (
                members.reduce((acc, player) => acc + Number(player.adr || 0), 0) /
                members.length
              ).toFixed(2)
            )
          : 0;
      const kd = deaths > 0 ? Number((kills / deaths).toFixed(2)) : kills;

      return {
        ...team,
        members,
        matches,
        kills,
        deaths,
        mvps,
        clutches,
        rating,
        adr,
        kd,
        score: Number((rating * 100 + kd * 25 + adr * 0.25 + mvps * 2 + clutches).toFixed(2)),
      };
    })
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (b.kd !== a.kd) return b.kd - a.kd;
      if (b.adr !== a.adr) return b.adr - a.adr;
      return b.mvps - a.mvps;
    });

  const latestMatch = latestMatches[0];
  const biggestRise = ranking
    .slice()
    .sort((a, b) => Number(b.formDelta || 0) - Number(a.formDelta || 0))[0];
  const biggestDrop = ranking
    .slice()
    .sort((a, b) => Number(a.formDelta || 0) - Number(b.formDelta || 0))[0];

  const activityFeed = [
    teamRanking[0]
      ? {
          icon: "🏆",
          title: `${teamRanking[0].name} lidera la Copa de Clubes`,
          detail: `Rating promedio ${teamRanking[0].rating}`,
          tone: "yellow",
        }
      : null,
    biggestRise && Number(biggestRise.formDelta || 0) > 0
      ? {
          icon: "▲",
          title: `${biggestRise.name} es quien más creció`,
          detail: `+${Number(biggestRise.formDelta).toFixed(2)} de forma reciente`,
          tone: "green",
        }
      : null,
    biggestDrop && Number(biggestDrop.formDelta || 0) < 0
      ? {
          icon: "▼",
          title: `${biggestDrop.name} necesita recuperarse`,
          detail: `${Number(biggestDrop.formDelta).toFixed(2)} de variación`,
          tone: "red",
        }
      : null,
    latestMatch
      ? {
          icon: "🎮",
          title: `Última demo: ${formatMapName(latestMatch.map)}`,
          detail: `${latestMatch.rounds} rondas · MVP ${latestMatch.mvp?.name || "Sin MVP"}`,
          tone: "blue",
        }
      : null,
    mvpLeader
      ? {
          icon: "⭐",
          title: `${mvpLeader.name} domina los MVP`,
          detail: `${mvpLeader.mvps} premios en la temporada`,
          tone: "yellow",
        }
      : null,
  ].filter(Boolean) as {
    icon: string;
    title: string;
    detail: string;
    tone: "yellow" | "green" | "red" | "blue";
  }[];

  return (
    <main className="s4n-page min-h-screen px-4 py-5 text-white">
      <section className="mx-auto max-w-7xl">
        <header className="s4n-nav sticky top-0 z-30 mb-5 rounded-2xl border border-white/10 px-5 py-3 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-2xl font-black tracking-tight">
              <span className="text-red-500">S4</span><span className="text-yellow-400">N</span>
            </Link>

            <nav className="flex items-center gap-6 text-sm font-black text-zinc-400">
              <a href="#ranking" className="border-b-2 border-yellow-400 pb-2 text-white">Ranking</a>
              <a href="#individuales" className="transition hover:text-white">Individuales</a>
              <a href="#partidas" className="transition hover:text-white">Partidas</a>
              <a href="#subir-demo" className="transition hover:text-white">Subir Demo</a>
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <span className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-red-300">Temporada 2026</span>
              {topPlayer && (
                <Link href={`/player/${topPlayer.steamid}`} className="relative h-9 w-9 overflow-hidden rounded-full border border-yellow-500/70">
                  <Image src={getPlayerAvatar(topPlayer.steamid)} alt={topPlayer.name} fill sizes="36px" className="object-cover" priority />
                </Link>
              )}
            </div>
          </div>
        </header>

        <section className="mb-5 grid gap-5 lg:grid-cols-[1.45fr_0.85fr]">
          <div className="s4n-card relative overflow-hidden rounded-[1.6rem] border border-white/10 p-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(239,68,68,0.24),transparent_34%),radial-gradient(circle_at_90%_20%,rgba(245,158,11,0.14),transparent_30%)]" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <p className="inline-flex rounded-full border border-red-500/45 bg-red-500/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.3em] text-red-300">
                  Liga privada · Temporada 2026
                </p>
                {teamRanking[0] && (
                  <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-yellow-300">
                    {teamRanking[0].shortName} lidera
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-5xl font-black leading-[0.92] tracking-tight md:text-7xl">
                CS2
                <span className="block bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  Conardos DownLeague
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300 md:text-base">
                Un lugar donde se reúnen 6 conos para armar un equipo de CS2
                y jugar dentro de todas sus discapacidades.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <SeasonStat icon="🎮" title="Partidas" value={matches.length} />
                <SeasonStat icon="👥" title="Jugadores" value={ranking.length} />
                <SeasonStat icon="🎯" title="Rondas" value={totalRounds} />
                <SeasonStat icon="💀" title="Kills" value={totalKills} />
              </div>
            </div>
          </div>

          <div className="s4n-card relative overflow-hidden rounded-[1.6rem] border border-red-500/25 p-6 text-center">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(245,158,11,0.15),transparent_36%)]" />
            <div className="relative">
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-yellow-400">Season Leader</p>
              {topPlayer ? (
                <Link href={`/player/${topPlayer.steamid}`}>
                  <div className="relative mx-auto mt-5 h-24 w-24 overflow-hidden rounded-full border-4 border-yellow-500 shadow-xl shadow-yellow-500/20">
                    <Image src={getPlayerAvatar(topPlayer.steamid)} alt={topPlayer.name} fill sizes="96px" className="object-cover" priority />
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-violet-400 text-[11px] font-black text-violet-300">{getPlayerGc(topPlayer)}</span>
                    <h2 className="whitespace-nowrap text-xl font-black text-white">{topPlayer.name}</h2>
                  </div>
                  <p className="mt-2 text-5xl font-black text-yellow-400">
                    {topPlayer.ratingS4N}
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    K/D {topPlayer.kd} · ADR {topPlayer.adr}
                  </p>

                  <div className="mt-4 flex justify-center gap-2">
                    {(topPlayer.recentResults || []).slice(-5).map((result: string, index: number) => (
                      <span
                        key={`${result}-${index}`}
                        className={`flex h-7 w-7 items-center justify-center rounded-md border text-[10px] font-black ${
                          result === "WIN"
                            ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                            : result === "LOSS"
                            ? "border-red-500/40 bg-red-500/15 text-red-400"
                            : "border-zinc-600 bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {result === "WIN" ? "W" : result === "LOSS" ? "L" : "–"}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <LeaderDetail label="KAST" value={`${topPlayer.kastPercent}%`} />
                    <LeaderDetail label="Impact" value={topPlayer.impactRating} />
                    <LeaderDetail label="MVPs" value={topPlayer.mvps} />
                  </div>

                  <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3 text-left">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          Club
                        </p>
                        <p className="mt-1 text-sm font-black text-white">
                          {topPlayerClub?.name || "Sin club"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          Ventaja
                        </p>
                        <p className="mt-1 text-sm font-black text-yellow-400">
                          +{leaderGap.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <span className="mt-4 inline-flex text-xs font-black uppercase tracking-widest text-yellow-300">
                    Ver perfil completo →
                  </span>
                </Link>
              ) : <p className="mt-6 text-zinc-400">Sin datos</p>}
            </div>
          </div>
        </section>

        <section className="s4n-card mb-5 rounded-[1.35rem] border border-white/10 p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-400">
                Centro de actividad
              </p>
              <h2 className="mt-1 text-2xl font-black text-white">
                Lo que está pasando en la liga
              </h2>
            </div>

            <span className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-black uppercase tracking-widest text-zinc-400">
              Actualizado con las demos
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {activityFeed.map((item) => (
              <ActivityCard key={`${item.title}-${item.detail}`} item={item} />
            ))}
          </div>
        </section>

        <section className="mb-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="s4n-card rounded-[1.45rem] border border-white/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-400">🏆 Podio oficial</p>
            <h2 className="mt-1 text-2xl font-black text-white">Top 3 Rating S4N</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {ranking.slice(0, 3).map((player, index) => (
                <Link key={player.steamid} href={`/player/${player.steamid}`} className={`group relative overflow-hidden rounded-[1.2rem] border bg-black/35 p-4 text-center transition hover:-translate-y-0.5 ${index === 0 ? "border-yellow-500/65 shadow-lg shadow-yellow-500/10 md:order-2" : index === 1 ? "border-zinc-400/45 md:order-1" : "border-orange-600/55 md:order-3"}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition group-hover:opacity-100" />
                  <p className="relative text-3xl">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</p>
                  <div className="relative mx-auto mt-2 h-20 w-20 overflow-hidden rounded-full border-2 border-red-500/70">
                    <Image src={getPlayerAvatar(player.steamid)} alt={player.name} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="relative mt-3 flex items-center justify-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-violet-400 text-[10px] font-black text-violet-300">{getPlayerGc(player)}</span>
                    <h3 className="whitespace-nowrap text-base font-black text-white">{player.name}</h3>
                  </div>
                  <p className="relative mt-2 text-3xl font-black text-yellow-400">{player.ratingS4N}</p>
                  <p className="relative mt-1 text-xs text-zinc-400">K/D {player.kd} · ADR {player.adr} · WR {player.winrate}%</p>
                </Link>
              ))}
            </div>
          </div>

          <section id="individuales" className="s4n-card rounded-[1.45rem] border border-white/10 p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-400">🏅 Categorías individuales</p>
                <h2 className="mt-1 text-2xl font-black text-white">Premios del mes</h2>
              </div>
              <a href="#ranking" className="text-sm font-bold text-zinc-400 hover:text-white">Ver ranking →</a>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {leaderCards.map((card) => <LeaderMiniCard key={card.title} card={card} />)}
            </div>
          </section>
        </section>

        <section id="ranking" className="s4n-card mb-5 overflow-hidden rounded-[1.35rem] border border-white/10">
          <div className="border-b border-white/10 px-5 py-3"><p className="text-xs uppercase tracking-[0.35em] text-[#9aa4b2]">Ranking completo</p></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px]">
              <thead className="bg-black/25">
                <tr className="text-left text-[11px] uppercase tracking-widest text-[#9aa4b2]">
                  <th className="px-4 py-3">#</th><th className="px-4 py-3">Jugador ↕</th><th className="px-4 py-3 text-center">GC</th><th className="px-4 py-3 text-[#f4b83f]">Rating ↓</th><th className="px-4 py-3">PJ ↕</th><th className="px-4 py-3">WR% ↕</th><th className="px-4 py-3">K ↕</th><th className="px-4 py-3">A ↕</th><th className="px-4 py-3">D ↕</th><th className="px-4 py-3">ADR ↕</th><th className="px-4 py-3">K/D ↕</th><th className="px-4 py-3">HS% ↕</th>
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
                    <tr key={player.steamid} className="border-t border-white/10 text-sm text-zinc-200 transition hover:bg-white/[0.04]">
                      <td className="px-4 py-3 text-zinc-400">{index + 1}</td>
                      <td className="px-4 py-3">
                        <Link href={`/player/${player.steamid}`} className="flex items-center gap-3">
                          <span className="relative h-8 w-8 overflow-hidden rounded-full border border-[#3a4655]"><Image src={getPlayerAvatar(player.steamid)} alt={player.name} fill sizes="32px" className="object-cover" /></span>
                          <span className="flex min-w-[285px] items-center gap-2">
                            <span className="whitespace-nowrap text-sm font-black text-white">{player.name}</span>
                            {isInForm && <span className="whitespace-nowrap rounded-full bg-orange-400 px-2 py-0.5 text-[9px] font-black uppercase text-black">🔥 En forma</span>}
                            <span className={`text-[11px] font-black ${getTrendClass(player)}`}>{trend}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-center"><span className="inline-flex items-center gap-2 rounded-md bg-violet-600/90 px-3 py-1 text-[11px] font-black text-white shadow-lg shadow-violet-900/30"><span className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full bg-violet-300/30"><span className="h-1.5 w-1.5 rounded-full bg-violet-100 shadow-[0_0_8px_rgba(221,214,254,0.9)]" /></span>{gc}</span></td>
                      <td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-sm font-black ${rating >= 1 ? "bg-yellow-500/15 text-[#f4b83f]" : rating >= 0.8 ? "bg-green-500/15 text-green-400" : "bg-blue-500/15 text-blue-400"}`}>{player.ratingS4N}</span></td>
                      <td className="px-4 py-3">{player.matches}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-3"><span>{player.winrate}%</span><span className="h-1.5 w-16 overflow-hidden rounded-full bg-[#27313d]"><span className="block h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, Number(player.winrate))}%` }} /></span></div></td>
                      <td className="px-4 py-3">{player.kills}</td><td className="px-4 py-3">{player.assists}</td><td className="px-4 py-3">{player.deaths}</td><td className="px-4 py-3">{player.adr}</td>
                      <td className={`px-4 py-3 font-black ${kdGood ? "text-emerald-400" : "text-red-400"}`}>{player.kd}</td>
                      <td className="px-4 py-3">{player.hsPercent}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section
          id="desglose-individuales"
          className="s4n-card mb-5 rounded-[1.35rem] border border-white/10 p-5"
        >
          <details open>
            <summary className="cursor-pointer list-none">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-400">
                    🏅 Categorías individuales
                  </p>
                  <h2 className="text-2xl font-black text-white">
                    Desglose completo
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Todos los puestos de cada premio interno, no solo los líderes.
                  </p>
                </div>

                <span className="rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm font-bold text-zinc-300">
                  Abrir / cerrar
                </span>
              </div>
            </summary>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <IndividualBoard
                title="🏆 MVP Histórico"
                ranking={ranking.slice().sort((a, b) => b.mvps - a.mvps)}
                getText={(p) => `${p.mvps}`}
              />

              <IndividualBoard
                title="⚔️ Entry King"
                ranking={ranking.slice().sort((a, b) => b.entryKills - a.entryKills)}
                getText={(p) => `${p.entryKills}/${p.entryDeaths}`}
              />

              <IndividualBoard
                title="👑 Clutch King"
                ranking={ranking.slice().sort((a, b) => b.totalClutches - a.totalClutches)}
                getText={(p) => `${p.totalClutches}`}
              />

              <IndividualBoard
                title="🐀 Rey del Bait"
                ranking={ranking.slice().sort((a, b) => b.baitRounds - a.baitRounds)}
                getText={(p) => `${p.baitRounds}`}
              />

              <IndividualBoard
                title="🎯 Mejor ADR"
                ranking={ranking.slice().sort((a, b) => b.adr - a.adr)}
                getText={(p) => `${p.adr}`}
              />

              <IndividualBoard
                title="💀 Mejor K/D"
                ranking={ranking.slice().sort((a, b) => b.kd - a.kd)}
                getText={(p) => `${p.kd}`}
              />

              <IndividualBoard
                title="🧠 Mejor KAST"
                ranking={ranking.slice().sort((a, b) => b.kastPercent - a.kastPercent)}
                getText={(p) => `${p.kastPercent}%`}
              />

              <IndividualBoard
                title="🎯 HS%"
                ranking={ranking.slice().sort((a, b) => b.hsPercent - a.hsPercent)}
                getText={(p) => `${p.hsPercent}%`}
              />
            </div>
          </details>
        </section>

        <section id="partidas" className="s4n-card mb-5 rounded-[1.35rem] border border-white/10 p-5">
          <details>
            <summary className="cursor-pointer list-none">
              <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.35em] text-red-400">Actividad reciente</p><h2 className="text-2xl font-black text-white">Historial de partidas</h2></div><span className="rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm font-bold text-zinc-300">Abrir / cerrar</span></div>
            </summary>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {latestMatches.map((match) => (
                <div key={match.demoFile} className="rounded-xl border border-white/10 bg-black/35 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div><p className="text-lg font-black text-yellow-400">{formatMapName(match.map)}</p><p className="mt-1 text-xs text-zinc-500">{match.demoFile}</p></div>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-zinc-400">{match.rounds} rondas</span>
                  </div>
                  <p className="mt-3 text-sm text-zinc-300">MVP: <span className="font-bold text-white">{match.mvp?.name || "Sin MVP"}</span></p>
                </div>
              ))}
            </div>
          </details>
        </section>

        <section
          id="equipos-futbol"
          className="s4n-card mb-5 rounded-[1.35rem] border border-white/10 p-5"
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-400">
                ⚽ Ranking por equipos de fútbol
              </p>
              <h2 className="mt-1 text-2xl font-black text-white">
                Tabla de Clubes S4N
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                La competencia paralela de la liga. Orden por rating promedio, con desempate por K/D, ADR y MVPs.
              </p>
            </div>

            <span className="rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm font-bold text-zinc-300">
              {teamRanking.length} clubes
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            {teamRanking.map((team, index) => (
              <FootballTeamCard key={team.name} team={team} position={index + 1} />
            ))}
          </div>
        </section>

        <section id="subir-demo" className="s4n-card rounded-[1.35rem] border border-white/10 p-5">
          <p className="text-xs uppercase tracking-[0.35em] text-red-400">Base de datos</p>
          <h2 className="mb-4 text-2xl font-black text-white">Subir Demo</h2>
          <DemoUploader />
        </section>
      </section>
    </main>
  );
}

function LeaderDetail({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/25 px-2 py-2">
      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function ActivityCard({
  item,
}: {
  item: {
    icon: string;
    title: string;
    detail: string;
    tone: "yellow" | "green" | "red" | "blue";
  };
}) {
  const tone =
    item.tone === "yellow"
      ? "border-yellow-500/35 bg-yellow-500/5 text-yellow-400"
      : item.tone === "green"
      ? "border-emerald-500/35 bg-emerald-500/5 text-emerald-400"
      : item.tone === "red"
      ? "border-red-500/35 bg-red-500/5 text-red-400"
      : "border-blue-500/35 bg-blue-500/5 text-blue-400";

  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/30 text-lg">
          {item.icon}
        </span>
        <div>
          <p className="text-sm font-black text-white">{item.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">
            {item.detail}
          </p>
        </div>
      </div>
    </div>
  );
}

function FootballTeamCard({ team, position }: { team: any; position: number }) {
  return (
    <div className={`relative overflow-hidden rounded-xl border ${team.border} bg-gradient-to-br ${team.color} p-4`}>
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/5 blur-2xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div
            className={`mb-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${
              position === 1
                ? "bg-yellow-500 text-black"
                : position === 2
                ? "bg-zinc-300 text-black"
                : position === 3
                ? "bg-orange-600 text-white"
                : "bg-zinc-800 text-zinc-300"
            }`}
          >
            {position}
          </div>

          <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
            {team.shortName}
          </p>
          <h3 className="mt-1 text-xl font-black text-white">{team.name}</h3>
        </div>

        <div className="text-right">
          <p className="text-3xl font-black text-yellow-400">{team.rating}</p>
          <p className="text-[11px] uppercase tracking-widest text-zinc-500">
            Rating club
          </p>
        </div>
      </div>

      <div className="relative mt-4 flex -space-x-2">
        {team.members.map((player: any) => (
          <Link
            key={player.steamid}
            href={`/player/${player.steamid}`}
            className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-black bg-black"
            title={player.name}
          >
            <Image
              src={getPlayerAvatar(player.steamid)}
              alt={player.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          </Link>
        ))}
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-2">
        <TeamStat title="K/D" value={team.kd} />
        <TeamStat title="ADR" value={team.adr} />
        <TeamStat title="Kills" value={team.kills} />
        <TeamStat title="MVPs" value={team.mvps} />
      </div>

      <div className="relative mt-4 rounded-lg border border-white/10 bg-black/25 p-3">
        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
          Plantel
        </p>
        <p className="mt-1 truncate text-sm font-bold text-zinc-200">
          {team.members.map((player: any) => player.name).join(" · ")}
        </p>
      </div>
    </div>
  );
}

function TeamStat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-2">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500">
        {title}
      </p>
      <p className="text-sm font-black text-white">{value}</p>
    </div>
  );
}

function IndividualBoard({
  title,
  ranking,
  getText,
}: {
  title: string;
  ranking: any[];
  getText: (player: any) => string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <h3 className="mb-3 text-sm font-black text-white">{title}</h3>

      <div className="space-y-2">
        {ranking.map((p, index) => (
          <Link
            key={p.steamid}
            href={`/player/${p.steamid}`}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 transition hover:border-yellow-500/35 hover:bg-yellow-500/5"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
                  index === 0
                    ? "bg-yellow-500 text-black"
                    : index === 1
                    ? "bg-zinc-300 text-black"
                    : index === 2
                    ? "bg-orange-600 text-white"
                    : "bg-zinc-800 text-zinc-300"
                }`}
              >
                {index + 1}
              </span>

              <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white/10">
                <Image
                  src={getPlayerAvatar(p.steamid)}
                  alt={p.name}
                  fill
                  sizes="28px"
                  className="object-cover"
                />
              </span>

              <span className="min-w-0">
                <span className="block truncate text-sm font-black text-white">
                  {p.name}
                </span>
                <span className="text-[10px] font-bold text-violet-300">
                  GC {getPlayerGc(p)}
                </span>
              </span>
            </div>

            <span className="ml-3 shrink-0 text-sm font-black text-yellow-400">
              {getText(p)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SeasonStat({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3 backdrop-blur">
      <p className="text-lg">{icon}</p><p className="mt-1 text-2xl font-black text-white">{value}</p><p className="text-[11px] uppercase tracking-widest text-zinc-500">{title}</p>
    </div>
  );
}

function LeaderMiniCard({ card }: { card: any }) {
  return (
    <Link href={card.player ? `/player/${card.player.steamid}` : "#"} className={`rounded-xl border ${card.border} bg-black/35 p-4 transition hover:-translate-y-0.5 hover:bg-white/[0.04]`}>
      <div className="mb-3 flex items-center justify-between"><span className="text-2xl">{card.icon}</span><span className={`text-2xl font-black ${card.accent}`}>{card.stat}</span></div>
      <p className="text-[11px] uppercase tracking-widest text-zinc-500">{card.title}</p>
      <div className="mt-3 flex items-center gap-3">
        <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/15"><Image src={getPlayerAvatar(card.player?.steamid)} alt={card.player?.name || "Sin datos"} fill sizes="36px" className="object-cover" /></div>
        <div><h2 className="whitespace-nowrap text-sm font-black text-white">{card.player?.name || "Sin datos"}</h2><p className="text-xs text-zinc-500">{card.label}</p></div>
      </div>
    </Link>
  );
}
