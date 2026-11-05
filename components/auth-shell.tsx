import { Logo } from './logo'

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 bg-muted/40 p-6">
      <Logo />
      <div className="w-full max-w-sm">{children}</div>
    </main>
  )
}
