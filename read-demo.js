const fs = require("fs");
const path = require("path");
const demoparser = require("@laihoe/demoparser2");

const demoFolder = path.join(__dirname, "demos");
const outputFolder = path.join(__dirname, "data", "matches");
const files = fs.readdirSync(demoFolder).filter((file) => file.endsWith(".dem"));
const demoPath = path.join(demoFolder, files[0]);

const header = demoparser.parseHeader(demoPath);
const players = demoparser.parsePlayerInfo(demoPath);

const roundEvents = demoparser.parseEvents(demoPath, [
  "round_announce_match_start",
  "round_freeze_end",
  "round_end",
]);

const matchStartEvents = roundEvents.filter(
  (event) => event.event_name === "round_announce_match_start"
);

const MATCH_START_TICK = matchStartEvents.at(-1).tick;

const officialRoundEnds = roundEvents.filter(
  (event) => event.event_name === "round_end" && event.tick >= MATCH_START_TICK
);

const MATCH_END_TICK = officialRoundEnds.at(-1).tick;

const freezeEnds = roundEvents.filter(
  (event) =>
    event.event_name === "round_freeze_end" &&
    event.tick >= MATCH_START_TICK &&
    event.tick <= MATCH_END_TICK
);

const rounds = officialRoundEnds.map((roundEnd, index) => {
  const freezeEnd = freezeEnds[index];

  return {
    number: index + 1,
    startTick: freezeEnd ? freezeEnd.tick : MATCH_START_TICK,
    endTick: roundEnd.tick,
    winnerSide: roundEnd.winner,
    reason: roundEnd.reason,
  };
});

const deaths = demoparser.parseEvents(demoPath, ["player_death"]);
const hurts = demoparser.parseEvents(demoPath, ["player_hurt"]);

const stats = {};

players.forEach((player) => {
  stats[player.name] = {
    name: player.name,
    steamid: player.steamid,
    team: player.team_number,
    kills: 0,
    assists: 0,
    deaths: 0,
    headshots: 0,
    damage: 0,
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
  };
});

function cleanName(name) {
  return name || "";
}

function isValidEnemyAction(attacker, victim) {
  return (
    attacker &&
    victim &&
    attacker !== victim &&
    stats[attacker] &&
    stats[victim] &&
    stats[attacker].team !== stats[victim].team
  );
}

rounds.forEach((round) => {
  const roundDeaths = deaths
    .filter((event) => event.tick >= round.startTick && event.tick <= round.endTick)
    .sort((a, b) => a.tick - b.tick);

  const validKills = roundDeaths.filter((event) => {
    const killer = cleanName(event.attacker_name);
    const victim = cleanName(event.user_name);

    return isValidEnemyAction(killer, victim) && event.weapon !== "world";
  });

  const lastVictimByTeam = {};

  validKills.forEach((event) => {
    const killer = cleanName(event.attacker_name);
    const victim = cleanName(event.user_name);
    const assister = cleanName(event.assister_name);

    stats[killer].kills++;

    if (event.headshot) stats[killer].headshots++;
    if (event.weapon === "awp") stats[killer].awpKills++;

    stats[victim].deaths++;
    lastVictimByTeam[stats[victim].team] = victim;

    if (
      assister &&
      stats[assister] &&
      assister !== killer &&
      stats[assister].team !== stats[victim].team
    ) {
      stats[assister].assists++;
    }
  });

  Object.values(lastVictimByTeam).forEach((playerName) => {
    if (stats[playerName]) stats[playerName].baitRounds++;
  });

  const firstKill = validKills[0];

  if (firstKill) {
    const entryKiller = cleanName(firstKill.attacker_name);
    const entryVictim = cleanName(firstKill.user_name);

    if (stats[entryKiller]) stats[entryKiller].entryKills++;
    if (stats[entryVictim]) stats[entryVictim].entryDeaths++;
  }

  const killsByPlayer = {};

  validKills.forEach((event) => {
    const killer = cleanName(event.attacker_name);
    killsByPlayer[killer] = (killsByPlayer[killer] || 0) + 1;
  });

  Object.entries(killsByPlayer).forEach(([playerName, kills]) => {
    if (!stats[playerName]) return;

    if (kills === 2) stats[playerName].twoKs++;
    if (kills === 3) stats[playerName].threeKs++;
    if (kills === 4) stats[playerName].fourKs++;
    if (kills >= 5) stats[playerName].aces++;
  });

  const aliveByTeam = {};

  players.forEach((player) => {
    if (!aliveByTeam[player.team_number]) {
      aliveByTeam[player.team_number] = new Set();
    }

    aliveByTeam[player.team_number].add(player.name);
  });

  let clutchCandidate = null;
  let clutchSize = 0;

  validKills.forEach((event) => {
    const killer = cleanName(event.attacker_name);
    const victim = cleanName(event.user_name);

    if (!stats[killer] || !stats[victim]) return;

    const killerTeam = stats[killer].team;
    const victimTeam = stats[victim].team;

    aliveByTeam[victimTeam].delete(victim);

    const killerTeamAlive = aliveByTeam[killerTeam].size;
    const enemyTeamAlive = aliveByTeam[victimTeam].size;

    if (killerTeamAlive === 1 && enemyTeamAlive >= 1 && enemyTeamAlive <= 5) {
      clutchCandidate = [...aliveByTeam[killerTeam]][0];
      clutchSize = enemyTeamAlive;
    }
  });

  if (clutchCandidate && stats[clutchCandidate]) {
    if (clutchSize === 1) stats[clutchCandidate].clutch1v1++;
    if (clutchSize === 2) stats[clutchCandidate].clutch1v2++;
    if (clutchSize === 3) stats[clutchCandidate].clutch1v3++;
    if (clutchSize === 4) stats[clutchCandidate].clutch1v4++;
    if (clutchSize === 5) stats[clutchCandidate].clutch1v5++;
  }
});

rounds.forEach((round) => {
  const hpByPlayer = {};

  players.forEach((player) => {
    hpByPlayer[player.name] = 100;
  });

  const roundHurts = hurts
    .filter((event) => event.tick >= round.startTick && event.tick <= round.endTick)
    .sort((a, b) => a.tick - b.tick);

  roundHurts.forEach((event) => {
    const attacker = cleanName(event.attacker_name);
    const victim = cleanName(event.user_name);

    if (!isValidEnemyAction(attacker, victim)) return;

    const previousHp = hpByPlayer[victim] ?? 100;
    const currentHp =
      event.health ?? Math.max(0, previousHp - (event.dmg_health || 0));

    const realDamage = Math.max(0, previousHp - currentHp);

    stats[attacker].damage += realDamage;
    hpByPlayer[victim] = currentHp;
  });
});

const playerStats = Object.values(stats).map((player) => {
  const kd = player.deaths === 0 ? player.kills : player.kills / player.deaths;
  const hsPercent = player.kills === 0 ? 0 : (player.headshots / player.kills) * 100;
  const adr = rounds.length === 0 ? 0 : player.damage / rounds.length;
  const diff = player.kills - player.deaths;
  const entryRatio =
    player.entryDeaths === 0 ? player.entryKills : player.entryKills / player.entryDeaths;

  const totalClutches =
    player.clutch1v1 +
    player.clutch1v2 +
    player.clutch1v3 +
    player.clutch1v4 +
    player.clutch1v5;

  const rating =
    0.35 * kd +
    0.3 * (adr / 100) +
    0.1 * (hsPercent / 100) +
    0.15 * (entryRatio / 2) +
    0.1 * (totalClutches / Math.max(1, rounds.length));

  const mvpScore =
    player.kills +
    player.assists * 0.5 +
    adr * 0.03 +
    diff * 0.8 +
    player.entryKills * 0.7 +
    totalClutches * 2;

  return {
    ...player,
    diff,
    kd: Number(kd.toFixed(2)),
    hsPercent: Number(hsPercent.toFixed(2)),
    adr: Number(adr.toFixed(2)),
    entryRatio: Number(entryRatio.toFixed(2)),
    totalClutches,
    ratingS4N: Number(rating.toFixed(2)),
    mvpScore: Number(mvpScore.toFixed(2)),
  };
});

const teamSummary = {};

playerStats.forEach((player) => {
  if (!teamSummary[player.team]) {
    teamSummary[player.team] = {
      team: player.team,
      kills: 0,
      deaths: 0,
      diff: 0,
    };
  }

  teamSummary[player.team].kills += player.kills;
  teamSummary[player.team].deaths += player.deaths;
  teamSummary[player.team].diff += player.diff;
});

const teams = Object.values(teamSummary).sort((a, b) => b.diff - a.diff);
const winnerTeam = teams[0]?.diff > teams[1]?.diff ? teams[0].team : null;

const mvp = [...playerStats].sort((a, b) => b.mvpScore - a.mvpScore)[0];

const matchResult = {
  demoFile: path.basename(demoPath),
  map: header.map_name,
  server: header.server_name,
  officialStartTick: MATCH_START_TICK,
  officialEndTick: MATCH_END_TICK,
  rounds: rounds.length,
  winnerTeam,
  teamSummary: teams,
  mvp: {
    name: mvp.name,
    steamid: mvp.steamid,
    mvpScore: mvp.mvpScore,
  },
  players: playerStats.sort((a, b) => b.ratingS4N - a.ratingS4N),
  createdAt: new Date().toISOString(),
};

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

const demoBaseName = path.basename(demoPath, ".dem");

const safeFileName = `${demoBaseName}.json`;
const outputPath = path.join(outputFolder, safeFileName);

fs.writeFileSync(outputPath, JSON.stringify(matchResult, null, 2), "utf8");

console.log("\n=== CS2 Stats4Newbas ===\n");
console.log(`Demo: ${matchResult.demoFile}`);
console.log(`Mapa: ${matchResult.map}`);
console.log(`Rondas: ${matchResult.rounds}`);
console.log(`Winner Team estimado: ${matchResult.winnerTeam}`);
console.log(`MVP: ${matchResult.mvp.name}`);
console.log(`Archivo guardado: ${outputPath}`);

console.log("\n=== SCOREBOARD FINAL ===\n");

matchResult.players.forEach((p) => {
  console.log(
    `${p.name} | Rating:${p.ratingS4N} | Team:${p.team} | K:${p.kills} A:${p.assists} D:${p.deaths} | ADR:${p.adr} | Entry:${p.entryKills}/${p.entryDeaths} | Bait:${p.baitRounds} | Clutch:${p.totalClutches} | WR base:${p.team === winnerTeam ? "WIN" : "LOSS"}`
  );
});