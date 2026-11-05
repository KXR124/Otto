'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createReport, type ActionState } from '@/app/actions'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { nativeSelectClass } from './stat-card'
import { REPORT_CATEGORIES } from '@/lib/types'

export function ReportForm({ bins }: { bins: { id: string; code: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createReport, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.ok) formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="report-bin">Bin</Label>
          <select id="report-bin" name="bin_id" className={nativeSelectClass} defaultValue="">
            <option value="">Not sure / general</option>
            {bins.map((bin) => (
              <option key={bin.id} value={bin.id}>
                {bin.code} · {bin.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="report-category">Issue type</Label>
          <select id="report-category" name="category" required className={nativeSelectClass} defaultValue="overflowing">
            {REPORT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="report-description">Description</Label>
        <Textarea
          id="report-description"
          name="description"
          required
          minLength={3}
          maxLength={1000}
          rows={3}
          placeholder="What did you notice?"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Submitting...' : 'Submit report'}
        </Button>
        {state && (
          <p role="status" className={state.ok ? 'text-sm text-primary' : 'text-sm text-destructive'}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  )
}
