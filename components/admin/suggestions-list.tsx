import { BatteryLow, MapPinned, PlusCircle, WifiOff, Wind } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Suggestion } from '@/lib/binnet'

const ICONS = {
  expand: PlusCircle,
  relocate: MapPinned,
  power: BatteryLow,
  air: Wind,
  offline: WifiOff,
}

const PRIORITY_CLASS = {
  high: 'bg-chart-4/15 text-chart-4',
  medium: 'bg-chart-3/20 text-amber-800',
  low: 'bg-muted text-muted-foreground',
}

export function SuggestionsList({ suggestions }: { suggestions: Suggestion[] }) {
  if (suggestions.length === 0) {
    return (
      <p className="rounded-lg bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
        The network is running smoothly. No recommendations right now.
      </p>
    )
  }
  return (
    <ul className="flex flex-col gap-2">
      {suggestions.map((s) => {
        const Icon = ICONS[s.kind]
        return (
          <li key={`${s.binId}-${s.kind}`} className="flex gap-3 rounded-lg border bg-card p-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium">
                  {s.title} <span className="font-normal text-muted-foreground">· {s.code} {s.name}</span>
                </span>
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', PRIORITY_CLASS[s.priority])}>
                  {s.priority}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
