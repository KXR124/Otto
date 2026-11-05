'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  BIN_STATUSES,
  REPORT_CATEGORIES,
  REPORT_STATUSES,
  type BinStatus,
  type ReportStatus,
  type Role,
} from '@/lib/types'

export type ActionState = { ok: boolean; message: string } | null

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function field(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

async function getAuthed() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

async function requireAdmin() {
  const { supabase, user } = await getAuthed()
  if (!user) throw new Error('Not signed in')
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  if (profile?.role !== 'admin') throw new Error('Admin access required')
  return { supabase, user }
}

function refresh() {
  revalidatePath('/dashboard')
  revalidatePath('/admin')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function createReport(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await getAuthed()
  if (!user) return { ok: false, message: 'Please sign in again.' }

  const category = field(formData, 'category')
  const description = field(formData, 'description')
  const binId = field(formData, 'bin_id')

  if (!REPORT_CATEGORIES.some((c) => c.value === category)) {
    return { ok: false, message: 'Choose an issue type.' }
  }
  if (description.length < 3 || description.length > 1000) {
    return { ok: false, message: 'Description must be 3 to 1000 characters.' }
  }
  if (binId && !UUID_RE.test(binId)) {
    return { ok: false, message: 'Unknown bin.' }
  }

  const { error } = await supabase.from('reports').insert({
    user_id: user.id,
    bin_id: binId || null,
    category,
    description,
  })
  if (error) return { ok: false, message: 'Could not submit the report. Please try again.' }

  refresh()
  return { ok: true, message: 'Report submitted. The council team has been notified.' }
}

export async function updateReport(formData: FormData) {
  const { supabase } = await requireAdmin()
  const id = field(formData, 'id')
  const status = field(formData, 'status') as ReportStatus
  const note = field(formData, 'admin_note').slice(0, 1000)
  if (!UUID_RE.test(id) || !REPORT_STATUSES.some((s) => s.value === status)) return

  await supabase
    .from('reports')
    .update({ status, admin_note: note || null, updated_at: new Date().toISOString() })
    .eq('id', id)
  refresh()
}

export async function createBin(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin()
    const code = field(formData, 'code').toUpperCase()
    const name = field(formData, 'name')
    const address = field(formData, 'address')
    const latitude = Number(field(formData, 'latitude'))
    const longitude = Number(field(formData, 'longitude'))
    const capacity = Number(field(formData, 'capacity_litres') || 240)

    if (!/^[A-Z0-9-]{2,20}$/.test(code)) {
      return { ok: false, message: 'Code must be 2-20 letters, numbers or dashes.' }
    }
    if (name.length < 2 || name.length > 120) {
      return { ok: false, message: 'Name must be 2-120 characters.' }
    }
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      return { ok: false, message: 'Latitude must be between -90 and 90.' }
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return { ok: false, message: 'Longitude must be between -180 and 180.' }
    }
    if (!Number.isInteger(capacity) || capacity < 40 || capacity > 5000) {
      return { ok: false, message: 'Capacity must be a whole number of litres (40-5000).' }
    }

    const { error } = await supabase.from('bins').insert({
      code,
      name,
      address: address || null,
      latitude,
      longitude,
      capacity_litres: capacity,
    })
    if (error) {
      return {
        ok: false,
        message: error.code === '23505' ? 'A bin with that code already exists.' : 'Could not add the bin.',
      }
    }
    refresh()
    return { ok: true, message: `Bin ${code} registered.` }
  } catch {
    return { ok: false, message: 'Admin access required.' }
  }
}

export async function updateBinStatus(formData: FormData) {
  const { supabase } = await requireAdmin()
  const id = field(formData, 'id')
  const status = field(formData, 'status') as BinStatus
  if (!UUID_RE.test(id) || !BIN_STATUSES.some((s) => s.value === status)) return
  await supabase.from('bins').update({ status }).eq('id', id)
  refresh()
}

export async function deleteBin(formData: FormData) {
  const { supabase } = await requireAdmin()
  const id = field(formData, 'id')
  if (!UUID_RE.test(id)) return
  await supabase.from('bins').delete().eq('id', id)
  refresh()
}

export async function setUserRole(formData: FormData) {
  const { supabase, user } = await requireAdmin()
  const id = field(formData, 'id')
  const role = field(formData, 'role') as Role
  if (!UUID_RE.test(id) || (role !== 'user' && role !== 'admin')) return
  if (id === user.id) return
  await supabase.from('profiles').update({ role }).eq('id', id)
  revalidatePath('/admin')
}
