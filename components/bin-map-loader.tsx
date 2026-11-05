'use client'

import dynamic from 'next/dynamic'
import type { BinMapProps } from './bin-map'

const BinMap = dynamic(() => import('./bin-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[380px] w-full items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
      Loading map...
    </div>
  ),
})

export function BinMapLoader(props: BinMapProps) {
  return <BinMap {...props} />
}

export function MapLegend() {
  const items = [
    ['bg-chart-1', 'Under 40%'],
    ['bg-chart-2', '40-69%'],
    ['bg-chart-3', '70-89%'],
    ['bg-chart-4', '90%+'],
    ['bg-gray-400', 'Offline'],
  ]
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Map legend">
      {items.map(([color, label]) => (
        <li key={label} className="flex items-center gap-1.5">
          <span className={`size-2.5 rounded-full ${color}`} aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  )
}
