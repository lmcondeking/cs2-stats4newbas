"use client";

import { useMemo, useState } from "react";
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
    reference: number;
    domain: [number | "auto", number | "auto"];
  }
> = {
  rating: {
    title: "Rating S4N",
    subtitle: "Rendimiento general por partida",
    color: "#fbbf24",
    reference: 1,
    domain: [0, "auto"],
  },
  adr: {
    title: "ADR",
    subtitle: "Daño promedio por ronda",
    color: "#22c55e",
    reference: 80,
    domain: [0, "auto"],
  },
  kd: {
    title: "K/D Ratio",
    subtitle: "Relación kills / muertes",
    color: "#3b82f6",
    reference: 1,
    domain: [0, "auto"],
  },
};

export default function PlayerCharts({ data }: Props) {
  const [active, setActive] = useState<ChartKey>("rating");
  const config = chartConfig[active];
  const last = data[data.length - 1];
  const lastValue = last ? Number(last[active] || 0) : 0;

  const average = useMemo(() => {
    if (!data.length) return 0;
    return Number(
      (
        data.reduce((acc, item) => acc + Number(item[active] || 0), 0) /
        data.length
      ).toFixed(2)
    );
  }, [active, data]);

  const trend = Number((lastValue - average).toFixed(2));

  return (
    <section className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-400">
            Evolución por partida
          </p>
          <h3 className="mt-1 text-lg font-black text-white">{config.title}</h3>
          <p className="mt-1 text-sm text-zinc-500">{config.subtitle}</p>
        </div>

        <div className="flex rounded-xl border border-white/10 bg-black/30 p-1">
          {(Object.keys(chartConfig) as ChartKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className={`rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
                active === key
                  ? "bg-yellow-500 text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {key === "rating" ? "Rating" : key.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_185px]">
        <div className="h-[210px] rounded-xl border border-white/10 bg-[#09101a]/70 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 12, right: 18, left: -10, bottom: 0 }}
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
              <ReferenceLine
                y={config.reference}
                stroke="#64748b"
                strokeDasharray="4 4"
              />
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
                dataKey={active}
                stroke={config.color}
                strokeWidth={3}
                dot={{ r: 3, stroke: config.color, strokeWidth: 2, fill: "#05080d" }}
                activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2, fill: config.color }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid content-start gap-3">
          <Metric title="Última" value={lastValue} color={config.color} />
          <Metric title="Promedio" value={average} color="#e5e7eb" />
          <Metric
            title="Vs promedio"
            value={`${trend >= 0 ? "+" : ""}${trend}`}
            color={trend >= 0 ? "#22c55e" : "#ef4444"}
          />

          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-zinc-400">
            Cambiá el indicador sin ocupar espacio con tres gráficos separados.
            La línea punteada marca una referencia saludable.
          </p>
        </div>
      </div>
    </section>
  );
}

function Metric({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
        {title}
      </p>
      <p className="mt-1 text-2xl font-black" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
