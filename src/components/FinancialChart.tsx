
import React from 'react';
import { 
  BarChart, LineChart, PieChart, DonutChart, AreaChart, 
} from '@/components/ui/chart';

interface ChartProps {
  type: 'bar' | 'line' | 'pie' | 'donut' | 'area';
  data: any[];
  index?: string;
  categories?: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
}

export function FinancialChart({ 
  type, 
  data, 
  index = "name", 
  categories, 
  colors = ["#2563eb", "#dc2626"], 
  valueFormatter,
  className
}: ChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const defaultValueFormatter = (value: number) => 
    `₹${new Intl.NumberFormat('en-IN').format(value)}`;

  const formatter = valueFormatter || defaultValueFormatter;

  switch (type) {
    case 'bar':
      return (
        <BarChart
          data={data}
          index={index}
          categories={categories}
          colors={colors}
          valueFormatter={formatter}
          className={className}
        />
      );
    case 'line':
      return (
        <LineChart
          data={data}
          index={index}
          categories={categories}
          colors={colors}
          valueFormatter={formatter}
          className={className}
          showLegend
          showGridLines
          curveType="monotone"
          connectNulls
          showAnimation
        />
      );
    case 'area':
      return (
        <AreaChart
          data={data}
          index={index}
          categories={categories}
          colors={colors}
          valueFormatter={formatter}
          className={className}
          showLegend
          showGridLines
          connectNulls
          showAnimation
        />
      );
    case 'pie':
      return (
        <PieChart
          data={data}
          index={index}
          category="value"
          colors={colors}
          valueFormatter={formatter}
          className={className}
          showLabel
          showTooltip
          showAnimation
        />
      );
    case 'donut':
      return (
        <DonutChart
          data={data}
          index={index}
          category="value"
          colors={colors}
          valueFormatter={formatter}
          className={className}
          showLabel
          showTooltip
          showAnimation
        />
      );
    default:
      return <div>Chart type not supported</div>;
  }
}
