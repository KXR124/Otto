export type BinStatus = 'active' | 'maintenance' | 'offline'
export type ReportStatus = 'open' | 'in_progress' | 'resolved'
export type ReportCategory =
  | 'overflowing'
  | 'damaged'
  | 'odour'
  | 'sensor'
  | 'other'
export type Role = 'user' | 'admin'

export type Bin = {
  id: string
  code: string
  name: string
  address: string | null
  latitude: number
  longitude: number
  capacity_litres: number
  status: BinStatus
  installed_at: string
}

export type Reading = {
  bin_id: string
  recorded_at: string
  fill_level: number
  methane_ppm: number | null
  co2_ppm: number | null
  battery_pct: number | null
  packet_number: number | null
}

export type BinWithLatest = Bin & { latest: Reading | null }

export type Report = {
  id: string
  bin_id: string | null
  user_id: string
  category: ReportCategory
  description: string
  status: ReportStatus
  admin_note: string | null
  created_at: string
  updated_at: string
  bin: { code: string; name: string } | null
}

export type Profile = {
  id: string
  full_name: string | null
  email: string | null
  role: Role
  created_at: string
}

export type HourlyPoint = {
  hour: string
  fill: number
  methane: number
  co2: number
  battery: number
}

export const REPORT_CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: 'overflowing', label: 'Overflowing' },
  { value: 'damaged', label: 'Damaged bin' },
  { value: 'odour', label: 'Bad odour' },
  { value: 'sensor', label: 'Sensor fault' },
  { value: 'other', label: 'Other' },
]

export const REPORT_STATUSES: { value: ReportStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
]

export const BIN_STATUSES: { value: BinStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'offline', label: 'Offline' },
]
