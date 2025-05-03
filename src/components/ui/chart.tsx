
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, TooltipProps, Cell, Pie, PieChart as RechartsPieChart, Legend, Line, LineChart as RechartsLineChart, CartesianGrid, Area, AreaChart as RechartsAreaChart } from "recharts";
import { cn } from "@/lib/utils";

// BarChart Component
interface BarChartProps {
  data: any[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
}

export const BarChart = ({
  data,
  index,
  categories,
  colors = ["#2563eb", "#4ade80", "#f59e0b", "#ef4444"],
  valueFormatter = (value: number) => value.toString(),
  className,
}: BarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%" className={cn("", className)}>
      <RechartsBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <XAxis
          dataKey={index}
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={valueFormatter}
        />
        <Tooltip
          formatter={(value: number) => [valueFormatter(value), ""]}
          cursor={{ opacity: 0.1 }}
          contentStyle={{
            borderRadius: "8px",
            padding: "8px 12px",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(0, 0, 0, 0.1)",
          }}
        />
        {categories.map((category, index) => (
          <Bar
            key={category}
            dataKey={category}
            fill={colors[index % colors.length]}
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

// PieChart Component
interface PieChartProps {
  data: any[];
  index: string;
  category?: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
  showLabel?: boolean;
  showTooltip?: boolean;
  showAnimation?: boolean;
}

export const PieChart = ({
  data,
  index,
  category = "value",
  colors = ["#2563eb", "#4ade80", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"],
  valueFormatter = (value: number) => value.toString(),
  className,
  showLabel = true,
  showTooltip = true,
  showAnimation = true,
}: PieChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%" className={cn("", className)}>
      <RechartsPieChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          dataKey={category}
          nameKey={index}
          label={showLabel ? ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%` : false}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        {showTooltip && (
          <Tooltip
            formatter={(value: number) => [valueFormatter(value), ""]}
            contentStyle={{
              borderRadius: "8px",
              padding: "8px 12px",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(0, 0, 0, 0.1)",
            }}
          />
        )}
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          formatter={(value) => <span className="text-xs">{value}</span>}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

// LineChart Component
interface LineChartProps {
  data: any[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
  showLegend?: boolean;
  showGridLines?: boolean;
  curveType?: "linear" | "monotone";
  connectNulls?: boolean;
  showAnimation?: boolean;
}

export const LineChart = ({
  data,
  index,
  categories,
  colors = ["#2563eb", "#4ade80", "#f59e0b", "#ef4444"],
  valueFormatter = (value: number) => value.toString(),
  className,
  showLegend = true,
  showGridLines = true,
  curveType = "linear",
  connectNulls = false,
  showAnimation = false,
}: LineChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%" className={cn("", className)}>
      <RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {showGridLines && <CartesianGrid strokeDasharray="3 3" opacity={0.2} />}
        <XAxis
          dataKey={index}
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={valueFormatter}
        />
        <Tooltip
          formatter={(value: number) => [valueFormatter(value), ""]}
          contentStyle={{
            borderRadius: "8px",
            padding: "8px 12px",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(0, 0, 0, 0.1)",
          }}
        />
        {showLegend && (
          <Legend 
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
          />
        )}
        {categories.map((category, index) => (
          <Line
            key={category}
            type={curveType}
            dataKey={category}
            stroke={colors[index % colors.length]}
            activeDot={{ r: 8 }}
            strokeWidth={2}
            connectNulls={connectNulls}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

// AreaChart Component
interface AreaChartProps {
  data: any[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
  showLegend?: boolean;
  showGridLines?: boolean;
  connectNulls?: boolean;
  showAnimation?: boolean;
}

export const AreaChart = ({
  data,
  index,
  categories,
  colors = ["#2563eb", "#4ade80", "#f59e0b", "#ef4444"],
  valueFormatter = (value: number) => value.toString(),
  className,
  showLegend = true,
  showGridLines = true,
  connectNulls = false,
  showAnimation = false,
}: AreaChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%" className={cn("", className)}>
      <RechartsAreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {showGridLines && <CartesianGrid strokeDasharray="3 3" opacity={0.2} />}
        <XAxis
          dataKey={index}
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={valueFormatter}
        />
        <Tooltip
          formatter={(value: number) => [valueFormatter(value), ""]}
          contentStyle={{
            borderRadius: "8px",
            padding: "8px 12px",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(0, 0, 0, 0.1)",
          }}
        />
        {showLegend && (
          <Legend 
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
          />
        )}
        {categories.map((category, index) => (
          <Area
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[index % colors.length]}
            fill={`${colors[index % colors.length]}20`}
            stackId={1}
            connectNulls={connectNulls}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};

// DonutChart Component (a specialized PieChart with inner radius)
export const DonutChart = ({
  data,
  index,
  category = "value",
  colors = ["#2563eb", "#4ade80", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"],
  valueFormatter = (value: number) => value.toString(),
  className,
  showLabel = true,
  showTooltip = true,
  showAnimation = true,
}: PieChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%" className={cn("", className)}>
      <RechartsPieChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={40} // This makes it a donut chart
          dataKey={category}
          nameKey={index}
          label={showLabel ? ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%` : false}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        {showTooltip && (
          <Tooltip
            formatter={(value: number) => [valueFormatter(value), ""]}
            contentStyle={{
              borderRadius: "8px",
              padding: "8px 12px",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(0, 0, 0, 0.1)",
            }}
          />
        )}
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          formatter={(value) => <span className="text-xs">{value}</span>}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};
