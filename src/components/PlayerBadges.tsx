type Props = {
    player: any;
    ranking: any[];
  };
  
  export default function PlayerBadges({ player, ranking }: Props) {
    const sortedByRating = [...ranking].sort((a, b) => b.ratingS4N - a.ratingS4N);
    const sortedByMvp = [...ranking].sort((a, b) => b.mvps - a.mvps);
    const sortedByEntry = [...ranking].sort((a, b) => b.entryKills - a.entryKills);
    const sortedByClutch = [...ranking].sort(
      (a, b) => b.totalClutches - a.totalClutches
    );
    const sortedByKast = [...ranking].sort((a, b) => b.kastPercent - a.kastPercent);
  
    const badges = [];
  
    if (sortedByRating[0]?.steamid === player.steamid) badges.push("🔥 Rating #1");
    if (sortedByMvp[0]?.steamid === player.steamid) badges.push("🏆 MVP Leader");
    if (sortedByEntry[0]?.steamid === player.steamid) badges.push("⚔️ Entry King");
    if (sortedByClutch[0]?.steamid === player.steamid) badges.push("👑 Clutch King");
    if (sortedByKast[0]?.steamid === player.steamid) badges.push("🧠 KAST Leader");
  
    if (badges.length === 0) {
      badges.push("🎮 Stats4Newbas Player");
    }
  
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span
            key={badge}
            className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs font-black text-yellow-300"
          >
            {badge}
          </span>
        ))}
      </div>
    );
  }