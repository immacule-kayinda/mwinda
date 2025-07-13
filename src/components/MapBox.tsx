"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

// Remplacez par votre token Mapbox
mapboxgl.accessToken =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  "pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example";

interface MapBoxProps {
  routeData?: GeoJSON.FeatureCollection;
  isLoading?: boolean;
}

export function MapBox({ routeData, isLoading = false }: MapBoxProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [2.3522, 48.8566], // Paris par défaut
      zoom: 10,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded || !routeData) return;

    // Supprimer les sources et couches existantes
    if (map.current.getSource("route")) {
      map.current.removeLayer("route");
      map.current.removeSource("route");
    }
    if (map.current.getSource("markers")) {
      map.current.removeLayer("markers");
      map.current.removeSource("markers");
    }

    // Ajouter la route
    map.current.addSource("route", {
      type: "geojson",
      data: routeData,
    });

    map.current.addLayer({
      id: "route",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#3b82f6",
        "line-width": 4,
      },
    });

    // Ajouter les marqueurs
    const markers: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: routeData.features[0].geometry.coordinates[0],
          },
          properties: {
            title: "Départ",
            color: "#10b981",
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates:
              routeData.features[0].geometry.coordinates[
                routeData.features[0].geometry.coordinates.length - 1
              ],
          },
          properties: {
            title: "Arrivée",
            color: "#ef4444",
          },
        },
      ],
    };

    map.current.addSource("markers", {
      type: "geojson",
      data: markers,
    });

    map.current.addLayer({
      id: "markers",
      type: "circle",
      source: "markers",
      paint: {
        "circle-radius": 8,
        "circle-color": ["get", "color"],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });

    // Ajuster la vue pour inclure toute la route
    const bounds = new mapboxgl.LngLatBounds();
    routeData.features[0].geometry.coordinates.forEach((coord: number[]) => {
      bounds.extend(coord as [number, number]);
    });
    map.current.fitBounds(bounds, { padding: 50 });
  }, [routeData, mapLoaded]);

  return (
    <Card className="w-full h-96">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Itinéraire
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full h-80">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">
                  Calcul de l&apos;itinéraire...
                </p>
              </div>
            </div>
          )}
          <div ref={mapContainer} className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
  );
}
