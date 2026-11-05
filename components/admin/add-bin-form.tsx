'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createBin, type ActionState } from '@/app/actions'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

const FIELDS = [
  { name: 'code', label: 'Code', placeholder: 'BN-013', required: true },
  { name: 'name', label: 'Name', placeholder: 'Bankside Pier', required: true },
  { name: 'address', label: 'Address', placeholder: 'Bankside, SE1', required: false },
  { name: 'latitude', label: 'Latitude', placeholder: '51.5080', required: true, type: 'number', step: 'any' },
  { name: 'longitude', label: 'Longitude', placeholder: '-0.0960', required: true, type: 'number', step: 'any' },
  { name: 'capacity_litres', label: 'Capacity (L)', placeholder: '240', required: false, type: 'number', step: '1' },
]

export function AddBinForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createBin, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.ok) formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FIELDS.map((f) => (
          <div key={f.name} className="grid gap-1.5">
            <Label htmlFor={`bin-${f.name}`}>{f.label}</Label>
            <Input
              id={`bin-${f.name}`}
              name={f.name}
              placeholder={f.placeholder}
              required={f.required}
              type={f.type ?? 'text'}
              step={f.step}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Registering...' : 'Register bin'}
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
