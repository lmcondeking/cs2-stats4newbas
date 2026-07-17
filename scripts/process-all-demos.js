const fs = require("fs");
const path = require("path");
const demoparser = require("@laihoe/demoparser2");

const demoFolder = path.join(__dirname, "demos");
const outputFolder = path.join(__dirname, "data", "matches");

const RATING_SCALE = 1.3;
const TRADE_WINDOW_TICKS = 5 * 64;

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

const demoFiles = fs
  .readdirSync(demoFolder)
  .filter((file) => file.endsWith(".dem"));

console.log("\n=== CS2 Stats4Newbas - Procesando demos ===\n");
console.log(`Demos encontradas: ${demoFiles.length}\n`);

function cleanName(name) {
  return name || "";
}

function getSideForRound(team, roundNumber) {
  const firstHalf = roundNumber <= 12;

  if (firstHalf) {
    if (team === 2) return "T";
    if (team === 3) return "CT";
  } else {
    if (team === 2) return "CT";
    if (team === 3) return "T";
  }

  return "UNKNOWN";
}

function addWeaponKill(player, weapon) {
  const safeWeapon = weapon || "unknown";
  player.weapons[safeWeapon] = (player.weapons[safeWeapon] || 0) + 1;
}

demoFiles.forEach((demoFile, index) => {
  try {
    const demoPath = path.join(demoFolder, demoFile);

    console.log(`${index + 1}. Procesando: ${demoFile}`);

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

    if (matchStartEvents.length === 0) {
      console.log("   ❌ No se detectó inicio oficial.\n");
      return;
    }

    const MATCH_START_TICK = matchStartEvents.at(-1).tick;

    const officialRoundEnds = roundEvents.filter(
      (event) =>
        event.event_name === "round_end" && event.tick >= MATCH_START_TICK
    );

    if (officialRoundEnds.length === 0) {
      console.log("   ❌ No se detectaron rondas oficiales.\n");
      return;
    }

    const MATCH_END_TICK = officialRoundEnds.at(-1).tick;

    const freezeEnds = roundEvents.filter(
      (event) =>
        event.event_name === "round_freeze_end" &&
        event.tick >= MATCH_START_TICK &&
        event.tick <= MATCH_END_TICK
    );

    const rounds = officialRoundEnds.map((roundEnd, roundIndex) => {
      const freezeEnd = freezeEnds[roundIndex];

      return {
        number: roundIndex + 1,
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

        openingKills: 0,
        openingDeaths: 0,
        openingDuels: 0,

        tradeKills: 0,
        tradeOpportunities: 0,

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
        kastRounds: 0,

        heDamage: 0,
        flashAssists: 0,
        molotovDamage: 0,

        ctKills: 0,
        ctDeaths: 0,
        tKills: 0,
        tDeaths: 0,

        weapons: {},
      };
    });

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
      const kastRound = {};
      const aliveByTeam = {};

      players.forEach((player) => {
        kastRound[player.name] = {
          kill: false,
          assist: false,
          survived: true,
          traded: false,
        };

        if (!aliveByTeam[player.team_number]) {
          aliveByTeam[player.team_number] = new Set();
        }

        aliveByTeam[player.team_number].add(player.name);
      });

      const roundDeaths = deaths
        .filter(
          (event) =>
            event.tick >= round.startTick && event.tick <= round.endTick
        )
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
        const weapon = event.weapon || "unknown";

        const killerSide = getSideForRound(stats[killer].team, round.number);
        const victimSide = getSideForRound(stats[victim].team, round.number);

        stats[killer].kills++;
        kastRound[killer].kill = true;

        if (killerSide === "CT") stats[killer].ctKills++;
        if (killerSide === "T") stats[killer].tKills++;

        if (event.headshot) stats[killer].headshots++;
        if (weapon === "awp") stats[killer].awpKills++;

        addWeaponKill(stats[killer], weapon);

        stats[victim].deaths++;
        kastRound[victim].survived = false;

        if (victimSide === "CT") stats[victim].ctDeaths++;
        if (victimSide === "T") stats[victim].tDeaths++;

        lastVictimByTeam[stats[victim].team] = victim;

        if (
          assister &&
          stats[assister] &&
          assister !== killer &&
          stats[assister].team !== stats[victim].team
        ) {
          stats[assister].assists++;
          kastRound[assister].assist = true;

          if (event.assistedflash === true || event.assisted_flash === true) {
            stats[assister].flashAssists++;
          }
        }
      });

      Object.values(lastVictimByTeam).forEach((playerName) => {
        if (stats[playerName]) stats[playerName].baitRounds++;
      });

      const firstKill = validKills[0];

      if (firstKill) {
        const entryKiller = cleanName(firstKill.attacker_name);
        const entryVictim = cleanName(firstKill.user_name);

        if (stats[entryKiller]) {
          stats[entryKiller].entryKills++;
          stats[entryKiller].openingKills++;
          stats[entryKiller].openingDuels++;
        }

        if (stats[entryVictim]) {
          stats[entryVictim].entryDeaths++;
          stats[entryVictim].openingDeaths++;
          stats[entryVictim].openingDuels++;
        }
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

      validKills.forEach((deathEvent) => {
        const deadPlayer = cleanName(deathEvent.user_name);
        const killer = cleanName(deathEvent.attacker_name);

        if (!stats[deadPlayer] || !stats[killer]) return;

        const deadTeam = stats[deadPlayer].team;

        const tradeEvent = validKills.find((possibleTrade) => {
          const tradeKiller = cleanName(possibleTrade.attacker_name);
          const tradeVictim = cleanName(possibleTrade.user_name);

          return (
            possibleTrade.tick > deathEvent.tick &&
            possibleTrade.tick - deathEvent.tick <= TRADE_WINDOW_TICKS &&
            tradeVictim === killer &&
            stats[tradeKiller] &&
            stats[tradeKiller].team === deadTeam
          );
        });

        if (tradeEvent) {
          const trader = cleanName(tradeEvent.attacker_name);

          if (stats[trader]) {
            stats[trader].tradeKills++;
            kastRound[deadPlayer].traded = true;
          }
        }

        aliveByTeam[deadTeam]?.delete(deadPlayer);
      });

      const clutchAliveByTeam = {};

      players.forEach((player) => {
        if (!clutchAliveByTeam[player.team_number]) {
          clutchAliveByTeam[player.team_number] = new Set();
        }

        clutchAliveByTeam[player.team_number].add(player.name);
      });

      let clutchCandidate = null;
      let clutchSize = 0;

      validKills.forEach((event) => {
        const killer = cleanName(event.attacker_name);
        const victim = cleanName(event.user_name);

        if (!stats[killer] || !stats[victim]) return;

        const killerTeam = stats[killer].team;
        const victimTeam = stats[victim].team;

        const killerTeamAliveBeforeKill = clutchAliveByTeam[killerTeam].size;
        const enemyTeamAliveBeforeKill = clutchAliveByTeam[victimTeam].size;

        if (
          killerTeamAliveBeforeKill === 1 &&
          enemyTeamAliveBeforeKill >= 1
        ) {
          clutchCandidate = killer;
          clutchSize = Math.max(clutchSize, enemyTeamAliveBeforeKill);
        }

        clutchAliveByTeam[victimTeam].delete(victim);
      });

      if (clutchCandidate) {
        const candidateTeam = stats[clutchCandidate].team;
        const enemyTeams = Object.keys(clutchAliveByTeam).filter(
          (team) => Number(team) !== candidateTeam
        );

        const allEnemiesDead = enemyTeams.every(
          (team) => clutchAliveByTeam[team].size === 0
        );

        if (allEnemiesDead) {
          if (clutchSize === 1) stats[clutchCandidate].clutch1v1++;
          if (clutchSize === 2) stats[clutchCandidate].clutch1v2++;
          if (clutchSize === 3) stats[clutchCandidate].clutch1v3++;
          if (clutchSize === 4) stats[clutchCandidate].clutch1v4++;
          if (clutchSize >= 5) stats[clutchCandidate].clutch1v5++;
        }
      }

      Object.entries(kastRound).forEach(([playerName, flags]) => {
        if (!stats[playerName]) return;

        if (flags.kill || flags.assist || flags.survived || flags.traded) {
          stats[playerName].kastRounds++;
        }
      });
    });

    rounds.forEach((round) => {
      const hpByPlayer = {};

      players.forEach((player) => {
        hpByPlayer[player.name] = 100;
      });

      const roundHurts = hurts
        .filter(
          (event) =>
            event.tick >= round.startTick && event.tick <= round.endTick
        )
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

        if (event.weapon === "hegrenade") {
          stats[attacker].heDamage += realDamage;
        }

        if (
          event.weapon === "molotov" ||
          event.weapon === "incgrenade" ||
          event.weapon === "inferno"
        ) {
          stats[attacker].molotovDamage += realDamage;
        }

        hpByPlayer[victim] = currentHp;
      });
    });

    const playerStats = Object.values(stats).map((player) => {
      const kd =
        player.deaths === 0 ? player.kills : player.kills / player.deaths;
      const hsPercent =
        player.kills === 0 ? 0 : (player.headshots / player.kills) * 100;
      const adr = rounds.length === 0 ? 0 : player.damage / rounds.length;
      const diff = player.kills - player.deaths;
      const entryRatio =
        player.entryDeaths === 0
          ? player.entryKills
          : player.entryKills / player.entryDeaths;

      const totalClutches =
        player.clutch1v1 +
        player.clutch1v2 +
        player.clutch1v3 +
        player.clutch1v4 +
        player.clutch1v5;

      const kastPercent =
        rounds.length === 0 ? 0 : (player.kastRounds / rounds.length) * 100;

      const impactRating =
        rounds.length === 0
          ? 0
          : (player.kills + player.assists) / rounds.length;

      const openingDuelWinPercent =
        player.openingDuels === 0
          ? 0
          : (player.openingKills / player.openingDuels) * 100;

      const firstKillPercent =
        rounds.length === 0 ? 0 : (player.openingKills / rounds.length) * 100;

      const tradeKillPercent =
        player.kills === 0 ? 0 : (player.tradeKills / player.kills) * 100;

      const ctKd =
        player.ctDeaths === 0
          ? player.ctKills
          : player.ctKills / player.ctDeaths;

      const tKd =
        player.tDeaths === 0
          ? player.tKills
          : player.tKills / player.tDeaths;

      const favoriteWeaponEntry = Object.entries(player.weapons).sort(
        (a, b) => b[1] - a[1]
      )[0];

      const favoriteWeapon = favoriteWeaponEntry
        ? {
            weapon: favoriteWeaponEntry[0],
            kills: favoriteWeaponEntry[1],
          }
        : null;

      const rawRating =
        0.4 * kd +
        0.25 * (adr / 100) +
        0.15 * (hsPercent / 100) +
        0.1 * (entryRatio / 2) +
        0.1 * (totalClutches / Math.max(1, rounds.length));

      const rating = rawRating * RATING_SCALE;

      const mvpScore =
        player.kills +
        player.assists * 0.5 +
        adr * 0.03 +
        diff * 0.8 +
        player.entryKills * 0.7 +
        totalClutches * 2 +
        impactRating * 3 +
        kastPercent * 0.03;

      return {
        ...player,
        diff,
        kd: Number(kd.toFixed(2)),
        hsPercent: Number(hsPercent.toFixed(2)),
        adr: Number(adr.toFixed(2)),
        entryRatio: Number(entryRatio.toFixed(2)),
        totalClutches,
        kastPercent: Number(kastPercent.toFixed(2)),
        impactRating: Number(impactRating.toFixed(2)),
        openingDuelWinPercent: Number(openingDuelWinPercent.toFixed(2)),
        firstKillPercent: Number(firstKillPercent.toFixed(2)),
        tradeKillPercent: Number(tradeKillPercent.toFixed(2)),
        ctKd: Number(ctKd.toFixed(2)),
        tKd: Number(tKd.toFixed(2)),
        favoriteWeapon,
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
      demoFile,
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

    const demoBaseName = path.basename(demoPath, ".dem");
    const outputPath = path.join(outputFolder, `${demoBaseName}.json`);

    fs.writeFileSync(outputPath, JSON.stringify(matchResult, null, 2), "utf8");

    console.log(
      `   ✅ Guardado: ${path.basename(outputPath)} | Mapa:${header.map_name} | Rondas:${rounds.length} | MVP:${mvp.name}\n`
    );
  } catch (error) {
    console.log(`   ❌ Error procesando ${demoFile}`);
    console.log(error.message);
    console.log("");
  }
});

console.log("Proceso terminado.");