import { FILL_TONE_CLASS, fillTone } from '@/lib/binnet'
import { cn } from '@/lib/utils'
import type { BinStatus, ReportStatus } from '@/lib/types'

const pill = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap'

export function FillBadge({ level }: { level: number | null | undefined }) {
  if (level == null) return <span className={cn(pill, 'bg-muted text-muted-foreground')}>No data</span>
  return (
    <span className={cn(pill, 'tabular-nums', FILL_TONE_CLASS[fillTone(level)])}>
      {Math.round(level)}%
    </span>
  )
}

export function FillBar({ level }: { level: number | null | undefined }) {
  const value = Math.max(0, Math.min(100, level ?? 0))
  const tone = fillTone(level)
  const color = {
    low: 'bg-chart-1',
    medium: 'bg-chart-2',
    high: 'bg-chart-3',
    critical: 'bg-chart-4',
  }[tone]
  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      aria-label="Fill level"
      className="h-1.5 w-20 overflow-hidden rounded-full bg-muted"
    >
      <div className={cn('h-full rounded-full', color)} style={{ width: `${value}%` }} />
    </div>
  )
}

const BIN_STATUS_CLASS: Record<BinStatus, string> = {
  active: 'bg-chart-1/15 text-chart-1',
  maintenance: 'bg-chart-3/20 text-amber-800',
  offline: 'bg-muted text-muted-foreground',
}

export function BinStatusBadge({ status }: { status: BinStatus }) {
  return <span className={cn(pill, 'capitalize', BIN_STATUS_CLASS[status])}>{status}</span>
}

const REPORT_STATUS_CLASS: Record<ReportStatus, string> = {
  open: 'bg-chart-4/15 text-chart-4',
  in_progress: 'bg-chart-2/15 text-chart-2',
  resolved: 'bg-chart-1/15 text-chart-1',
}

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span className={cn(pill, REPORT_STATUS_CLASS[status])}>
      {status === 'in_progress' ? 'In progress' : status === 'open' ? 'Open' : 'Resolved'}
    </span>
  )
}
