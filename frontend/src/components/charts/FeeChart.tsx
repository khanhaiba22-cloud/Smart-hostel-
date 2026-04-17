import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface FeeChartProps {
  paidCount?: number;
  pendingCount?: number;
  partialCount?: number;
}

export function FeeChart({ paidCount = 0, pendingCount = 0, partialCount = 0 }: FeeChartProps) {
  const data = [
    { label: "Paid", count: paidCount, fill: "hsl(160, 84%, 39%)" },
    { label: "Pending", count: pendingCount, fill: "hsl(38, 92%, 50%)" },
    { label: "Partial", count: partialCount, fill: "hsl(217, 91%, 53%)" },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            borderRadius: "0.75rem",
            border: "1px solid hsl(220, 13%, 91%)",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.06)",
            fontSize: 13,
          }}
          formatter={(value) => [`${value} students`, "Count"]}
        />
        <Bar dataKey="count" fill="hsl(217, 91%, 53%)" radius={[6, 6, 0, 0]} name="Students"
          isAnimationActive={true}
          // Use individual fills per bar
          label={false}
        >
          {data.map((entry, index) => (
            <rect key={index} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
