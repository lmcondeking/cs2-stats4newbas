const fs = require("fs");
const path = require("path");

const matchesFolder = path.join(__dirname, "data", "matches");

const files = fs
  .readdirSync(matchesFolder)
  .filter((file) => file.endsWith(".json"));

const totals = {};
const history = [];

files.forEach((file) => {
  const filePath = path.join(matchesFolder, file);
  const match = JSON.parse(fs.readFileSync(filePath, "utf8"));

  history.push({
    file,
    map: match.map,
    rounds: match.rounds,
    winnerTeam: match.winnerTeam,
    mvp: match.mvp?.name || "Sin MVP",
    createdAt: match.createdAt,
  });

  match.players.forEach((player) => {
    const id = player.steamid;

    if (!totals[id]) {
      totals[id] = {
        name: player.name,
        steamid: id,
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
        awpKills: 0,
        twoKs: 0,
        threeKs: 0,
        fourKs: 0,
        aces: 0,
        clutch1v1: 0,
        clutch1v2: 0,
        clutch1v3: 0,
        clutch1v4: 0,
        clutch1v5: 0,
        baitRounds: 0,
        aliases: new Set(),
      };
    }

    const total = totals[id];

    total.name = player.name;
    total.aliases.add(player.name);

    total.matches++;
    total.kills += player.kills || 0;
    total.assists += player.assists || 0;
    total.deaths += player.deaths || 0;
    total.headshots += player.headshots || 0;
    total.damage += player.damage || 0;
    total.rounds += match.rounds || 0;
    total.entryKills += player.entryKills || 0;
    total.entryDeaths += player.entryDeaths || 0;
    total.awpKills += player.awpKills || 0;
    total.twoKs += player.twoKs || 0;
    total.threeKs += player.threeKs || 0;
    total.fourKs += player.fourKs || 0;
    total.aces += player.aces || 0;
    total.clutch1v1 += player.clutch1v1 || 0;
    total.clutch1v2 += player.clutch1v2 || 0;
    total.clutch1v3 += player.clutch1v3 || 0;
    total.clutch1v4 += player.clutch1v4 || 0;
    total.clutch1v5 += player.clutch1v5 || 0;
    total.baitRounds += player.baitRounds || 0;

    if (match.winnerTeam && player.team === match.winnerTeam) {
      total.wins++;
    } else if (match.winnerTeam) {
      total.losses++;
    }

    if (match.mvp && match.mvp.steamid === player.steamid) {
      total.mvps++;
    }
  });
});

const ranking = Object.values(totals).map((p) => {
  const kd = p.deaths === 0 ? p.kills : p.kills / p.deaths;
  const hsPercent = p.kills === 0 ? 0 : (p.headshots / p.kills) * 100;
  const adr = p.rounds === 0 ? 0 : p.damage / p.rounds;
  const entryRatio =
    p.entryDeaths === 0 ? p.entryKills : p.entryKills / p.entryDeaths;
  const totalClutches =
    p.clutch1v1 + p.clutch1v2 + p.clutch1v3 + p.clutch1v4 + p.clutch1v5;
  const winrate = p.matches === 0 ? 0 : (p.wins / p.matches) * 100;

  const rating =
    0.35 * kd +
    0.3 * (adr / 100) +
    0.1 * (hsPercent / 100) +
    0.15 * (entryRatio / 2) +
    0.1 * (totalClutches / Math.max(1, p.rounds));

  return {
    ...p,
    aliases: Array.from(p.aliases),
    diff: p.kills - p.deaths,
    kd: Number(kd.toFixed(2)),
    hsPercent: Number(hsPercent.toFixed(2)),
    adr: Number(adr.toFixed(2)),
    entryRatio: Number(entryRatio.toFixed(2)),
    totalClutches,
    winrate: Number(winrate.toFixed(2)),
    ratingS4N: Number(rating.toFixed(2)),
  };
});

function printSection(title, list, builder) {
  console.log(`\n=== ${title} ===\n`);
  list.forEach((p, i) => console.log(`${i + 1}. ${builder(p)}`));
}

console.log("\n=== CS2 Stats4Newbas - HISTÓRICO COMPLETO ===\n");
console.log(`Partidas analizadas: ${files.length}`);

printSection(
  "Ranking Rating S4N",
  [...ranking].sort((a, b) => b.ratingS4N - a.ratingS4N),
  (p) =>
    `${p.name} | Rating:${p.ratingS4N} | PJ:${p.matches} | WR:${p.winrate}% | MVP:${p.mvps} | K:${p.kills} A:${p.assists} D:${p.deaths} | ADR:${p.adr} | K/D:${p.kd}`
);

printSection(
  "Rey del Bait",
  [...ranking].sort((a, b) => b.baitRounds - a.baitRounds),
  (p) => `${p.name} | Último vivo/muerto del team:${p.baitRounds}`
);

printSection(
  "Mejor Entry Fragger",
  [...ranking].sort((a, b) => b.entryKills - a.entryKills),
  (p) =>
    `${p.name} | Entry Kills:${p.entryKills} | Entry Deaths:${p.entryDeaths} | Entry Ratio:${p.entryRatio}`
);

printSection(
  "Clutch King",
  [...ranking].sort((a, b) => b.totalClutches - a.totalClutches),
  (p) =>
    `${p.name} | Total:${p.totalClutches} | 1v1:${p.clutch1v1} 1v2:${p.clutch1v2} 1v3:${p.clutch1v3} 1v4:${p.clutch1v4} 1v5:${p.clutch1v5}`
);

printSection(
  "Winrate por Jugador",
  [...ranking].sort((a, b) => b.winrate - a.winrate),
  (p) =>
    `${p.name} | PJ:${p.matches} | PG:${p.wins} | PP:${p.losses} | WR:${p.winrate}%`
);

printSection(
  "Aliases detectados",
  [...ranking].sort((a, b) => b.aliases.length - a.aliases.length),
  (p) => `${p.name} | SteamID:${p.steamid} | Aliases:${p.aliases.join(", ")}`
);

printSection(
  "Historial de Partidas",
  history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  (m) =>
    `${m.map} | Rondas:${m.rounds} | Winner Team:${m.winnerTeam} | MVP:${m.mvp} | Archivo:${m.file}`
);