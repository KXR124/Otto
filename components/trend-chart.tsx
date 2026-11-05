'use client'

import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CO2_ALERT, METHANE_ALERT } from '@/lib/binnet'
import { cn } from '@/lib/utils'
import type { HourlyPoint } from '@/lib/types'

const METRICS = {
  fill: { label: 'Fill level', unit: '%', color: 'var(--chart-1)', domain: [0, 100] as [number, number] },
  methane: { label: 'Methane', unit: 'ppm', color: 'var(--chart-3)', alert: METHANE_ALERT },
  co2: { label: 'CO₂', unit: 'ppm', color: 'var(--chart-2)', alert: CO2_ALERT },
  battery: { label: 'Battery', unit: '%', color: 'var(--chart-5)', domain: [0, 100] as [number, number] },
} as const

type MetricKey = keyof typeof METRICS

const formatHour = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' })

export function TrendChart({ data }: { data: HourlyPoint[] }) {
  const [metric, setMetric] = useState<MetricKey>('fill')
  const config = METRICS[metric]

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Metric" className="flex flex-wrap gap-1">
        {(Object.keys(METRICS) as MetricKey[]).map((key) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={metric === key}
            onClick={() => setMetric(key)}
            className={cn(
              'rounded-md px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
              metric === key && 'bg-accent text-accent-foreground',
            )}
          >
            {METRICS[key].label}
          </button>
        ))}
      </div>
      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
            No readings yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {metric === 'fill' ? (
              <AreaChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={config.color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={config.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="hour" tickFormatter={formatHour} tick={{ fontSize: 11 }} minTickGap={40} stroke="var(--muted-foreground)" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" unit="%" />
                <Tooltip
                  labelFormatter={(l) => formatHour(String(l))}
                  formatter={(v) => [`${v}%`, 'Avg fill']}
                  contentStyle={{ borderRadius: 8, borderColor: 'var(--border)', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="fill" stroke={config.color} strokeWidth={2} fill="url(#fillGradient)" />
              </AreaChart>
            ) : (
              <LineChart data={data} margin={{ left: -8, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="hour" tickFormatter={formatHour} tick={{ fontSize: 11 }} minTickGap={40} stroke="var(--muted-foreground)" />
                <YAxis
                  domain={'domain' in config ? config.domain : ['dataMin - 10', 'dataMax + 10']}
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                  tickFormatter={(v) => String(Math.round(v))}
                />
                <Tooltip
                  labelFormatter={(l) => formatHour(String(l))}
                  formatter={(v) => [`${v} ${config.unit}`, `Avg ${config.label.toLowerCase()}`]}
                  contentStyle={{ borderRadius: 8, borderColor: 'var(--border)', fontSize: 12 }}
                />
                {'alert' in config && (
                  <ReferenceLine
                    y={config.alert}
                    stroke="var(--chart-4)"
                    strokeDasharray="4 4"
                    label={{ value: 'Alert', fontSize: 11, fill: 'var(--chart-4)', position: 'insideTopRight' }}
                  />
                )}
                <Line type="monotone" dataKey={metric} stroke={config.color} strokeWidth={2} dot={false} />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
