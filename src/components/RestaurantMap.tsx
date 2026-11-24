import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Restaurant } from '../types';
import { toMapMarkers, markerPopupLines, spreadStackedMarkers } from '../lib/mapModel';

interface RestaurantMapProps {
  restaurants: Restaurant[];
}

const SPAIN_CENTER: [number, number] = [41.6, 1.9];

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

/** Leaflet map that redraws its markers whenever the filtered restaurants change. */
export default function RestaurantMap({ restaurants }: RestaurantMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(SPAIN_CENTER, 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    const map = mapRef.current;
    if (!layer || !map) return;
    layer.clearLayers();
    const byId = new Map(restaurants.map((r) => [r.id, r]));
    const markers = spreadStackedMarkers(toMapMarkers(restaurants));
    for (const m of markers) {
      const r = byId.get(m.id);
      if (!r) continue;
      const closed = r.permanentlyClosed === true;
      const marker = L.circleMarker([m.lat, m.lng], {
        radius: m.winner ? 9 : 6,
        color: closed ? '#78716c' : m.winner ? '#b45309' : '#44403c',
        fillColor: closed ? '#d6d3d1' : m.winner ? '#f59e0b' : '#fafaf9',
        fillOpacity: 0.9,
        weight: 2,
        dashArray: closed ? '3 3' : undefined,
      });
      const html = markerPopupLines(r)
        .map((line, i) => (i === 0 ? `<strong>${escapeHtml(line)}</strong>` : `<div>${escapeHtml(line)}</div>`))
        .join('');
      marker.bindPopup(html);
      marker.addTo(layer);
    }
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 11 });
    }
  }, [restaurants]);

  return <div ref={containerRef} className="h-96 w-full overflow-hidden rounded-2xl border border-stone-200 shadow-sm" role="region" aria-label="Mapa de restaurants" />;
}
