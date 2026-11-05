import type { Metadata } from 'next'
import { AlertTriangle, BatteryMedium, Gauge, Trash2 } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { BinMapLoader, MapLegend } from '@/components/bin-map-loader'
import { BinTable } from '@/components/bin-table'
import { ReportForm } from '@/components/report-form'
import { SectionHeading, StatCard } from '@/components/stat-card'
import { ReportStatusBadge } from '@/components/status-badges'
import { TrendChart } from '@/components/trend-chart'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getBinsWithLatest, getRecentReadings, getReports, requireViewer } from '@/lib/data'
import { hourlyAverages } from '@/lib/binnet'
import { REPORT_CATEGORIES } from '@/lib/types'

export const metadata: Metadata = { title: 'Dashboard | biNNet' }

export default async function DashboardPage() {
  const { user, profile } = await requireViewer()
  const [bins, readings, reports] = await Promise.all([
    getBinsWithLatest(),
    getRecentReadings(),
    getReports({ userId: user.id }),
  ])

  const reporting = bins.filter((b) => b.latest && b.status !== 'offline')
  const avgFill = reporting.length
    ? reporting.reduce((s, b) => s + (b.latest?.fill_level ?? 0), 0) / reporting.length
    : 0
  const nearlyFull = reporting.filter((b) => (b.latest?.fill_level ?? 0) >= 80).length
  const avgBattery = reporting.length
    ? reporting.reduce((s, b) => s + (b.latest?.battery_pct ?? 0), 0) / reporting.length
    : 0
  const firstName = profile?.full_name?.split(' ')[0]

  return (
    <div className="min-h-svh bg-muted/30">
      <AppHeader profile={profile} email={user.email} active="dashboard" />
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            {firstName ? `Hello, ${firstName}` : 'Your bin network'}
          </h1>
          <p className="text-muted-foreground">
            Live status of bins in your area. Spot a problem? Report it below.
          </p>
        </div>

        <section aria-label="Summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Bins monitored" value={String(bins.length)} hint={`${reporting.length} reporting`} icon={Trash2} />
          <StatCard label="Average fill" value={`${Math.round(avgFill)}%`} icon={Gauge} />
          <StatCard label="Nearly full" value={String(nearlyFull)} hint="80% or more" icon={AlertTriangle} />
          <StatCard label="Average battery" value={`${Math.round(avgBattery)}%`} icon={BatteryMedium} />
        </section>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
              <SectionHeading title="Bin map" description="Tap a bin to see its latest readings." />
              <MapLegend />
            </CardHeader>
            <CardContent>
              <BinMapLoader bins={bins} />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <SectionHeading title="Last 48 hours" description="Network-wide hourly averages." />
            </CardHeader>
            <CardContent>
              <TrendChart data={hourlyAverages(readings)} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <SectionHeading title="All bins" description="Sorted by fill level." />
          </CardHeader>
          <CardContent>
            <BinTable bins={bins} />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <SectionHeading title="Report an issue" description="Overflowing, damaged or smelly bin? Let the council know." />
            </CardHeader>
            <CardContent>
              <ReportForm bins={bins.map(({ id, code, name }) => ({ id, code, name }))} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <SectionHeading title="My reports" description="Track the progress of issues you've raised." />
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <p className="rounded-lg bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
                  You haven&apos;t submitted any reports yet.
                </p>
              ) : (
                <ul className="flex flex-col divide-y">
                  {reports.map((report) => (
                    <li key={report.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium">
                          {REPORT_CATEGORIES.find((c) => c.value === report.category)?.label}
                          {report.bin && <span className="text-muted-foreground"> · {report.bin.code}</span>}
                        </span>
                        <ReportStatusBadge status={report.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                      {report.admin_note && (
                        <p className="rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground">
                          Council: {report.admin_note}
                        </p>
                      )}
                      <time className="text-xs text-muted-foreground" dateTime={report.created_at}>
                        {new Date(report.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
