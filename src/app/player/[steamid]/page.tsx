import { getDashboardStats } from "@/lib/stats";
import Image from "next/image";
import Link from "next/link";
import PlayerCharts from "@/components/PlayerCharts";
import PlayerBadges from "@/components/PlayerBadges";
import PlayerComparison from "@/components/PlayerComparison";
import PlayerVisualDashboard from "@/components/PlayerVisualDashboard";
import MapPerformanceTable from "@/components/MapPerformanceTable";
import PlayerAIAnalyst from "@/components/PlayerAIAnalyst";
import type { ReactNode } from "react";

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

function cleanMapName(map?: string) {
  if (!map) return "SIN DATOS";
  return String(map).replace("de_", "").toUpperCase();
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function getRatingColor(rating: number) {
  if (rating >= 1.2) return "text-emerald-400";
  if (rating >= 1.0) return "text-yellow-400";
  return "text-red-400";
}

function getPlayerGc(player: any) {
  return player?.gcLevel || "-";
}

function getRecentResult(match: any) {
  return match.winnerTeam && match.player?.team === match.winnerTeam ? "W" : "L";
}

function buildRadarPoints(values: number[]) {
  const center = 110;
  const maxRadius = 82;

  return values
    .map((value, index) => {
      const angle = -90 + index * 60;
      const radians = (Math.PI / 180) * angle;
      const radius = (clamp(value) / 100) * maxRadius;
      const x = center + radius * Math.cos(radians);
      const y = center + radius * Math.sin(radians);
      return `${x},${y}`;
    })
    .join(" ");
}

export default async function PlayerPage({ params }: Props) {
  const { steamid } = await params;
  const { ranking, matches } = getDashboardStats();

  const player = ranking.find((p) => String(p.steamid) === String(steamid));

  if (!player) {
    return (
      <main className="s4n-page min-h-screen px-6 py-8 text-white">
        <section className="mx-auto max-w-6xl">
          <Link href="/" className="text-red-400 hover:text-red-300">
            ← Volver
          </Link>

          <h1 className="mt-10 text-4xl font-black">Jugador no encontrado</h1>
          <p className="mt-4 text-zinc-400">SteamID buscado: {steamid}</p>
        </section>
      </main>
    );
  }

  const gc = getPlayerGc(player);

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
    match: `${cleanMapName(match.map)} #${index + 1}`,
    rating: Number(match.player?.ratingS4N || 0),
    adr: Number(match.player?.adr || 0),
    kd: Number(match.player?.kd || 0),
  }));

  const recentMatches = playerMatches.slice(-11);


  const winCount = playerMatches.filter(
    (match) => match.winnerTeam && match.player?.team === match.winnerTeam
  ).length;

  const firepower = clamp(Number(player.ratingS4N || 0) * 65);
  const opening = clamp(player.openingDuelWinPercent || 0);
  const trading = clamp((player.tradeKillPercent || 0) * 2.2);
  const clutching = clamp((player.totalClutches || 0) * 12);
  const utility = clamp(
    ((player.heDamage || 0) + (player.molotovDamage || 0)) / 10 +
      (player.flashAssists || 0) * 8
  );
  const consistency = clamp(player.kastPercent || 0);

  const radarValues = [firepower, opening, trading, utility, consistency, clutching];
  const radarPoints = buildRadarPoints(radarValues);



  return (
    <main className="s4n-page min-h-screen px-3 py-3 text-white sm:px-5 lg:px-8 lg:py-6">
      <section className="mx-auto max-w-[1480px]">
        <header className="s4n-nav sticky top-3 z-30 mb-6 rounded-[1.15rem] border border-white/10 px-4 py-3 backdrop-blur-2xl sm:px-5">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-2xl font-black tracking-tight">
              <span className="text-red-500">S4</span>
              <span className="text-yellow-400">N</span>
            </Link>

            <nav className="flex items-center gap-6 text-sm font-black text-zinc-400">
              <Link href="/" className="transition hover:text-white">
                Ranking
              </Link>
              <span className="border-b-2 border-yellow-400 pb-2 text-white">
                Jugadores
              </span>
              <Link href="/#partidas" className="transition hover:text-white">
                Partidas
              </Link>

            </nav>

            <span className="hidden rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-red-300 md:inline-flex">
              Temporada 2026
            </span>
          </div>
        </header>

        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-zinc-400 transition hover:text-red-400"
        >
          ← Volver al ranking
        </Link>

        <section className="s4n-card s4n-player-hero relative overflow-hidden rounded-[1.5rem] border border-white/10 p-4 sm:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(239,68,68,0.20),transparent_34%),radial-gradient(circle_at_90%_15%,rgba(245,158,11,0.10),transparent_30%)]" />

          <div className="relative grid gap-4 lg:grid-cols-[1.5fr_0.75fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-red-400">
                Perfil de jugador
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-violet-500/40 bg-black shadow-xl shadow-violet-950/30">
                  <Image
                    src={getPlayerAvatar(String(player.steamid))}
                    alt={player.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                    priority
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-violet-400 text-xs font-black text-violet-300 shadow-[0_0_10px_rgba(167,139,250,0.35)]">
                      {gc}
                    </span>

                    <h1 className="max-w-full break-words text-xl font-black leading-tight tracking-tight text-white md:text-2xl">
                      {player.name}
                    </h1>

                    <span className="text-2xl text-zinc-300">☆</span>

                    <span className="inline-flex items-center gap-2 rounded-md bg-violet-600/90 px-3 py-1 text-xs font-black text-white shadow-lg shadow-violet-900/30">
                      <span className="h-2 w-2 rounded-full bg-violet-100 shadow-[0_0_8px_rgba(221,214,254,0.9)]" />
                      GC {gc}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-zinc-500">
                    SteamID: {player.steamid}
                  </p>

                  <PlayerBadges player={player} ranking={ranking} />
                </div>
              </div>
            </div>

            <div className="rounded-[1.1rem] border border-white/10 bg-black/35 p-4 text-center">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-[#9aa4b2]">
                Rating S4N
              </p>

              <p
                className={`mt-1 text-3xl font-black ${getRatingColor(
                  Number(player.ratingS4N)
                )}`}
              >
                {player.ratingS4N}
              </p>

              <p className="mt-2 text-sm text-zinc-400">
                Impact {player.impactRating} · KAST {player.kastPercent}%
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat title="CT K/D" value={player.ctKd} />
                <MiniStat title="T K/D" value={player.tKd} />
              </div>
            </div>
          </div>

          <div className="relative mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
            <MiniStat icon="⚔️" title="Partidas" value={player.matches} />
            <MiniStat icon="♻️" title="Winrate" value={`${player.winrate}%`} />
            <MiniStat icon="🎯" title="MVPs" value={player.mvps} />
            <MiniStat icon="🛡️" title="Victorias" value={winCount} />
            <MiniStat icon="➕" title="Rondas" value={player.rounds || "-"} />
            <MiniStat icon="💀" title="Kills" value={player.kills} />
          </div>
        </section>

        <section className="s4n-card s4n-section mt-4 rounded-[1.35rem] border border-white/10 p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-400">
                Resumen rápido
              </p>
              <h2 className="text-xl font-black text-white">Estado actual</h2>
            </div>

            <p className="text-sm font-bold text-zinc-400">
              Últimas {recentMatches.length} partidas
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-[#9aa4b2]">
                Forma reciente
              </p>

              <div className="flex flex-wrap gap-2">
                {recentMatches.map((match) => {
                  const result = getRecentResult(match);

                  return (
                    <span
                      key={match.demoFile}
                      className={`flex h-8 w-8 items-center justify-center rounded-md border text-xs font-black ${
                        result === "W"
                          ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                          : "border-red-500/50 bg-red-500/15 text-red-400"
                      }`}
                      title={cleanMapName(match.map)}
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
                value={player.bestMap ? cleanMapName(player.bestMap.map) : "Sin datos"}
                sub={player.bestMap ? `Rating ${player.bestMap.ratingS4N}` : "Sin datos"}
                tone="green"
              />

              <InfoCard
                icon="💀"
                title="Peor mapa"
                value={player.worstMap ? cleanMapName(player.worstMap.map) : "Sin datos"}
                sub={player.worstMap ? `Rating ${player.worstMap.ratingS4N}` : "Sin datos"}
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

        <PlayerVisualDashboard player={player} />

        <section className="s4n-card s4n-section mt-4 rounded-[1.35rem] border border-white/10 p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <RecordCard title="Mejor mapa" value={player.bestMap ? cleanMapName(player.bestMap.map) : "—"} detail={player.bestMap ? `${player.bestMap.ratingS4N} rating` : "Sin datos"} />
            <RecordCard title="Arma principal" value={player.favoriteWeapon ? String(player.favoriteWeapon.weapon).toUpperCase() : "—"} detail={player.favoriteWeapon ? `${player.favoriteWeapon.kills} kills` : "Sin datos"} />
            <RecordCard title="Mejor racha" value={`${recentMatches.filter((m) => getRecentResult(m) === "W").length} W`} detail={`Últimas ${recentMatches.length} partidas`} />
            <RecordCard title="Diferencia K/D" value={player.diff} detail={`${player.kills} K · ${player.deaths} D`} />
          </div>
        </section>

        <section className="s4n-card s4n-section mt-4 rounded-[1.35rem] border border-white/10 p-4 sm:p-5">
          <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-400">
                Habilidades
              </p>

              <div className="mt-3 flex justify-center">
                <RadarChart
                  values={[
                    { label: "Firepower", value: firepower },
                    { label: "Opening", value: opening },
                    { label: "Trading", value: trading },
                    { label: "Utility", value: utility },
                    { label: "Consistency", value: consistency },
                    { label: "Clutching", value: clutching },
                  ]}
                  points={radarPoints}
                />
              </div>
            </div>

            <div>
              <PlayerComparison
                currentPlayer={player}
                players={ranking}
                avatarMap={avatarMap}
              />
            </div>
          </div>
        </section>

        <PlayerAIAnalyst player={player} />

        <div className="mt-5 grid gap-3">
          <CompactDetails
            icon="📈"
            title="Evolución del jugador"
            subtitle="Selector de Rating, ADR y K/D por partida"
          >
            <PlayerCharts data={chartData} />
          </CompactDetails>

          <CompactDetails
            icon="🗺️"
            title="Rendimiento por mapa"
            subtitle="Rating, K/D, KAST, ADR, winrate y partidas por mapa"
          >
            <MapPerformanceTable maps={player.mapStats || []} />
          </CompactDetails>

          <CompactDetails
            icon="🔫"
            title="Kills por arma"
            subtitle="Desglose de kills por cada arma"
          >
            <div className="grid gap-3 md:grid-cols-4">
              {Object.entries(player.weapons || {})
                .sort((a, b) => Number(b[1]) - Number(a[1]))
                .slice(0, 12)
                .map(([weapon, kills]) => (
                  <div
                    key={weapon}
                    className="rounded-xl border border-white/10 bg-black/35 p-4"
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
          </CompactDetails>

          <CompactDetails
            icon="📊"
            title="Estadísticas avanzadas"
            subtitle="Impact, entry, trades, daño y utilidad"
          >
            <div className="grid gap-3 md:grid-cols-5">
              <Card title="HS%" value={`${player.hsPercent}%`} />
              <Card title="Diff" value={player.diff} />
              <Card title="Kills" value={player.kills} />
              <Card title="Deaths" value={player.deaths} />
              <Card title="Assists" value={player.assists} />
              <Card title="Entry Kills" value={player.entryKills} />
              <Card title="Entry Deaths" value={player.entryDeaths} />
              <Card title="Entry Ratio" value={player.entryRatio} />
              <Card title="Opening Duel Win%" value={`${player.openingDuelWinPercent}%`} />
              <Card title="First Kill%" value={`${player.firstKillPercent}%`} />
              <Card title="Trade Kill%" value={`${player.tradeKillPercent}%`} />
              <Card title="Trade Kills" value={player.tradeKills} />
              <Card title="Clutches" value={player.totalClutches} />
              <Card title="Bait Rounds" value={player.baitRounds} />
              <Card title="HE Damage" value={player.heDamage} />
              <Card title="Flash Assists" value={player.flashAssists} />
              <Card title="Molotov Damage" value={player.molotovDamage} />
            </div>
          </CompactDetails>

          <CompactDetails
            icon="📜"
            title="Historial de partidas"
            subtitle="Todas las partidas jugadas"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-black/25">
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
                    const result = getRecentResult(match);

                    return (
                      <tr
                        key={match.demoFile}
                        className="border-t border-white/10 text-sm text-zinc-200"
                      >
                        <td className="px-4 py-3 font-black text-yellow-400">
                          {cleanMapName(match.map)}
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
                            result === "W"
                              ? "px-4 py-3 font-black text-emerald-400"
                              : "px-4 py-3 font-black text-red-400"
                          }
                        >
                          {result === "W" ? "WIN" : "LOSS"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CompactDetails>
        </div>

        <footer className="py-8 text-center">
          <p className="text-3xl font-black">
            <span className="text-red-500">S4</span>
            <span className="text-yellow-400">N</span>
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            © 2026 Conardos DownLeague. Liga privada de amigos.
          </p>
        </footer>
      </section>
    </main>
  );
}

function RecordCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">
        {title}
      </p>
      <p className="mt-2 text-2xl font-black text-yellow-400">{value}</p>
      <p className="mt-1 text-xs text-zinc-400">{detail}</p>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/35 p-4">
      <p className="text-xs uppercase tracking-wider text-zinc-500">{title}</p>
      <p className="mt-2 text-xl font-black text-red-400">{value}</p>
    </div>
  );
}

function MiniStat({
  title,
  value,
  icon,
}: {
  title: string | number;
  value: string | number;
  icon?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/35 p-3">
      {icon && <p className="text-lg">{icon}</p>}
      <p className="text-[11px] uppercase tracking-widest text-zinc-500">
        {title}
      </p>
      <p className="mt-1 text-lg font-black text-red-400">{value}</p>
    </div>
  );
}

function KeyStatCard({ stat }: { stat: any }) {
  const toneClass =
    stat.tone === "yellow"
      ? "border-yellow-500/50 text-yellow-400"
      : stat.tone === "green"
      ? "border-emerald-500/40 text-emerald-400"
      : stat.tone === "purple"
      ? "border-violet-500/40 text-violet-400"
      : stat.tone === "blue"
      ? "border-blue-500/40 text-blue-400"
      : stat.tone === "orange"
      ? "border-orange-500/40 text-orange-400"
      : "border-red-500/40 text-red-400";

  return (
    <div className={`rounded-xl border bg-black/35 p-4 text-center ${toneClass}`}>
      <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
        {stat.title}
      </p>
      <p className="mt-3 text-3xl font-black">{stat.value}</p>
      <p className="mt-3 text-xs text-zinc-500">{stat.sub}</p>
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
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
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

function CompactDetails({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <details className="s4n-card rounded-[1.25rem] border border-white/10 p-5">
      <summary className="cursor-pointer list-none">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-400">
                {title}
              </p>
              <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
            </div>
          </div>

          <span className="rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm font-bold text-zinc-300">
            Ver detalles
          </span>
        </div>
      </summary>

      <div className="mt-5">{children}</div>
    </details>
  );
}

function CompareRow({
  label,
  left,
  right,
}: {
  label: string;
  left: string | number;
  right: string | number;
}) {
  const leftNum = Number(String(left).replace("%", ""));
  const rightNum = Number(String(right).replace("%", ""));
  const leftWins = !Number.isNaN(leftNum) && !Number.isNaN(rightNum) && leftNum >= rightNum;
  const rightWins = !Number.isNaN(leftNum) && !Number.isNaN(rightNum) && rightNum > leftNum;

  return (
    <div className="grid grid-cols-[1fr_90px_1fr] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className={`text-right text-sm font-black ${leftWins ? "text-yellow-400" : "text-zinc-300"}`}>
        {left}
      </p>

      <p className="text-center text-[11px] font-black uppercase tracking-widest text-zinc-500">
        {label}
      </p>

      <p className={`text-left text-sm font-black ${rightWins ? "text-blue-400" : "text-zinc-300"}`}>
        {right}
      </p>
    </div>
  );
}

function RadarChart({
  values,
  points,
}: {
  values: { label: string; value: number }[];
  points: string;
}) {
  return (
    <div className="relative h-[230px] w-full max-w-[340px]">
      <svg viewBox="0 0 220 220" className="mx-auto h-[210px] w-[210px]">
        {[82, 66, 50, 34, 18].map((radius) => (
          <circle
            key={radius}
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="1"
          />
        ))}

        {[0, 60, 120, 180, 240, 300].map((angle) => {
          const radians = (Math.PI / 180) * (angle - 90);
          const x = 110 + 82 * Math.cos(radians);
          const y = 110 + 82 * Math.sin(radians);

          return (
            <line
              key={angle}
              x1="110"
              y1="110"
              x2={x}
              y2={y}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
            />
          );
        })}

        <polygon
          points={points}
          fill="rgba(250,204,21,0.35)"
          stroke="#facc15"
          strokeWidth="3"
        />

        {points.split(" ").map((point) => {
          const [x, y] = point.split(",");

          return (
            <circle
              key={point}
              cx={x}
              cy={y}
              r="4"
              fill="#facc15"
              stroke="#111827"
              strokeWidth="2"
            />
          );
        })}
      </svg>

      <div className="absolute left-1/2 top-0 -translate-x-1/2 text-center">
        <RadarLabel item={values[0]} />
      </div>
      <div className="absolute right-0 top-[72px] text-right">
        <RadarLabel item={values[1]} />
      </div>
      <div className="absolute bottom-[46px] right-3 text-right">
        <RadarLabel item={values[2]} />
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <RadarLabel item={values[3]} />
      </div>
      <div className="absolute bottom-[46px] left-3 text-left">
        <RadarLabel item={values[4]} />
      </div>
      <div className="absolute left-0 top-[72px] text-left">
        <RadarLabel item={values[5]} />
      </div>
    </div>
  );
}

function RadarLabel({ item }: { item: { label: string; value: number } }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-widest text-zinc-300">
        {item.label}
      </p>
      <p className="text-xs font-black text-yellow-400">
        {Math.round(item.value)}/100
      </p>
    </div>
  );
}
