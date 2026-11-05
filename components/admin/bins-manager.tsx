import { Trash } from 'lucide-react'
import { deleteBin, updateBinStatus } from '@/app/actions'
import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { FillBadge } from '../status-badges'
import { nativeSelectClass } from '../stat-card'
import { formatRelative } from '@/lib/binnet'
import { BIN_STATUSES, type BinWithLatest } from '@/lib/types'

export function BinsManager({ bins }: { bins: BinWithLatest[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bin</TableHead>
            <TableHead className="hidden md:table-cell">Location</TableHead>
            <TableHead>Fill</TableHead>
            <TableHead className="hidden lg:table-cell">Packet #</TableHead>
            <TableHead className="hidden lg:table-cell">Last packet</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bins.map((bin) => (
            <TableRow key={bin.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{bin.code}</span>
                  <span className="text-xs text-muted-foreground">
                    {bin.name} · {bin.capacity_litres}L
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                {bin.latitude.toFixed(4)}, {bin.longitude.toFixed(4)}
              </TableCell>
              <TableCell>
                <FillBadge level={bin.latest?.fill_level} />
              </TableCell>
              <TableCell className="hidden tabular-nums lg:table-cell">{bin.latest?.packet_number ?? '-'}</TableCell>
              <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                {formatRelative(bin.latest?.recorded_at)}
              </TableCell>
              <TableCell>
                <form action={updateBinStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={bin.id} />
                  <label className="sr-only" htmlFor={`bin-status-${bin.id}`}>
                    Status for {bin.code}
                  </label>
                  <select
                    id={`bin-status-${bin.id}`}
                    name="status"
                    defaultValue={bin.status}
                    className={nativeSelectClass}
                  >
                    {BIN_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" size="sm" variant="outline" className="h-9">
                    Save
                  </Button>
                </form>
              </TableCell>
              <TableCell className="text-right">
                <form action={deleteBin}>
                  <input type="hidden" name="id" value={bin.id} />
                  <Button type="submit" size="icon" variant="ghost" aria-label={`Remove ${bin.code}`}>
                    <Trash className="size-4 text-destructive" aria-hidden="true" />
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
