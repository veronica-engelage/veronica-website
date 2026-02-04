"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type MapboxMapProps = {
  title: string;
  center?: { lat?: number | null; lng?: number | null };
  zoom?: number | null;
  boundaryGeoJsonUrl?: string | null;
};

export function MapboxMap({
  title,
  center,
  zoom = 12,
  boundaryGeoJsonUrl,
}: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;
    const lng = center?.lng ?? -79.9311;
    const lat = center?.lat ?? 32.8323;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: typeof zoom === "number" ? zoom : 12,
      interactive: true,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));

    new mapboxgl.Marker({ color: "#b08a4b" })
      .setLngLat([lng, lat])
      .addTo(map);

    async function addBoundary() {
      if (!boundaryGeoJsonUrl) return;
      try {
        const res = await fetch(boundaryGeoJsonUrl);
        if (!res.ok) return;
        const data = await res.json();
        if (!map.getSource("boundary")) {
          map.addSource("boundary", { type: "geojson", data });
          map.addLayer({
            id: "boundary-line",
            type: "line",
            source: "boundary",
            paint: {
              "line-color": "#b08a4b",
              "line-width": 2,
            },
          });
          map.addLayer({
            id: "boundary-fill",
            type: "fill",
            source: "boundary",
            paint: {
              "fill-color": "#b08a4b",
              "fill-opacity": 0.08,
            },
          });
        }
      } catch {
        // ignore boundary errors
      }
    }

    map.on("load", addBoundary);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [boundaryGeoJsonUrl, center, zoom]);

  return (
    <div className="card overflow-hidden">
      <div ref={containerRef} className="h-[320px] w-full" />
      <div className="p-4 text-xs text-muted">
        <div className="uppercase tracking-[0.18em]">Map</div>
        <div className="mt-2">{title}</div>
      </div>
    </div>
  );
}
