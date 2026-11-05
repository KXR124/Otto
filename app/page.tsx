import Link from 'next/link'
import { Gauge, MapPinned, Route, Sun, Wind, Waypoints } from 'lucide-react'
import { Logo } from '@/components/logo'
import { buttonVariants } from '@/components/ui/button'
import { getViewer } from '@/lib/data'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: Gauge,
    title: 'Fill level to within 5%',
    body: 'Ultrasonic sensing in every bin reports how full it is, so crews only visit bins that need emptying.',
  },
  {
    icon: Wind,
    title: 'Methane and CO₂ monitoring',
    body: 'Gas sensors track decomposition around each bin and flag readings above typical atmospheric levels.',
  },
  {
    icon: Route,
    title: 'Optimised collection routes',
    body: 'Routes are generated from live fill data, starting and finishing at the depot with the shortest path.',
  },
  {
    icon: Waypoints,
    title: 'Self-healing mesh network',
    body: 'Nodes relay packets through each other to the main node, so one weak link does not break coverage.',
  },
  {
    icon: Sun,
    title: 'Solar powered',
    body: 'An 18650 cell and lid-mounted panel keep each node running without mains power or battery swaps.',
  },
  {
    icon: MapPinned,
    title: 'Network expansion advice',
    body: 'Usage patterns highlight where bins overflow and where capacity is wasted, guiding future placement.',
  },
]

export default async function HomePage() {
  const viewer = await getViewer()

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <nav className="flex items-center gap-2">
            {viewer ? (
              <Link href="/dashboard" className={buttonVariants()}>
                Open dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className={buttonVariants({ variant: 'ghost' })}>
                  Sign in
                </Link>
                <Link href="/auth/sign-up" className={buttonVariants()}>
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-20 md:py-28">
          <p className="w-fit rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
            Smart waste infrastructure for local councils
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            Collect the bins that are full. Skip the ones that are not.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            biNNet turns ordinary street bins into a connected sensor network. See fill levels and air
            quality across the borough in near real time, dispatch crews on optimised routes and plan
            where the network should grow next.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={viewer ? '/dashboard' : '/auth/sign-up'} className={cn(buttonVariants({ size: 'lg' }))}>
              {viewer ? 'Go to dashboard' : 'Create an account'}
            </Link>
            <Link href="#how" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
              How it works
            </Link>
          </div>
          <dl className="grid max-w-3xl grid-cols-2 gap-6 border-t pt-8 md:grid-cols-4">
            {[
              ['9%', 'of Southwark budget spent on waste'],
              ['£12.1m', 'spent cleaning streets each year'],
              ['£38.96', 'hardware cost per node'],
              ['±5%', 'fill-level accuracy target'],
            ].map(([value, label]) => (
              <div key={label} className="flex flex-col gap-1">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="order-first text-2xl font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="how" className="border-t bg-muted/40">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20">
            <div className="flex max-w-2xl flex-col gap-3">
              <h2 className="text-3xl font-semibold tracking-tight">From sensor to street</h2>
              <p className="text-muted-foreground leading-relaxed">
                Sensor nodes report a timestamp, fill level, methane, CO₂, battery status and packet number
                through the mesh to the main node, which stores everything in the database behind these
                dashboards.
              </p>
            </div>
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex flex-col gap-3 rounded-xl border bg-card p-6">
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                  <h3 className="font-medium">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-6 py-6 text-sm text-muted-foreground md:flex-row">
          <span>biNNet, Group 5</span>
          <span>Supporting SDG 9, 11 and 13</span>
        </div>
      </footer>
    </div>
  )
}
