import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
}

interface ComplaintPieChartProps {
  data?: ChartDataItem[];
}

const DEFAULT_COLORS = [
  "hsl(38, 92%, 50%)",   // Pending - amber
  "hsl(217, 91%, 53%)",  // In Progress - blue
  "hsl(160, 84%, 39%)",  // Resolved - green
];

const DEFAULT_DATA: ChartDataItem[] = [
  { name: "Pending", value: 0 },
  { name: "In Progress", value: 0 },
  { name: "Resolved", value: 0 },
];

export function ComplaintPieChart({ data = DEFAULT_DATA }: ComplaintPieChartProps) {
  const chartData = data.length > 0 ? data : DEFAULT_DATA;
  const hasData = chartData.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
        No complaint data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: "0.75rem",
            border: "1px solid hsl(220, 13%, 91%)",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.06)",
            fontSize: 13,
          }}
          formatter={(value) => [`${value} complaints`, ""]}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
