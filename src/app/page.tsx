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

export default function Home() {
  const { matches, ranking, mvpLeader, entryLeader, clutchLeader, baitLeader } =
    getDashboardStats();

  const totalRounds = matches.reduce((acc, match) => acc + match.rounds, 0);

  const leaderCards = [
    {
      title: "🏆 MVP Histórico",
      player: mvpLeader,
      stat: `MVPs: ${mvpLeader?.mvps || 0}`,
    },
    {
      title: "⚔️ Entry King",
      player: entryLeader,
      stat: `Entries: ${entryLeader?.entryKills || 0}`,
    },
    {
      title: "👑 Clutch King",
      player: clutchLeader,
      stat: `Clutches: ${clutchLeader?.totalClutches || 0}`,
    },
    {
      title: "🐀 Rey del Bait",
      player: baitLeader,
      stat: `Bait rounds: ${baitLeader?.baitRounds || 0}`,
    },
  ];

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.4em] text-red-500">
            Liga privada de amigos
          </p>

          <h1 className="mb-4 text-6xl font-black text-red-600">
            CS2 Stats4Newbas
          </h1>

          <p className="text-xl text-zinc-300">
            Estadísticas reales leídas desde demos de CS2.
          </p>
        </div>

        <div className="mb-10 rounded-2xl border border-red-900 bg-zinc-950 p-6">
          <div className="grid gap-4 text-center md:grid-cols-4">
            <SeasonStat title="Partidas" value={matches.length} />
            <SeasonStat title="Jugadores" value={ranking.length} />
            <SeasonStat title="Rondas" value={totalRounds} />
            <SeasonStat title="Temporada" value="2026" />
          </div>
        </div>

        <div className="mb-12 grid gap-4 md:grid-cols-4">
          <a
            href="#ranking"
            className="rounded-xl border border-red-600 bg-red-600 px-6 py-4 text-center font-bold hover:bg-red-700"
          >
            Ranking
          </a>

          <a
            href="#especiales"
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-4 text-center font-bold hover:border-red-600"
          >
            Especiales
          </a>

          <a
            href="#partidas"
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-4 text-center font-bold hover:border-red-600"
          >
            Partidas
          </a>

          <a
            href="#subir-demo"
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-4 text-center font-bold hover:border-red-600"
          >
            Subir Demo
          </a>
        </div>

        <section className="mb-12">
          <h2 className="mb-6 text-center text-4xl font-black text-red-500">
            Top 3 Rating S4N
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {ranking.slice(0, 3).map((player, index) => (
              <Link
                key={player.steamid}
                href={`/player/${player.steamid}`}
                className={`rounded-3xl border bg-zinc-950 p-6 text-center transition hover:scale-[1.02] ${
                  index === 0
                    ? "border-yellow-500"
                    : index === 1
                    ? "border-zinc-400"
                    : "border-orange-700"
                }`}
              >
                <div className="relative mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full border border-red-500">
                  <Image
                    src={getPlayerAvatar(player.steamid)}
                    alt={player.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>

                <p className="mb-2 text-3xl">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                </p>

                <h3 className="text-2xl font-black text-white">
                  {player.name}
                </h3>

                <p className="mt-3 text-5xl font-black text-red-500">
                  {player.ratingS4N}
                </p>

                <p className="mt-2 text-sm text-zinc-400">
                  K/D {player.kd} · ADR {player.adr}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <div className="mb-16 grid gap-6 md:grid-cols-4">
          {leaderCards.map((card) => (
            <Link
              key={card.title}
              href={card.player ? `/player/${card.player.steamid}` : "#"}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-red-500"
            >
              <p className="mb-4 text-sm text-zinc-400">{card.title}</p>

              <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-full border border-red-500">
                <Image
                  src={getPlayerAvatar(card.player?.steamid)}
                  alt={card.player?.name || "Sin datos"}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              <h2 className="text-3xl font-black text-red-500">
                {card.player?.name || "Sin datos"}
              </h2>

              <p className="mt-2 text-zinc-300">{card.stat}</p>
            </Link>
          ))}
        </div>

        <div className="grid gap-8">
          <section
            id="ranking"
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
          >
            <h2 className="mb-4 text-3xl font-black text-red-500">
              Ranking Rating S4N
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-zinc-700 text-left text-zinc-400">
                    <th className="py-2">#</th>
                    <th>Jugador</th>
                    <th>Rating</th>
                    <th>PJ</th>
                    <th>WR</th>
                    <th>K</th>
                    <th>A</th>
                    <th>D</th>
                    <th>ADR</th>
                    <th>K/D</th>
                    <th>HS%</th>
                  </tr>
                </thead>

                <tbody>
                  {ranking.map((player, index) => (
                    <tr
                      key={player.steamid}
                      className="border-b border-zinc-900"
                    >
                      <td className="py-3">{index + 1}</td>

                      <td className="font-bold">
                        <Link
                          href={`/player/${player.steamid}`}
                          className="flex items-center gap-3 text-red-500 hover:underline"
                        >
                          <span className="relative h-8 w-8 overflow-hidden rounded-full border border-red-500">
                            <Image
                              src={getPlayerAvatar(player.steamid)}
                              alt={player.name}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </span>
                          {player.name}
                        </Link>
                      </td>

                      <td className="font-black text-red-500">
                        {player.ratingS4N}
                      </td>
                      <td>{player.matches}</td>
                      <td>{player.winrate}%</td>
                      <td>{player.kills}</td>
                      <td>{player.assists}</td>
                      <td>{player.deaths}</td>
                      <td>{player.adr}</td>
                      <td>{player.kd}</td>
                      <td>{player.hsPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section
            id="especiales"
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
          >
            <h2 className="mb-4 text-3xl font-black text-red-500">
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
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
          >
            <h2 className="mb-4 text-3xl font-black text-red-500">
              Historial de partidas
            </h2>

            {matches.map((match) => (
              <div
                key={match.demoFile}
                className="mb-4 rounded-xl border border-zinc-800 bg-black p-4"
              >
                <p className="text-xl font-black text-red-500">{match.map}</p>
                <p>Rondas: {match.rounds}</p>
                <p>Winner Team: {match.winnerTeam || "Sin detectar"}</p>
                <p>MVP: {match.mvp?.name || "Sin MVP"}</p>
                <p className="text-sm text-zinc-500">{match.demoFile}</p>
              </div>
            ))}
          </section>

          <section
            id="subir-demo"
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
          >
            <h2 className="mb-4 text-3xl font-black text-red-500">
              Subir Demo
            </h2>

            <DemoUploader />
          </section>
        </div>
      </section>
    </main>
  );
}

function SeasonStat({ title, value }: { title: string; value: string | number }) {
  return (
    <div>
      <p className="text-3xl font-black text-red-500">{value}</p>
      <p className="text-zinc-400">{title}</p>
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
    <div>
      <h3 className="mb-3 text-xl font-bold">{title}</h3>

      {ranking.map((p, i) => (
        <p key={p.steamid} className="mb-2 flex items-center gap-2">
          <span>{i + 1}.</span>

          <Link
            href={`/player/${p.steamid}`}
            className="flex items-center gap-2 text-red-500 hover:underline"
          >
            <span className="relative h-6 w-6 overflow-hidden rounded-full border border-red-500">
              <Image
                src={getPlayerAvatar(p.steamid)}
                alt={p.name}
                fill
                sizes="24px"
                className="object-cover"
              />
            </span>

            {p.name}
          </Link>

          <span className="text-zinc-300">— {getText(p)}</span>
        </p>
      ))}
    </div>
  );
}