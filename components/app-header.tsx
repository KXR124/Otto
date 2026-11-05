import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { signOut } from '@/app/actions'
import { Logo } from './logo'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import type { Profile } from '@/lib/types'

export function AppHeader({
  profile,
  email,
  active,
}: {
  profile: Profile | null
  email: string | undefined
  active: 'dashboard' | 'admin'
}) {
  const isAdmin = profile?.role === 'admin'
  const links = [
    { href: '/dashboard', label: 'My dashboard', key: 'dashboard' as const },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin console', key: 'admin' as const }] : []),
  ]

  return (
    <header className="sticky top-0 z-[1000] border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Logo href="/dashboard" />
          <nav aria-label="Main" className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                aria-current={active === link.key ? 'page' : undefined}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                  active === link.key && 'bg-accent text-accent-foreground',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end text-right sm:flex">
            <span className="text-sm font-medium leading-tight">{profile?.full_name || email}</span>
            <span className="text-xs capitalize text-muted-foreground">{profile?.role ?? 'user'}</span>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut className="size-4" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Sign out</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
