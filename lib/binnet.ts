import type { BinWithLatest, HourlyPoint, Reading } from './types'

export const DEPOT = {
  name: 'Southwark Council Depot',
  latitude: 51.4835,
  longitude: -0.059,
}

export const METHANE_BASELINE = { min: 1939, max: 1945 }
export const CO2_BASELINE = { min: 426, max: 432 }
export const METHANE_ALERT = 2000
export const CO2_ALERT = 460

export type FillTone = 'low' | 'medium' | 'high' | 'critical'

export function fillTone(level: number | null | undefined): FillTone {
  const value = level ?? 0
  if (value >= 90) return 'critical'
  if (value >= 70) return 'high'
  if (value >= 40) return 'medium'
  return 'low'
}

export const FILL_TONE_COLOR: Record<FillTone, string> = {
  low: 'var(--chart-1)',
  medium: 'var(--chart-2)',
  high: 'var(--chart-3)',
  critical: 'var(--chart-4)',
}

export const FILL_TONE_CLASS: Record<FillTone, string> = {
  low: 'bg-chart-1/15 text-chart-1',
  medium: 'bg-chart-2/15 text-chart-2',
  high: 'bg-chart-3/20 text-amber-800',
  critical: 'bg-chart-4/15 text-chart-4',
}

export function airQualityLabel(methane: number | null, co2: number | null) {
  if ((methane ?? 0) >= METHANE_ALERT || (co2 ?? 0) >= CO2_ALERT) {
    return 'elevated' as const
  }
  return 'normal' as const
}

type Point = { latitude: number; longitude: number }

export function haversineKm(a: Point, b: Point) {
  const R = 6371
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function tourLength(points: Point[]) {
  let total = 0
  for (let i = 0; i < points.length - 1; i++) {
    total += haversineKm(points[i], points[i + 1])
  }
  return total
}

/**
 * Nearest-neighbour tour from the depot, refined with 2-opt swaps.
 * Returns stops in visiting order (excluding the depot) and the round-trip distance.
 */
export function optimiseRoute<T extends Point>(stops: T[], depot: Point = DEPOT) {
  if (stops.length === 0) return { order: [] as T[], distanceKm: 0 }

  const remaining = [...stops]
  const order: T[] = []
  let current: Point = depot
  while (remaining.length) {
    let bestIndex = 0
    let bestDistance = Infinity
    remaining.forEach((stop, index) => {
      const d = haversineKm(current, stop)
      if (d < bestDistance) {
        bestDistance = d
        bestIndex = index
      }
    })
    const [next] = remaining.splice(bestIndex, 1)
    order.push(next)
    current = next
  }

  let improved = true
  while (improved) {
    improved = false
    for (let i = 0; i < order.length - 1; i++) {
      for (let j = i + 1; j < order.length; j++) {
        const candidate = [
          ...order.slice(0, i),
          ...order.slice(i, j + 1).reverse(),
          ...order.slice(j + 1),
        ]
        if (
          tourLength([depot, ...candidate, depot]) + 1e-9 <
          tourLength([depot, ...order, depot])
        ) {
          order.splice(0, order.length, ...candidate)
          improved = true
        }
      }
    }
  }

  return { order, distanceKm: tourLength([depot, ...order, depot]) }
}

export function estimateMinutes(distanceKm: number, stops: number) {
  const drivingMinutes = (distanceKm / 15) * 60
  return Math.round(drivingMinutes + stops * 3)
}

/** Keeps the 48 hours leading up to the newest reading so demo data never goes blank. */
export function trimToWindow(readings: Reading[], hours = 48) {
  if (readings.length === 0) return readings
  const newest = Math.max(...readings.map((r) => new Date(r.recorded_at).getTime()))
  const cutoff = newest - hours * 3600 * 1000
  return readings.filter((r) => new Date(r.recorded_at).getTime() >= cutoff)
}

export function hourlyAverages(readings: Reading[]): HourlyPoint[] {
  const buckets = new Map<
    string,
    { fill: number[]; methane: number[]; co2: number[]; battery: number[] }
  >()
  for (const r of readings) {
    const key = r.recorded_at.slice(0, 13)
    const bucket =
      buckets.get(key) ?? { fill: [], methane: [], co2: [], battery: [] }
    bucket.fill.push(Number(r.fill_level))
    if (r.methane_ppm != null) bucket.methane.push(Number(r.methane_ppm))
    if (r.co2_ppm != null) bucket.co2.push(Number(r.co2_ppm))
    if (r.battery_pct != null) bucket.battery.push(Number(r.battery_pct))
    buckets.set(key, bucket)
  }
  const avg = (values: number[]) =>
    values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hour, b]) => ({
      hour: `${hour}:00:00Z`,
      fill: Math.round(avg(b.fill) * 10) / 10,
      methane: Math.round(avg(b.methane) * 10) / 10,
      co2: Math.round(avg(b.co2) * 10) / 10,
      battery: Math.round(avg(b.battery) * 10) / 10,
    }))
}

export type Suggestion = {
  binId: string
  code: string
  name: string
  kind: 'expand' | 'relocate' | 'power' | 'air' | 'offline'
  title: string
  detail: string
  priority: 'high' | 'medium' | 'low'
}

export function networkSuggestions(
  bins: BinWithLatest[],
  readings: Reading[],
): Suggestion[] {
  const byBin = new Map<string, Reading[]>()
  for (const r of readings) {
    const list = byBin.get(r.bin_id) ?? []
    list.push(r)
    byBin.set(r.bin_id, list)
  }

  const suggestions: Suggestion[] = []
  for (const bin of bins) {
    const history = byBin.get(bin.id) ?? []
    const base = { binId: bin.id, code: bin.code, name: bin.name }

    if (bin.status === 'offline' || !bin.latest) {
      suggestions.push({
        ...base,
        kind: 'offline',
        title: 'Node not reporting',
        detail: 'No recent packets reached the main node. Check the mesh link and power supply.',
        priority: 'high',
      })
      continue
    }

    const fills = history.map((r) => Number(r.fill_level))
    const avgFill = fills.length ? fills.reduce((a, b) => a + b, 0) / fills.length : 0
    const hoursAbove80 = fills.filter((f) => f >= 80).length

    if (hoursAbove80 >= 8) {
      suggestions.push({
        ...base,
        kind: 'expand',
        title: 'Add capacity nearby',
        detail: `Above 80% full for ${hoursAbove80} of the last ${fills.length} readings. Install a second bin or upgrade from ${bin.capacity_litres}L.`,
        priority: hoursAbove80 >= 12 ? 'high' : 'medium',
      })
    } else if (fills.length > 12 && avgFill < 25) {
      suggestions.push({
        ...base,
        kind: 'relocate',
        title: 'Under-used location',
        detail: `Averaging ${avgFill.toFixed(0)}% full. Consider relocating to a busier street.`,
        priority: 'low',
      })
    }

    const battery = bin.latest.battery_pct
    if (battery != null && battery < 25) {
      suggestions.push({
        ...base,
        kind: 'power',
        title: 'Low battery',
        detail: `Battery at ${Number(battery).toFixed(0)}%. Inspect the solar panel for shading or dirt and reduce sampling frequency.`,
        priority: battery < 15 ? 'high' : 'medium',
      })
    }

    if (airQualityLabel(bin.latest.methane_ppm, bin.latest.co2_ppm) === 'elevated') {
      suggestions.push({
        ...base,
        kind: 'air',
        title: 'Elevated gas levels',
        detail: `Methane ${Number(bin.latest.methane_ppm).toFixed(0)} ppm, CO₂ ${Number(bin.latest.co2_ppm).toFixed(0)} ppm. Increase collection frequency to limit decomposition.`,
        priority: 'medium',
      })
    }
  }

  const rank = { high: 0, medium: 1, low: 2 }
  return suggestions.sort((a, b) => rank[a.priority] - rank[b.priority])
}

export function formatRelative(iso: string | null | undefined) {
  if (!iso) return 'never'
  const diffMinutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`
  const hours = Math.round(diffMinutes / 60)
  if (hours < 48) return `${hours} h ago`
  return `${Math.round(hours / 24)} days ago`
}
