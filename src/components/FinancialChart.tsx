
import React from 'react';
import {
  Line,
  Bar,
  Area,
  Pie,
  PieChart,
  LineChart,
  BarChart,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ChartProps {
  title?: string;
  type: 'line' | 'bar' | 'area' | 'pie';
  data: any[];
  index?: string;
  categories?: string[];
  category?: string;
  colors?: string[];
  dataKey?: string;
  additionalDataKeys?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
}

export const FinancialChart = ({
  title,
  type,
  data,
  index = 'name',
  categories,
  category = 'value',
  colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'],
  dataKey,
  additionalDataKeys = [],
  valueFormatter = (value) => `${value}`,
  className = 'h-80',
}: ChartProps) => {
  const renderChart = () => {
    if (!data || data.length === 0) {
      return <div className="flex items-center justify-center h-full">No data available</div>;
    }

    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={index} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: any) => valueFormatter(value)} />
            <Legend />
            {dataKey && (
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            {additionalDataKeys?.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[(i + 1) % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
            {categories?.map((category, i) => (
              <Line
                key={category}
                type="monotone"
                dataKey={category}
                stroke={colors[i % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={index} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: any) => valueFormatter(value)} />
            <Legend />
            {dataKey && (
              <Bar
                dataKey={dataKey}
                fill={colors[0]}
                radius={[4, 4, 0, 0]}
              />
            )}
            {additionalDataKeys?.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[(i + 1) % colors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
            {categories?.map((category, i) => (
              <Bar
                key={category}
                dataKey={category}
                fill={colors[i % colors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={index} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: any) => valueFormatter(value)} />
            <Legend />
            {dataKey && (
              <Area
                type="monotone"
                dataKey={dataKey}
                fill={colors[0]}
                stroke={colors[0]}
                fillOpacity={0.3}
              />
            )}
            {additionalDataKeys?.map((key, i) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                fill={colors[(i + 1) % colors.length]}
                stroke={colors[(i + 1) % colors.length]}
                fillOpacity={0.3}
              />
            ))}
            {categories?.map((category, i) => (
              <Area
                key={category}
                type="monotone"
                dataKey={category}
                fill={colors[i % colors.length]}
                stroke={colors[i % colors.length]}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey={category}
              nameKey={index}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={entry.color || colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => valueFormatter(value)} />
            <Legend />
          </PieChart>
        );

      default:
        return <div>Chart type not supported</div>;
    }
  };

  // If title is provided, wrap in a Card with title, otherwise just render the chart
  if (title) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className={className}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default FinancialChart;
