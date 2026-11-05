import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { BinStatusBadge, FillBadge, FillBar } from './status-badges'
import { airQualityLabel, formatRelative } from '@/lib/binnet'
import type { BinWithLatest } from '@/lib/types'

export function BinTable({ bins }: { bins: BinWithLatest[] }) {
  const sorted = [...bins].sort(
    (a, b) => (b.latest?.fill_level ?? -1) - (a.latest?.fill_level ?? -1),
  )
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bin</TableHead>
            <TableHead>Fill</TableHead>
            <TableHead className="hidden md:table-cell">Air quality</TableHead>
            <TableHead className="hidden md:table-cell">Battery</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Last update</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((bin) => {
            const air = bin.latest ? airQualityLabel(bin.latest.methane_ppm, bin.latest.co2_ppm) : null
            return (
              <TableRow key={bin.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{bin.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {bin.code} · {bin.address}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FillBar level={bin.latest?.fill_level} />
                    <FillBadge level={bin.latest?.fill_level} />
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {air ? (
                    <span className={air === 'elevated' ? 'text-sm font-medium text-chart-4' : 'text-sm text-muted-foreground'}>
                      {air === 'elevated' ? 'Elevated' : 'Normal'}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="hidden tabular-nums md:table-cell">
                  {bin.latest?.battery_pct != null ? `${Math.round(bin.latest.battery_pct)}%` : '-'}
                </TableCell>
                <TableCell>
                  <BinStatusBadge status={bin.status} />
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                  {formatRelative(bin.latest?.recorded_at)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
