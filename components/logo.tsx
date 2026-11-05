import Link from 'next/link'
import { Trash2 } from 'lucide-react'

export function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Trash2 className="size-4" aria-hidden="true" />
      </span>
      <span className="text-lg">
        bi<span className="text-primary">NN</span>et
      </span>
    </Link>
  )
}
