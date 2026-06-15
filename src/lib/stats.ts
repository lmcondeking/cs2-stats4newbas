import fs from "fs";
import path from "path";

type FavoriteWeapon = {
  weapon: string;
  kills: number;
} | null;

type Player = {
  name: string;
  steamid: string;
  team: number;

  kills: number;
  assists: number;
  deaths: number;
  headshots: number;
  damage: number;

  diff: number;
  kd: number;
  hsPercent: number;
  adr: number;
  ratingS4N?: number;

  entryKills?: number;
  entryDeaths?: number;
  entryRatio?: number;

  totalClutches?: number;
  baitRounds?: number;

  kastPercent?: number;
  impactRating?: number;

  openingKills?: number;
  openingDeaths?: number;
  openingDuels?: number;
  openingDuelWinPercent?: number;
  firstKillPercent?: number;

  tradeKills?: number;
  tradeOpportunities?: number;
  tradeKillPercent?: number;

  heDamage?: number;
  flashAssists?: number;
  molotovDamage?: number;

  ctKills?: number;
  ctDeaths?: number;
  tKills?: number;
  tDeaths?: number;
  ctKd?: number;
  tKd?: number;

  weapons?: Record<string, number>;
  favoriteWeapon?: FavoriteWeapon;

  recentMatches?: {
    demoFile: string;
    map: string;
    rounds: number;
    result: "WIN" | "LOSS" | "N/A";
    kills: number;
    assists: number;
    deaths: number;
    adr: number;
    kd: number;
    ratingS4N: number;
  }[];
  recentResults?: ("WIN" | "LOSS" | "N/A")[];
  recentRating?: number;
  previousRating?: number;
  formDelta?: number;
  formStatus?: "EN FORMA" | "ESTABLE" | "EN BAJA";
};

type Match = {
  demoFile: string;
  map: string;
  rounds: number;
  winnerTeam?: number;
  mvp?: {
    name: string;
    steamid: string;
    mvpScore: number;
  };
  players: Player[];
  createdAt: string;
};

const allowedSteamIds = [
  "76561198810129628",
  "76561199037068708",
  "76561198827102122",
  "76561199082720391",
  "76561198072925518",
  "76561198051821859",
];

const RATING_SCALE = 1.3;

function roundNumber(value: number, decimals = 2) {
  return Number(value.toFixed(decimals));
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function calculateRatingS4N({
  kd,
  adr,
  hsPercent,
  entryRatio,
  clutches,
  rounds,
}: {
  kd: number;
  adr: number;
  hsPercent: number;
  entryRatio: number;
  clutches: number;
  rounds: number;
}) {
  const rawRatingS4N =
    0.4 * kd +
    0.25 * (adr / 100) +
    0.15 * (hsPercent / 100) +
    0.1 * (entryRatio / 2) +
    0.1 * (clutches / Math.max(1, rounds));

  return rawRatingS4N * RATING_SCALE;
}

export function getDashboardStats() {
  const matchesFolder = path.join(process.cwd(), "data", "matches");

  if (!fs.existsSync(matchesFolder)) {
    return {
      matches: [],
      ranking: [],
      mvpLeader: null,
      entryLeader: null,
      clutchLeader: null,
      baitLeader: null,
    };
  }

  const files = fs
    .readdirSync(matchesFolder)
    .filter((file) => file.endsWith(".json"));

  const matches: Match[] = files.map((file) => {
    const filePath = path.join(matchesFolder, file);
    const match = JSON.parse(fs.readFileSync(filePath, "utf8"));

    return {
      ...match,
      players: match.players.filter((player: Player) =>
        allowedSteamIds.includes(String(player.steamid))
      ),
    };
  });

  const totals: Record<string, any> = {};

  matches.forEach((match) => {
    match.players.forEach((player) => {
      if (!allowedSteamIds.includes(String(player.steamid))) return;

      if (!totals[player.steamid]) {
        totals[player.steamid] = {
          name: player.name,
          steamid: player.steamid,

          matches: 0,
          wins: 0,
          losses: 0,
          mvps: 0,

          kills: 0,
          assists: 0,
          deaths: 0,
          headshots: 0,
          damage: 0,
          rounds: 0,

          entryKills: 0,
          entryDeaths: 0,

          totalClutches: 0,
          baitRounds: 0,

          kastRoundsEstimated: 0,

          openingKills: 0,
          openingDeaths: 0,
          openingDuels: 0,

          tradeKills: 0,

          heDamage: 0,
          flashAssists: 0,
          molotovDamage: 0,

          ctKills: 0,
          ctDeaths: 0,
          tKills: 0,
          tDeaths: 0,

          weapons: {},
          mapStats: {},
          recentMatches: [],
        };
      }

      const total = totals[player.steamid];

      total.name = player.name;
      total.matches++;

      total.kills += player.kills || 0;
      total.assists += player.assists || 0;
      total.deaths += player.deaths || 0;
      total.headshots += player.headshots || 0;
      total.damage += player.damage || 0;
      total.rounds += match.rounds || 0;

      total.entryKills += player.entryKills || 0;
      total.entryDeaths += player.entryDeaths || 0;

      total.totalClutches += player.totalClutches || 0;
      total.baitRounds += player.baitRounds || 0;

      total.openingKills += player.openingKills || 0;
      total.openingDeaths += player.openingDeaths || 0;
      total.openingDuels += player.openingDuels || 0;

      total.tradeKills += player.tradeKills || 0;

      total.heDamage += player.heDamage || 0;
      total.flashAssists += player.flashAssists || 0;
      total.molotovDamage += player.molotovDamage || 0;

      total.ctKills += player.ctKills || 0;
      total.ctDeaths += player.ctDeaths || 0;
      total.tKills += player.tKills || 0;
      total.tDeaths += player.tDeaths || 0;

      const playerKastRounds =
        ((player.kastPercent || 0) / 100) * (match.rounds || 0);

      total.kastRoundsEstimated += playerKastRounds;

      const matchKd =
        (player.deaths || 0) === 0
          ? player.kills || 0
          : (player.kills || 0) / (player.deaths || 1);

      const matchAdr =
        match.rounds === 0 ? 0 : (player.damage || 0) / (match.rounds || 1);

      const matchHsPercent =
        (player.kills || 0) === 0
          ? 0
          : ((player.headshots || 0) / (player.kills || 1)) * 100;

      const matchEntryRatio =
        (player.entryDeaths || 0) === 0
          ? player.entryKills || 0
          : (player.entryKills || 0) / (player.entryDeaths || 1);

      const matchRatingS4N = calculateRatingS4N({
        kd: matchKd,
        adr: matchAdr,
        hsPercent: matchHsPercent,
        entryRatio: matchEntryRatio,
        clutches: player.totalClutches || 0,
        rounds: match.rounds || 0,
      });

      const result = match.winnerTeam
        ? player.team === match.winnerTeam
          ? "WIN"
          : "LOSS"
        : "N/A";

      total.recentMatches.push({
        demoFile: match.demoFile,
        map: match.map,
        rounds: match.rounds || 0,
        result,
        kills: player.kills || 0,
        assists: player.assists || 0,
        deaths: player.deaths || 0,
        adr: roundNumber(matchAdr),
        kd: roundNumber(matchKd),
        ratingS4N: roundNumber(matchRatingS4N),
      });

      if (player.weapons) {
        Object.entries(player.weapons).forEach(([weapon, kills]) => {
          total.weapons[weapon] = (total.weapons[weapon] || 0) + Number(kills);
        });
      }

      if (!total.mapStats[match.map]) {
        total.mapStats[match.map] = {
          map: match.map,
          matches: 0,
          kills: 0,
          assists: 0,
          deaths: 0,
          damage: 0,
          rounds: 0,
          wins: 0,
          losses: 0,
        };
      }

      const mapStat = total.mapStats[match.map];

      mapStat.matches++;
      mapStat.kills += player.kills || 0;
      mapStat.assists += player.assists || 0;
      mapStat.deaths += player.deaths || 0;
      mapStat.damage += player.damage || 0;
      mapStat.rounds += match.rounds || 0;

      if (match.winnerTeam && player.team === match.winnerTeam) {
        total.wins++;
        mapStat.wins++;
      } else if (match.winnerTeam) {
        total.losses++;
        mapStat.losses++;
      }

      if (String(match.mvp?.steamid) === String(player.steamid)) {
        total.mvps++;
      }
    });
  });

  const ranking = Object.values(totals)
    .map((player) => {
      const kd =
        player.deaths === 0 ? player.kills : player.kills / player.deaths;

      const adr = player.rounds === 0 ? 0 : player.damage / player.rounds;

      const hsPercent =
        player.kills === 0 ? 0 : (player.headshots / player.kills) * 100;

      const winrate =
        player.matches === 0 ? 0 : (player.wins / player.matches) * 100;

      const entryRatio =
        player.entryDeaths === 0
          ? player.entryKills
          : player.entryKills / player.entryDeaths;

      const kastPercent =
        player.rounds === 0
          ? 0
          : (player.kastRoundsEstimated / player.rounds) * 100;

      const impactRating =
        player.rounds === 0
          ? 0
          : (player.kills + player.assists) / player.rounds;

      const openingDuelWinPercent =
        player.openingDuels === 0
          ? 0
          : (player.openingKills / player.openingDuels) * 100;

      const firstKillPercent =
        player.rounds === 0 ? 0 : (player.openingKills / player.rounds) * 100;

      const tradeKillPercent =
        player.kills === 0 ? 0 : (player.tradeKills / player.kills) * 100;

      const ctKd =
        player.ctDeaths === 0
          ? player.ctKills
          : player.ctKills / player.ctDeaths;

      const tKd =
        player.tDeaths === 0 ? player.tKills : player.tKills / player.tDeaths;

      const favoriteWeaponEntry = Object.entries(player.weapons).sort(
        (a, b) => Number(b[1]) - Number(a[1])
      )[0];

      const favoriteWeapon = favoriteWeaponEntry
        ? {
            weapon: favoriteWeaponEntry[0],
            kills: Number(favoriteWeaponEntry[1]),
          }
        : null;

      const mapStats = Object.values(player.mapStats).map((map: any) => {
        const mapKd = map.deaths === 0 ? map.kills : map.kills / map.deaths;
        const mapAdr = map.rounds === 0 ? 0 : map.damage / map.rounds;
        const mapWinrate =
          map.matches === 0 ? 0 : (map.wins / map.matches) * 100;

        const mapRating =
          (0.5 * mapKd + 0.5 * (mapAdr / 100)) * RATING_SCALE;

        return {
          ...map,
          kd: Number(mapKd.toFixed(2)),
          adr: Number(mapAdr.toFixed(2)),
          winrate: Number(mapWinrate.toFixed(2)),
          ratingS4N: Number(mapRating.toFixed(2)),
        };
      });

      const bestMap =
        [...mapStats].sort((a: any, b: any) => b.ratingS4N - a.ratingS4N)[0] ||
        null;

      const worstMap =
        [...mapStats].sort((a: any, b: any) => a.ratingS4N - b.ratingS4N)[0] ||
        null;

      const ratingS4N = calculateRatingS4N({
        kd,
        adr,
        hsPercent,
        entryRatio,
        clutches: player.totalClutches,
        rounds: player.rounds,
      });

      const recentMatches = [...player.recentMatches];
      const lastFiveRatings = recentMatches
        .slice(-5)
        .map((match: any) => Number(match.ratingS4N || 0));
      const previousFiveRatings = recentMatches
        .slice(-10, -5)
        .map((match: any) => Number(match.ratingS4N || 0));

      const recentRating = average(lastFiveRatings);
      const previousRating =
        previousFiveRatings.length > 0 ? average(previousFiveRatings) : ratingS4N;
      const formDelta = recentRating - previousRating;
      const formStatus =
        formDelta >= 0.1 ? "EN FORMA" : formDelta <= -0.1 ? "EN BAJA" : "ESTABLE";

      return {
        ...player,
        diff: player.kills - player.deaths,

        kd: Number(kd.toFixed(2)),
        adr: Number(adr.toFixed(2)),
        hsPercent: Number(hsPercent.toFixed(2)),
        winrate: Number(winrate.toFixed(2)),
        entryRatio: Number(entryRatio.toFixed(2)),
        kastPercent: Number(kastPercent.toFixed(2)),
        impactRating: Number(impactRating.toFixed(2)),

        openingDuelWinPercent: Number(openingDuelWinPercent.toFixed(2)),
        firstKillPercent: Number(firstKillPercent.toFixed(2)),
        tradeKillPercent: Number(tradeKillPercent.toFixed(2)),

        ctKd: Number(ctKd.toFixed(2)),
        tKd: Number(tKd.toFixed(2)),

        favoriteWeapon,
        mapStats,
        bestMap,
        worstMap,

        recentMatches,
        recentResults: recentMatches.map((match: any) => match.result),
        recentRating: roundNumber(recentRating),
        previousRating: roundNumber(previousRating),
        formDelta: roundNumber(formDelta),
        formStatus,

        ratingS4N: roundNumber(ratingS4N),
      };
    })
    .sort((a, b) => b.ratingS4N - a.ratingS4N);

  return {
    matches,
    ranking,
    mvpLeader: [...ranking].sort((a, b) => b.mvps - a.mvps)[0] || null,
    entryLeader:
      [...ranking].sort((a, b) => b.entryKills - a.entryKills)[0] || null,
    clutchLeader:
      [...ranking].sort((a, b) => b.totalClutches - a.totalClutches)[0] ||
      null,
    baitLeader:
      [...ranking].sort((a, b) => b.baitRounds - a.baitRounds)[0] || null,
  };
}