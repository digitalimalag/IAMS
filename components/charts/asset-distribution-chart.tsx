'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AssetDistributionChartProps {
  data: Array<{ type: string; count: number }>;
}

export function AssetDistributionChart({ data }: AssetDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis 
          dataKey="type" 
          stroke="var(--color-muted-foreground)"
          style={{ fontSize: '0.875rem' }}
        />
        <YAxis 
          stroke="var(--color-muted-foreground)"
          style={{ fontSize: '0.875rem' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-card)',
            border: `1px solid var(--color-border)`,
            borderRadius: '6px',
          }}
          cursor={{ fill: 'rgba(0,0,0,0.1)' }}
        />
        <Bar 
          dataKey="count" 
          fill="var(--color-primary)"
          radius={[8, 8, 0, 0]}
          isAnimationActive={true}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
