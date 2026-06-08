"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Props = {
  data: {
    match: string;
    rating: number;
    adr: number;
    kd: number;
  }[];
};

export default function PlayerCharts({ data }: Props) {
  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="mb-4 text-2xl font-black text-red-500">
          Evolución Rating S4N
        </h2>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#27272a" />
              <XAxis dataKey="match" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#ef4444"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="mb-4 text-2xl font-black text-red-500">
          Evolución ADR
        </h2>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#27272a" />
              <XAxis dataKey="match" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="adr"
                stroke="#22c55e"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="mb-4 text-2xl font-black text-red-500">
          Evolución K/D
        </h2>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#27272a" />
              <XAxis dataKey="match" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="kd"
                stroke="#3b82f6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}