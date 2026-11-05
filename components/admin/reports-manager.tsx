import { updateReport } from '@/app/actions'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ReportStatusBadge } from '../status-badges'
import { nativeSelectClass } from '../stat-card'
import { REPORT_CATEGORIES, REPORT_STATUSES, type Profile, type Report } from '@/lib/types'

export function ReportsManager({ reports, profiles }: { reports: Report[]; profiles: Profile[] }) {
  const reporter = new Map(profiles.map((p) => [p.id, p.full_name || p.email || 'Unknown']))

  if (reports.length === 0) {
    return (
      <p className="rounded-lg bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
        No reports have been submitted yet.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {reports.map((report) => (
        <li key={report.id} className="flex flex-col gap-3 rounded-lg border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">
                {REPORT_CATEGORIES.find((c) => c.value === report.category)?.label}
                <span className="font-normal text-muted-foreground">
                  {' '}
                  · {report.bin ? `${report.bin.code} ${report.bin.name}` : 'General'}
                </span>
              </span>
              <span className="text-xs text-muted-foreground">
                {reporter.get(report.user_id) ?? 'Unknown'} ·{' '}
                {new Date(report.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
            <ReportStatusBadge status={report.status} />
          </div>
          <p className="text-sm leading-relaxed">{report.description}</p>
          <form action={updateReport} className="flex flex-col gap-2 sm:flex-row">
            <input type="hidden" name="id" value={report.id} />
            <label className="sr-only" htmlFor={`status-${report.id}`}>
              Status
            </label>
            <select id={`status-${report.id}`} name="status" defaultValue={report.status} className={nativeSelectClass}>
              {REPORT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor={`note-${report.id}`}>
              Note to reporter
            </label>
            <Input
              id={`note-${report.id}`}
              name="admin_note"
              maxLength={1000}
              defaultValue={report.admin_note ?? ''}
              placeholder="Note to reporter (optional)"
              className="flex-1"
            />
            <Button type="submit" size="sm" className="h-9">
              Update
            </Button>
          </form>
        </li>
      ))}
    </ul>
  )
}
