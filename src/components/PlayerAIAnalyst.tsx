type Player = Record<string, any>;

function cleanMap(map?: string) {
  return String(map || "sin datos").replace("de_", "").toUpperCase();
}

export default function PlayerAIAnalyst({ player }: { player: Player }) {
  const name = String(player.name || "").toLowerCase();
  const isLudo = name.includes("ludo");
  const isIluminari = name.includes("ilumin");

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (Number(player.ratingS4N) >= 1.15) strengths.push("rating de nivel élite dentro de la liga");
  if (Number(player.adr) >= 85) strengths.push("ADR alto y presencia constante en las rondas");
  if (Number(player.kd) >= 1.2) strengths.push("excelente relación entre kills y muertes");
  if (Number(player.kastPercent) >= 75) strengths.push("muy buena consistencia y supervivencia");
  if (Number(player.openingDuelWinPercent) >= 55) strengths.push("gran impacto en duelos de apertura");
  if (Number(player.totalClutches) >= 5) strengths.push("capacidad real para cerrar clutches");

  if (Number(player.tradeKillPercent) < 15) weaknesses.push("los trades todavía pueden mejorar");
  if (Number(player.openingDuelWinPercent) < 45) weaknesses.push("sufre demasiado en las aperturas");
  if (Number(player.kastPercent) < 70) weaknesses.push("le falta constancia ronda a ronda");
  if (Number(player.adr) < 70) weaknesses.push("debe generar más daño antes de morir");
  if (Number(player.kd) < 1) weaknesses.push("está entregando más bajas de las que produce");

  if (!strengths.length) strengths.push("tiene margen para evolucionar rápido si ordena su juego");
  if (!weaknesses.length) weaknesses.push("su principal reto es sostener este nivel durante más partidas");

  const steamid = String(player.steamid || "");

  let headline = `${player.name} presenta un perfil equilibrado y competitivo.`;
  let roast = "No hay descanso: en la DownLeague siempre hay algo para corregir.";

  if (steamid === "76561198827102122") {
    headline = "TOMI suele respaldar el personaje con números fuertes y mucha presencia en las rondas.";
    roast =
      Number(player.kd) >= 1.2
        ? "Juega bárbaro, aunque cada tanto se agranda tanto que parece que la demo viene con una cámara exclusiva para él."
        : "Consejo premium: menos pose de estrella y un poquito más de supervivencia cuando la ronda se complica.";
  } else if (steamid === "76561198810129628") {
    headline = "kingC aporta agresividad y momentos de impacto, aunque su regularidad todavía negocia partido a partido.";
    roast =
      Number(player.openingDuelWinPercent) >= 50
        ? "Entra con decisión; el problema es que a veces entra tan rápido que el resto del equipo todavía está comprando."
        : "Ser entry no significa donar la primera baja y después dirigir la ronda desde Discord.";
  } else if (steamid === "76561199082720391") {
    headline = "Nicolas tiene ráfagas de buen Counter y puede inclinar partidas cuando encuentra confianza.";
    roast =
      Number(player.adr) >= 75
        ? "Cuando prende, pega fuerte; cuando no, parece que está esperando que Steam le habilite el mouse."
        : "Consejo amistoso: el daño también cuenta aunque la kill no quede linda para el clip.";
  } else if (steamid === "76561198051821859") {
    headline = "Tenedor de Sopa es impredecible: puede sorprender al rival y también a sus propios compañeros.";
    roast =
      Number(player.kd) >= 1
        ? "Está mejorando; ahora falta resolver el misterio de por qué algunas rotaciones tardan lo mismo que cocinar un guiso."
        : "El apodo ya avisaba: con un tenedor la sopa cuesta. Igual, apuntar al rival facilitaría bastante el proceso.";
  } else if (isLudo) {
    headline = "Ludo tiene números respetables, aunque a veces parece que juega con el monitor en modo ahorro de energía.";
    roast =
      Number(player.adr) < 80
        ? "Consejo con cariño: disparar antes de morir también suma ADR, no hace falta guardar las balas para la próxima demo."
        : "Está levantando el nivel; ahora solamente falta que deje de inspeccionar el arma cuando el rival está entrando.";
  } else if (isIluminari) {
    headline = "ILUMIN4RI puede ser decisivo, pero su nombre ilumina más que algunas de sus rotaciones.";
    roast =
      Number(player.tradeKillPercent) < 18
        ? "Consejo técnico: el trade no es mirar cómo muere tu compañero y después preguntar «¿dónde estaba?»."
        : "Viene mejorando; si además escucha una call completa sin discutirla, desbloquea el modo profesional.";
  }

  const recommendation =
    Number(player.openingDuelWinPercent) < 50
      ? "Tomar menos duelos secos, jugar con utilidad y buscar aperturas con apoyo."
      : Number(player.tradeKillPercent) < 18
      ? "Acercarse más a sus compañeros para transformar muertes aliadas en trades."
      : Number(player.kastPercent) < 72
      ? "Priorizar posiciones con salida y mejorar la supervivencia en rondas desfavorables."
      : "Mantener el estilo actual y trabajar especialmente los mapas de menor rating.";

  return (
    <section className="s4n-card mt-5 overflow-hidden rounded-2xl border border-yellow-500/20 p-4">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-xl">
              🤖
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-400">
                S4N Analyst
              </p>
              <h2 className="text-lg font-black text-white">Informe automático</h2>
            </div>
          </div>

          <p className="mt-4 text-base font-bold leading-relaxed text-zinc-200">
            {headline}
          </p>

          <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm leading-relaxed text-red-200">
            {roast}
          </p>

          <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">
              Recomendación
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-200">
              {recommendation}
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          <Insight title="Fortalezas" items={strengths.slice(0, 3)} tone="green" />
          <Insight title="A mejorar" items={weaknesses.slice(0, 3)} tone="red" />

          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Especialidad detectada
            </p>
            <p className="mt-2 text-lg font-black text-yellow-400">
              {Number(player.adr) >= 90
                ? "Firepower"
                : Number(player.openingDuelWinPercent) >= 55
                ? "Entry"
                : Number(player.kastPercent) >= 75
                ? "Consistencia"
                : Number(player.totalClutches) >= 5
                ? "Clutch"
                : "Jugador de sistema"}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Mejor mapa: {cleanMap(player.bestMap?.map)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Insight({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "green" | "red";
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        tone === "green"
          ? "border-emerald-500/20 bg-emerald-500/5"
          : "border-red-500/20 bg-red-500/5"
      }`}
    >
      <p
        className={`text-[10px] font-black uppercase tracking-widest ${
          tone === "green" ? "text-emerald-300" : "text-red-300"
        }`}
      >
        {title}
      </p>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-zinc-300">
            <span>{tone === "green" ? "✓" : "•"}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
