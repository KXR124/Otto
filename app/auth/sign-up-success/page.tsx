import Link from 'next/link'
import { MailCheck } from 'lucide-react'
import { AuthShell } from '@/components/auth-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignUpSuccessPage() {
  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <MailCheck className="mb-2 size-8 text-primary" aria-hidden="true" />
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>We sent you a confirmation link.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
          <p>Confirm your address, then sign in to open your dashboard.</p>
          <Link href="/auth/login" className="font-medium text-foreground underline underline-offset-4">
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
