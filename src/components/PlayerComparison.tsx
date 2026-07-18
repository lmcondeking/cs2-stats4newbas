"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Player = Record<string, any>;

type Props = {
  currentPlayer: Player;
  players: Player[];
  avatarMap: Record<string, string>;
};

const metrics = [
  { key: "ratingS4N", label: "Rating", scale: 2 },
  { key: "kd", label: "K/D", scale: 2 },
  { key: "adr", label: "ADR", scale: 140 },
  { key: "kastPercent", label: "KAST", scale: 100, suffix: "%" },
  { key: "impactRating", label: "Impact", scale: 2 },
  { key: "openingDuelWinPercent", label: "Opening", scale: 100, suffix: "%" },
  { key: "tradeKillPercent", label: "Trade", scale: 100, suffix: "%" },
  { key: "hsPercent", label: "HS", scale: 100, suffix: "%" },
];

function avatar(steamid: string, avatarMap: Record<string, string>) {
  return avatarMap[String(steamid)] || "/avatars/default.png";
}

export default function PlayerComparison({
  currentPlayer,
  players,
  avatarMap,
}: Props) {
  const rivals = players.filter(
    (player) => String(player.steamid) !== String(currentPlayer.steamid)
  );

  const defaultRival =
    rivals
      .slice()
      .sort(
        (a, b) =>
          Math.abs(Number(a.ratingS4N || 0) - Number(currentPlayer.ratingS4N || 0)) -
          Math.abs(Number(b.ratingS4N || 0) - Number(currentPlayer.ratingS4N || 0))
      )[0] || null;

  const [selectedId, setSelectedId] = useState(
    defaultRival ? String(defaultRival.steamid) : ""
  );

  const rival = useMemo(
    () => rivals.find((player) => String(player.steamid) === selectedId) || defaultRival,
    [defaultRival, rivals, selectedId]
  );

  if (!rival) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-zinc-400">
        No hay otro jugador disponible para comparar.
      </div>
    );
  }

  const currentWins = metrics.filter(
    (metric) => Number(currentPlayer[metric.key] || 0) >= Number(rival[metric.key] || 0)
  ).length;

  return (
    <section className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-400">
            Comparador dinámico
          </p>
          <h3 className="mt-1 text-lg font-black text-white">Duelo estadístico</h3>
        </div>

        <label className="min-w-[220px]">
          <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-zinc-500">
            Comparar con
          </span>
          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0a101a] px-3 py-2 text-sm font-black text-white outline-none focus:border-yellow-500/50"
          >
            {rivals.map((player) => (
              <option key={player.steamid} value={String(player.steamid)}>
                {player.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <PlayerHead player={currentPlayer} avatarMap={avatarMap} accent="yellow" />
        <div className="text-center">
          <span className="rounded-full border border-red-500/35 bg-red-500/10 px-3 py-1 text-xs font-black text-red-300">
            {currentWins}–{metrics.length - currentWins}
          </span>
          <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            métricas
          </p>
        </div>
        <PlayerHead player={rival} avatarMap={avatarMap} accent="blue" />
      </div>

      <div className="mt-5 grid gap-3">
        {metrics.map((metric) => (
          <VersusMetric
            key={metric.key}
            label={metric.label}
            left={Number(currentPlayer[metric.key] || 0)}
            right={Number(rival[metric.key] || 0)}
            scale={metric.scale}
            suffix={metric.suffix}
          />
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          href={`/player/${rival.steamid}`}
          className="text-xs font-black uppercase tracking-widest text-yellow-300 transition hover:text-yellow-200"
        >
          Abrir perfil rival →
        </Link>
      </div>
    </section>
  );
}

function PlayerHead({
  player,
  avatarMap,
  accent,
}: {
  player: Player;
  avatarMap: Record<string, string>;
  accent: "yellow" | "blue";
}) {
  return (
    <div className="text-center">
      <div
        className={`relative mx-auto h-14 w-14 overflow-hidden rounded-full border-2 ${
          accent === "yellow" ? "border-yellow-500/60" : "border-blue-500/60"
        }`}
      >
        <Image
          src={avatar(String(player.steamid), avatarMap)}
          alt={player.name}
          fill
          sizes="56px"
          className="object-cover"
        />
      </div>
      <p className="mt-2 max-w-[150px] truncate text-xs font-black text-white">{player.name}</p>
      <p className="text-xs text-zinc-500">GC {player.gcLevel || "–"}</p>
    </div>
  );
}

function VersusMetric({
  label,
  left,
  right,
  scale,
  suffix = "",
}: {
  label: string;
  left: number;
  right: number;
  scale: number;
  suffix?: string;
}) {
  const leftWidth = Math.min(100, (left / scale) * 100);
  const rightWidth = Math.min(100, (right / scale) * 100);
  const leftWins = left >= right;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-3">
      <div className="mb-2 grid grid-cols-[1fr_72px_1fr] items-center gap-3">
        <p className={`text-right text-sm font-black ${leftWins ? "text-yellow-400" : "text-zinc-300"}`}>
          {left}{suffix}
        </p>
        <p className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
          {label}
        </p>
        <p className={`text-left text-sm font-black ${!leftWins ? "text-blue-400" : "text-zinc-300"}`}>
          {right}{suffix}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex h-2 justify-end overflow-hidden rounded-full bg-white/10">
          <span
            className="h-full rounded-full bg-yellow-400"
            style={{ width: `${leftWidth}%` }}
          />
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <span
            className="block h-full rounded-full bg-blue-500"
            style={{ width: `${rightWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}
