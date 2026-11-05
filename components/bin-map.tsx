'use client'

import 'leaflet/dist/leaflet.css'
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, Tooltip } from 'react-leaflet'
import { DEPOT, FILL_TONE_COLOR, fillTone } from '@/lib/binnet'
import type { BinWithLatest } from '@/lib/types'

export type BinMapProps = {
  bins: BinWithLatest[]
  route?: BinWithLatest[]
  showDepot?: boolean
  className?: string
}

export default function BinMap({ bins, route, showDepot = false, className }: BinMapProps) {
  const center: [number, number] = bins.length
    ? [
        bins.reduce((s, b) => s + b.latitude, 0) / bins.length,
        bins.reduce((s, b) => s + b.longitude, 0) / bins.length,
      ]
    : [DEPOT.latitude, DEPOT.longitude]

  const routeIds = new Map(route?.map((b, i) => [b.id, i + 1]))
  const routeLine: [number, number][] | null = route?.length
    ? [
        [DEPOT.latitude, DEPOT.longitude],
        ...route.map((b) => [b.latitude, b.longitude] as [number, number]),
        [DEPOT.latitude, DEPOT.longitude],
      ]
    : null

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      className={className ?? 'h-[380px] w-full rounded-xl'}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {routeLine && (
        <Polyline positions={routeLine} pathOptions={{ color: 'oklch(0.46 0.1 160)', weight: 4, opacity: 0.8 }} />
      )}
      {(showDepot || routeLine) && (
        <CircleMarker
          center={[DEPOT.latitude, DEPOT.longitude]}
          radius={9}
          pathOptions={{ color: '#1f2937', fillColor: '#1f2937', fillOpacity: 1 }}
        >
          <Tooltip direction="top">{DEPOT.name}</Tooltip>
        </CircleMarker>
      )}
      {bins.map((bin) => {
        const level = bin.latest?.fill_level ?? null
        const offline = bin.status === 'offline' || level == null
        const color = offline ? '#9ca3af' : FILL_TONE_COLOR[fillTone(level)]
        const stop = routeIds.get(bin.id)
        return (
          <CircleMarker
            key={bin.id}
            center={[bin.latitude, bin.longitude]}
            radius={stop ? 11 : 8}
            pathOptions={{ color: '#ffffff', weight: 2, fillColor: color, fillOpacity: 0.95 }}
          >
            {stop && (
              <Tooltip permanent direction="center" className="route-stop-label">
                {stop}
              </Tooltip>
            )}
            <Popup>
              <div className="flex flex-col gap-0.5 text-xs">
                <strong className="text-sm">
                  {bin.code} · {bin.name}
                </strong>
                <span>{bin.address}</span>
                <span>Fill: {level == null ? 'no data' : `${Math.round(level)}%`}</span>
                {bin.latest?.methane_ppm != null && <span>Methane: {Math.round(bin.latest.methane_ppm)} ppm</span>}
                {bin.latest?.co2_ppm != null && <span>CO₂: {Math.round(bin.latest.co2_ppm)} ppm</span>}
                {bin.latest?.battery_pct != null && <span>Battery: {Math.round(bin.latest.battery_pct)}%</span>}
                <span className="capitalize">Status: {bin.status}</span>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
