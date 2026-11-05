import { redirect } from 'next/navigation'
import { createClient } from './supabase/server'
import { trimToWindow } from './binnet'
import type { BinWithLatest, Profile, Reading, Report } from './types'

const PROFILE_COLUMNS = 'id, full_name, email, role, created_at'
const READING_COLUMNS =
  'bin_id, recorded_at, fill_level, methane_ppm, co2_ppm, battery_pct, packet_number'

function toReading(row: Record<string, unknown>): Reading {
  const num = (v: unknown) => (v == null ? null : Number(v))
  return {
    bin_id: String(row.bin_id),
    recorded_at: String(row.recorded_at),
    fill_level: Number(row.fill_level),
    methane_ppm: num(row.methane_ppm),
    co2_ppm: num(row.co2_ppm),
    battery_pct: num(row.battery_pct),
    packet_number: num(row.packet_number),
  }
}

export async function getViewer() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', user.id)
    .maybeSingle<Profile>()
  return { user, profile }
}

export async function requireViewer() {
  const viewer = await getViewer()
  if (!viewer) redirect('/auth/login')
  return viewer
}

export async function getBinsWithLatest(): Promise<BinWithLatest[]> {
  const supabase = await createClient()
  const [{ data: bins }, { data: latest }] = await Promise.all([
    supabase
      .from('bins')
      .select(
        'id, code, name, address, latitude, longitude, capacity_litres, status, installed_at',
      )
      .order('code'),
    supabase.from('bin_latest').select(READING_COLUMNS),
  ])
  const latestByBin = new Map(
    (latest ?? []).map((row) => [row.bin_id as string, toReading(row)]),
  )
  return (bins ?? []).map((bin) => ({
    ...bin,
    latitude: Number(bin.latitude),
    longitude: Number(bin.longitude),
    latest: latestByBin.get(bin.id) ?? null,
  })) as BinWithLatest[]
}

export async function getRecentReadings(hours = 48): Promise<Reading[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('readings')
    .select(READING_COLUMNS)
    .order('recorded_at', { ascending: false })
    .limit(3000)
  return trimToWindow((data ?? []).map(toReading), hours)
}

export async function getReports(options: { userId?: string } = {}): Promise<Report[]> {
  const supabase = await createClient()
  let query = supabase
    .from('reports')
    .select(
      'id, bin_id, user_id, category, description, status, admin_note, created_at, updated_at, bin:bins(code, name)',
    )
    .order('created_at', { ascending: false })
    .limit(100)
  if (options.userId) query = query.eq('user_id', options.userId)
  const { data } = await query
  return (data ?? []) as unknown as Report[]
}

export async function getProfiles(): Promise<Profile[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .order('created_at', { ascending: true })
  return (data ?? []) as Profile[]
}
