
import React from 'react';
import { 
  BarChart, LineChart, PieChart, DonutChart, AreaChart
} from '@/components/ui/chart';

interface ChartProps {
  type: 'bar' | 'line' | 'pie' | 'donut' | 'area';
  data: any[];
  index?: string;
  categories?: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
  title?: string;
  dataKey?: string;
  additionalDataKeys?: string[];
}

export function FinancialChart({ 
  type, 
  data, 
  index = "name", 
  categories,
  colors = ["#2563eb", "#dc2626"], 
  valueFormatter,
  className,
  title,
  dataKey,
  additionalDataKeys
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

  // If categories are not provided but dataKey is, create categories from dataKey and additionalDataKeys
  const derivedCategories = !categories && dataKey ? 
    [dataKey, ...(additionalDataKeys || [])] : 
    categories;

  switch (type) {
    case 'bar':
      return (
        <BarChart
          data={data}
          index={index}
          categories={derivedCategories || []}
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
          categories={derivedCategories || []}
          colors={colors}
          valueFormatter={formatter}
          className={className}
          showLegend
          showGridLines
          curveType="monotone"
          connectNulls
        />
      );
    case 'area':
      return (
        <AreaChart
          data={data}
          index={index}
          categories={derivedCategories || []}
          colors={colors}
          valueFormatter={formatter}
          className={className}
          showLegend
          showGridLines
          connectNulls
        />
      );
    case 'pie':
      return (
        <PieChart
          data={data}
          index={index}
          category={dataKey || "value"}
          colors={colors}
          valueFormatter={formatter}
          className={className}
          showLabel
          showTooltip
        />
      );
    case 'donut':
      return (
        <DonutChart
          data={data}
          index={index}
          category={dataKey || "value"}
          colors={colors}
          valueFormatter={formatter}
          className={className}
          showLabel
          showTooltip
        />
      );
    default:
      return <div>Chart type not supported</div>;
  }
}
