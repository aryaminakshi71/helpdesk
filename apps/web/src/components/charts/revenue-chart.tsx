/**
 * Revenue Chart Component
 * Area chart for displaying ticket trends
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  day: string;
  value: number;
  [key: string]: string | number;
}

interface RevenueChartProps {
  data: ChartData[];
  dataKey?: string;
  color?: string;
  height?: number;
}

export function RevenueChart({
  data,
  dataKey = "value",
  color = "#06b6d4",
  height = 300,
}: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground"
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  // Transform data for chart (day -> name)
  const chartData = data.map((item) => ({
    name: new Date(item.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: item.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient
            id={`color${color.replace("#", "")}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="5%" stopColor={color} stopOpacity={0.8} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="name"
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          fillOpacity={1}
          fill={`url(#color${color.replace("#", "")})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
