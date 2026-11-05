import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AlertTriangle, Inbox, Trash2, Wind } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AddBinForm } from '@/components/admin/add-bin-form'
import { BinsManager } from '@/components/admin/bins-manager'
import { ReportsManager } from '@/components/admin/reports-manager'
import { RoutePlanner } from '@/components/admin/route-planner'
import { SuggestionsList } from '@/components/admin/suggestions-list'
import { UsersManager } from '@/components/admin/users-manager'
import { BinMapLoader, MapLegend } from '@/components/bin-map-loader'
import { SectionHeading, StatCard } from '@/components/stat-card'
import { TrendChart } from '@/components/trend-chart'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { airQualityLabel, hourlyAverages, networkSuggestions } from '@/lib/binnet'
import { getBinsWithLatest, getProfiles, getRecentReadings, getReports, requireViewer } from '@/lib/data'

export const metadata: Metadata = { title: 'Admin console | biNNet' }

export default async function AdminPage() {
  const { user, profile } = await requireViewer()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const [bins, readings, reports, profiles] = await Promise.all([
    getBinsWithLatest(),
    getRecentReadings(),
    getReports(),
    getProfiles(),
  ])

  const offline = bins.filter((b) => b.status === 'offline' || !b.latest).length
  const dueForCollection = bins.filter(
    (b) => b.status !== 'offline' && (b.latest?.fill_level ?? 0) >= 70,
  ).length
  const elevatedAir = bins.filter(
    (b) => b.latest && airQualityLabel(b.latest.methane_ppm, b.latest.co2_ppm) === 'elevated',
  ).length
  const openReports = reports.filter((r) => r.status !== 'resolved').length
  const suggestions = networkSuggestions(bins, readings)

  return (
    <div className="min-h-svh bg-muted/30">
      <AppHeader profile={profile} email={user.email} active="admin" />
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Admin console</h1>
          <p className="text-muted-foreground">
            Plan collections, triage public reports and manage the sensor network.
          </p>
        </div>

        <section aria-label="Network summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Bins in network" value={String(bins.length)} hint={`${offline} offline`} icon={Trash2} />
          <StatCard label="Due for collection" value={String(dueForCollection)} hint="70% full or more" icon={AlertTriangle} />
          <StatCard label="Elevated air quality" value={String(elevatedAir)} hint="Methane or CO₂ above alert" icon={Wind} />
          <StatCard label="Open reports" value={String(openReports)} hint={`${reports.length} total`} icon={Inbox} />
        </section>

        <Tabs defaultValue="overview" className="gap-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="routes">Collection routes</TabsTrigger>
            <TabsTrigger value="reports">
              Reports{openReports > 0 && <span className="ml-1 rounded-full bg-chart-4 px-1.5 text-xs text-white">{openReports}</span>}
            </TabsTrigger>
            <TabsTrigger value="bins">Bins</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex flex-col gap-6">
            <div className="grid gap-6 lg:grid-cols-5">
              <Card className="lg:col-span-3">
                <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
                  <SectionHeading title="Network map" description="Live fill level at every node." />
                  <MapLegend />
                </CardHeader>
                <CardContent>
                  <BinMapLoader bins={bins} showDepot />
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <SectionHeading title="Sensor trends" description="Hourly averages, last 48 hours." />
                </CardHeader>
                <CardContent>
                  <TrendChart data={hourlyAverages(readings)} />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <SectionHeading
                  title="Network recommendations"
                  description="Generated from fill history, battery and gas readings to guide maintenance and expansion."
                />
              </CardHeader>
              <CardContent>
                <SuggestionsList suggestions={suggestions} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="routes">
            <Card>
              <CardHeader>
                <SectionHeading
                  title="Optimised collection route"
                  description="Shortest round trip from the depot covering every bin above the threshold."
                />
              </CardHeader>
              <CardContent>
                <RoutePlanner bins={bins} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <SectionHeading title="Public reports" description="Update the status and leave a note the reporter can see." />
              </CardHeader>
              <CardContent>
                <ReportsManager reports={reports} profiles={profiles} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bins" className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <SectionHeading title="Register a new bin" description="Add a sensor node to the network." />
              </CardHeader>
              <CardContent>
                <AddBinForm />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <SectionHeading title="All bins" description="Change node status or remove decommissioned bins." />
              </CardHeader>
              <CardContent>
                <BinsManager bins={bins} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <SectionHeading title="Accounts" description="Promote council staff to admin or revoke access." />
              </CardHeader>
              <CardContent>
                <UsersManager profiles={profiles} currentUserId={user.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
