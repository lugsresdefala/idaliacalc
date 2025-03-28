import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  className?: string;
  labelFormatter?: (label: string) => React.ReactNode;
  valueFormatter?: (value: number, name?: string) => React.ReactNode;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  labelFormatter,
  valueFormatter,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className={cn("rounded-lg border bg-background p-2 shadow-sm", className)}>
      <div className="font-medium">
        {labelFormatter ? labelFormatter(label || "") : label}
      </div>
      <div className="mt-1 space-y-0.5">
        {payload.map((item: any, index: number) => (
          <div
            key={`item-${index}`}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-1">
              <div 
                className="h-2 w-2 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.name}:</span>
            </div>
            <span className="font-medium">
              {valueFormatter ? valueFormatter(item.value, item.name) : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ChartLegendContentProps {
  payload?: any[];
  className?: string;
  onClick?: (dataKey: string) => void;
  formatter?: (value: string) => React.ReactNode;
  iconSize?: number;
  iconType?: "circle" | "square" | "line";
  hiddenSeries?: string[];
}

export function ChartLegendContent({
  payload,
  className,
  onClick,
  formatter,
  iconSize = 10,
  iconType = "circle",
  hiddenSeries = [],
}: ChartLegendContentProps) {
  if (!payload?.length) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {payload.map((entry: any, index: number) => {
        const isHidden = hiddenSeries.includes(entry.dataKey);
        
        return (
          <div
            key={`item-${index}`}
            className={cn(
              "flex cursor-pointer items-center gap-1.5",
              isHidden && "opacity-50"
            )}
            onClick={() => onClick?.(entry.dataKey)}
          >
            {iconType === "circle" && (
              <div
                className="rounded-full"
                style={{
                  backgroundColor: entry.color,
                  width: iconSize,
                  height: iconSize,
                }}
              />
            )}
            {iconType === "square" && (
              <div
                style={{
                  backgroundColor: entry.color,
                  width: iconSize,
                  height: iconSize,
                }}
              />
            )}
            {iconType === "line" && (
              <div
                className="h-[2px]"
                style={{
                  backgroundColor: entry.color,
                  width: iconSize * 1.5,
                }}
              />
            )}
            <span className="text-sm text-muted-foreground">
              {formatter ? formatter(entry.value) : entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface ChartProps {
  data: any[];
  type: "line" | "bar" | "pie";
  series: Array<{
    dataKey: string;
    name: string;
    color?: string;
  }>;
  xAxisKey?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number | string;
  width?: number | string;
  className?: string;
  tooltipFormatter?: (value: number, name?: string) => React.ReactNode;
  labelFormatter?: (label: string) => React.ReactNode;
  valueFormatter?: (value: number) => React.ReactNode;
  colors?: string[];
}

export function Chart({
  data,
  type,
  series,
  xAxisKey = "name",
  xAxisLabel,
  yAxisLabel,
  height = 300,
  width = "100%",
  className,
  tooltipFormatter,
  labelFormatter,
  valueFormatter,
  colors = ["#2563eb", "#8b5cf6", "#ec4899", "#f97316", "#10b981"],
}: ChartProps) {
  const [hiddenSeries, setHiddenSeries] = React.useState<string[]>([]);

  const toggleSeries = (dataKey: string) => {
    setHiddenSeries(prev =>
      prev.includes(dataKey)
        ? prev.filter(key => key !== dataKey)
        : [...prev, dataKey]
    );
  };

  const renderChart = () => {
    const visibleSeries = series.filter(s => !hiddenSeries.includes(s.dataKey));

    switch (type) {
      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey={xAxisKey}
              className="text-xs text-muted-foreground"
              label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -5 } : undefined}
            />
            <YAxis
              className="text-xs text-muted-foreground"
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined}
            />
            <Tooltip
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  label={label}
                  valueFormatter={tooltipFormatter}
                  labelFormatter={labelFormatter}
                />
              )}
            />
            <Legend
              content={({ payload }) => (
                <ChartLegendContent
                  payload={payload}
                  onClick={toggleSeries}
                  hiddenSeries={hiddenSeries}
                  iconType="line"
                />
              )}
            />
            {visibleSeries.map((s, index) => (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color || colors[index % colors.length]}
                activeDot={{ r: 6 }}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        );
      
      case "bar":
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey={xAxisKey}
              className="text-xs text-muted-foreground"
              label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -5 } : undefined}
            />
            <YAxis
              className="text-xs text-muted-foreground"
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined}
            />
            <Tooltip
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  label={label}
                  valueFormatter={tooltipFormatter}
                  labelFormatter={labelFormatter}
                />
              )}
            />
            <Legend
              content={({ payload }) => (
                <ChartLegendContent
                  payload={payload}
                  onClick={toggleSeries}
                  hiddenSeries={hiddenSeries}
                  iconType="square"
                />
              )}
            />
            {visibleSeries.map((s, index) => (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name}
                fill={s.color || colors[index % colors.length]}
              />
            ))}
          </BarChart>
        );
      
      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              nameKey={xAxisKey}
              dataKey={visibleSeries[0]?.dataKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={valueFormatter ? (entry) => valueFormatter(entry.value) : undefined}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  label={label}
                  valueFormatter={tooltipFormatter}
                  labelFormatter={labelFormatter}
                />
              )}
            />
            <Legend
              content={({ payload }) => (
                <ChartLegendContent
                  payload={payload?.map((item, i) => ({
                    ...item,
                    dataKey: item.value,
                    color: colors[i % colors.length]
                  }))}
                  formatter={(value) => {
                    const item = data.find(d => d[xAxisKey] === value);
                    return `${value} (${valueFormatter ? valueFormatter(item?.[visibleSeries[0]?.dataKey]) : item?.[visibleSeries[0]?.dataKey]})`;
                  }}
                />
              )}
            />
          </PieChart>
        );
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width={width} height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}