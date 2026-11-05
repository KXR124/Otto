import Link from 'next/link'
import { AuthShell } from '@/components/auth-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthErrorPage() {
  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign-in link failed</CardTitle>
          <CardDescription>The link may have expired or already been used.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/auth/login" className="text-sm font-medium underline underline-offset-4">
            Return to sign in
          </Link>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
