"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function FrequencyChart({ yearly }: { yearly: Array<{ year: number; count: number }> }) {
  return (
    <div className="rounded-lg border border-bg-border bg-bg-card p-4">
      <div className="mb-2 text-xs font-semibold tracking-wide text-gray-500">FRÉQUENCE ANNUELLE DES CHANGEMENTS DE STATUT</div>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={yearly} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <XAxis dataKey="year" tick={{ fontSize: 9, fill: "#6b7280" }} interval={Math.ceil(yearly.length / 20)} axisLine={{ stroke: "#1f2937" }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={30} />
            <Tooltip contentStyle={{ background: "#0f1522", border: "1px solid #1f2937", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#9ca3af" }} />
            <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
