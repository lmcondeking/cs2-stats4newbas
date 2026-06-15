"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

type Props = {
  data: {
    match: string;
    rating: number;
    adr: number;
    kd: number;
  }[];
};

type ChartKey = "rating" | "adr" | "kd";

const chartConfig: Record<
  ChartKey,
  {
    title: string;
    subtitle: string;
    color: string;
    glow: string;
    reference?: number;
    domain?: [number | "auto", number | "auto"];
  }
> = {
  rating: {
    title: "Rating S4N",
    subtitle: "Evolución del rendimiento general",
    color: "#fbbf24",
    glow: "shadow-yellow-500/10",
    reference: 1,
    domain: [0, "auto"],
  },
  adr: {
    title: "ADR",
    subtitle: "Daño promedio por ronda",
    color: "#22c55e",
    glow: "shadow-green-500/10",
    reference: 80,
    domain: [0, "auto"],
  },
  kd: {
    title: "K/D Ratio",
    subtitle: "Relación kills / muertes",
    color: "#3b82f6",
    glow: "shadow-blue-500/10",
    reference: 1,
    domain: [0, "auto"],
  },
};

export default function PlayerCharts({ data }: Props) {
  const last = data[data.length - 1];

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <ChartCard data={data} chartKey="rating" highlight={last?.rating} />
      <ChartCard data={data} chartKey="adr" highlight={last?.adr} />
      <ChartCard data={data} chartKey="kd" highlight={last?.kd} />

      <div className="rounded-[1.35rem] border border-[#263241] bg-[#101722] p-5 shadow-xl shadow-black/20">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
          Lectura rápida
        </p>

        <h3 className="mt-2 text-2xl font-black text-white">
          Forma del jugador
        </h3>

        <div className="mt-5 grid gap-3">
          <QuickRead
            title="Último Rating"
            value={last ? last.rating : "0"}
            good={Number(last?.rating || 0) >= 1}
          />
          <QuickRead
            title="Último ADR"
            value={last ? last.adr : "0"}
            good={Number(last?.adr || 0) >= 80}
          />
          <QuickRead
            title="Último K/D"
            value={last ? last.kd : "0"}
            good={Number(last?.kd || 0) >= 1}
          />
        </div>

        <p className="mt-5 text-sm leading-relaxed text-zinc-400">
          Estos gráficos muestran la evolución partida por partida. La línea
          punteada marca una referencia saludable para comparar rápidamente si
          el jugador viene rindiendo por encima o por debajo del promedio.
        </p>
      </div>
    </div>
  );
}

function ChartCard({
  data,
  chartKey,
  highlight,
}: {
  data: Props["data"];
  chartKey: ChartKey;
  highlight?: number;
}) {
  const config = chartConfig[chartKey];

  return (
    <div
      className={`rounded-[1.35rem] border border-[#263241] bg-[#101722] p-5 shadow-xl ${config.glow}`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#9aa4b2]">
            Evolución por partida
          </p>

          <h3 className="mt-1 text-2xl font-black text-white">
            {config.title}
          </h3>

          <p className="mt-1 text-sm text-zinc-500">{config.subtitle}</p>
        </div>

        <div className="rounded-xl border border-[#263241] bg-black/40 px-4 py-2 text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            Última
          </p>
          <p className="text-xl font-black" style={{ color: config.color }}>
            {highlight ?? 0}
          </p>
        </div>
      </div>

      <div className="h-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 14, left: -12, bottom: 0 }}
          >
            <CartesianGrid stroke="#263241" strokeDasharray="3 3" />

            <XAxis
              dataKey="match"
              tick={{ fill: "#8b95a3", fontSize: 10 }}
              axisLine={{ stroke: "#263241" }}
              tickLine={{ stroke: "#263241" }}
              interval="preserveStartEnd"
            />

            <YAxis
              tick={{ fill: "#8b95a3", fontSize: 10 }}
              axisLine={{ stroke: "#263241" }}
              tickLine={{ stroke: "#263241" }}
              domain={config.domain}
            />

            {config.reference !== undefined && (
              <ReferenceLine
                y={config.reference}
                stroke="#64748b"
                strokeDasharray="4 4"
              />
            )}

            <Tooltip
              contentStyle={{
                backgroundColor: "#05080d",
                border: "1px solid #263241",
                borderRadius: "12px",
                color: "#ffffff",
              }}
              labelStyle={{ color: "#cbd5e1", fontWeight: 800 }}
              itemStyle={{ color: config.color, fontWeight: 800 }}
            />

            <Line
              type="monotone"
              dataKey={chartKey}
              stroke={config.color}
              strokeWidth={3}
              dot={{
                r: 3,
                stroke: config.color,
                strokeWidth: 2,
                fill: "#05080d",
              }}
              activeDot={{
                r: 6,
                stroke: "#ffffff",
                strokeWidth: 2,
                fill: config.color,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function QuickRead({
  title,
  value,
  good,
}: {
  title: string;
  value: string | number;
  good: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#263241] bg-black/40 px-4 py-3">
      <span className="text-sm font-bold text-zinc-300">{title}</span>

      <span
        className={`rounded-full px-3 py-1 text-sm font-black ${
          good
            ? "bg-green-500/15 text-green-400"
            : "bg-red-500/15 text-red-400"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
