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
      <div className="mt-5 flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span
            key={badge}
            className="rounded-full border border-red-600 bg-red-600/10 px-4 py-2 text-sm font-bold text-red-400"
          >
            {badge}
          </span>
        ))}
      </div>
    );
  }