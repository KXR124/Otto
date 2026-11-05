'use client'

import { useMemo, useState } from 'react'
import { Clock, MapPin, Route as RouteIcon } from 'lucide-react'
import { BinMapLoader } from '../bin-map-loader'
import { FillBadge } from '../status-badges'
import { Label } from '../ui/label'
import { DEPOT, estimateMinutes, optimiseRoute } from '@/lib/binnet'
import type { BinWithLatest } from '@/lib/types'

const THRESHOLDS = [50, 60, 70, 80, 90]

export function RoutePlanner({ bins }: { bins: BinWithLatest[] }) {
  const [threshold, setThreshold] = useState(70)

  const { order, distanceKm } = useMemo(() => {
    const due = bins.filter(
      (b) => b.status !== 'offline' && (b.latest?.fill_level ?? 0) >= threshold,
    )
    return optimiseRoute(due)
  }, [bins, threshold])

  const minutes = estimateMinutes(distanceKm, order.length)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <BinMapLoader bins={bins} route={order} showDepot className="h-[460px] w-full rounded-xl" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="threshold">Collect bins filled to at least</Label>
          <div role="radiogroup" aria-labelledby="threshold" id="threshold" className="flex flex-wrap gap-1">
            {THRESHOLDS.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={threshold === t}
                onClick={() => setThreshold(t)}
                className={
                  threshold === t
                    ? 'rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground'
                    : 'rounded-md border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground'
                }
              >
                {t}%
              </button>
            ))}
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-2 rounded-xl border bg-card p-4">
          {[
            { icon: MapPin, label: 'Stops', value: String(order.length) },
            { icon: RouteIcon, label: 'Distance', value: `${distanceKm.toFixed(1)} km` },
            { icon: Clock, label: 'Est. time', value: `${minutes} min` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col gap-1">
              <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                <Icon className="size-3" aria-hidden="true" />
                {label}
              </dt>
              <dd className="text-lg font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        <ol className="flex flex-col gap-1 rounded-xl border bg-card p-2">
          <li className="flex items-center gap-3 rounded-md px-2 py-2 text-sm">
            <span className="flex size-6 items-center justify-center rounded-full bg-foreground text-xs font-medium text-background">
              D
            </span>
            <span className="font-medium">{DEPOT.name}</span>
          </li>
          {order.length === 0 && (
            <li className="px-2 py-4 text-center text-sm text-muted-foreground">
              No bins meet this threshold. No collection needed.
            </li>
          )}
          {order.map((bin, index) => (
            <li key={bin.id} className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground tabular-nums">
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium">{bin.name}</span>
                <span className="truncate text-xs text-muted-foreground">{bin.address}</span>
              </div>
              <FillBadge level={bin.latest?.fill_level} />
            </li>
          ))}
          {order.length > 0 && (
            <li className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-muted-foreground">
              <span className="flex size-6 items-center justify-center rounded-full bg-foreground text-xs font-medium text-background">
                D
              </span>
              Return to depot
            </li>
          )}
        </ol>
      </div>
    </div>
  )
}
