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

import { RouteResult } from "@/lib/mapbox";

interface MapBoxProps {
  routeData?: RouteResult;
  isLoading?: boolean;
}

export function MapBox({ routeData, isLoading = false }: MapBoxProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number]>([
    15.3369, -4.3317,
  ]);

  useEffect(() => {
    // Obtenir la position de l'utilisateur avec haute précision
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`Position obtenue - Précision: ${accuracy}m`);
          setUserLocation([longitude, latitude]);
        },
        (error) => {
          console.warn(
            "Géolocalisation échouée, utilisation de Kinshasa par défaut:",
            error
          );
          // Garde la position par défaut de Kinshasa
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // Augmenté à 15 secondes
          maximumAge: 60000, // Réduit à 1 minute pour plus de fraîcheur
        }
      );

      // Optionnel : Surveillance continue de la position
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`Position mise à jour - Précision: ${accuracy}m`);
          if (accuracy < 100) {
            // Seulement si précision < 100m
            setUserLocation([longitude, latitude]);
          }
        },
        (error) => {
          console.warn("Erreur de surveillance de position:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000, // 30 secondes
        }
      );

      // Nettoyage
      return () => {
        if (watchId) {
          navigator.geolocation.clearWatch(watchId);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: userLocation,
      zoom: 15,
    });

    map.current.on("load", () => {
      setMapLoaded(true);

      // Ajouter le marqueur de position utilisateur
      addUserLocationMarker();
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [userLocation]);

  const addUserLocationMarker = () => {
    if (!map.current || !mapLoaded) return;

    // Supprimer le marqueur existant s'il existe
    if (map.current.getSource("user-location")) {
      map.current.removeLayer("user-location");
      map.current.removeSource("user-location");
    }

    // Ajouter la source pour la position utilisateur
    map.current.addSource("user-location", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: userLocation,
            },
            properties: {
              title: "Votre position",
            },
          },
        ],
      },
    });

    // Ajouter le cercle de position (style GPS)
    map.current.addLayer({
      id: "user-location",
      type: "circle",
      source: "user-location",
      paint: {
        "circle-radius": 12,
        "circle-color": "#007cbf",
        "circle-stroke-width": 3,
        "circle-stroke-color": "#ffffff",
        "circle-opacity": 0.8,
      },
    });

    // Ajouter un point central plus petit
    map.current.addLayer({
      id: "user-location-dot",
      type: "circle",
      source: "user-location",
      paint: {
        "circle-radius": 4,
        "circle-color": "#ffffff",
        "circle-stroke-width": 0,
      },
    });
  };

  // Mettre à jour le marqueur utilisateur quand la position change
  useEffect(() => {
    if (mapLoaded) {
      addUserLocationMarker();
    }
  }, [userLocation, mapLoaded]);

  useEffect(() => {
    if (
      !map.current ||
      !mapLoaded ||
      !routeData ||
      !routeData.features ||
      routeData.features.length === 0
    )
      return;

    // Supprimer les sources et couches existantes
    if (map.current.getSource("route")) {
      map.current.removeLayer("route");
      map.current.removeSource("route");
    }
    if (map.current.getSource("markers")) {
      map.current.removeLayer("markers");
      map.current.removeSource("markers");
    }

    // Garder le marqueur utilisateur visible même avec la route
    if (!map.current.getSource("user-location")) {
      addUserLocationMarker();
    }

    try {
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
      const routeGeometry = routeData.features[0]
        .geometry as GeoJSON.LineString;
      const markers: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: routeGeometry.coordinates[0],
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
                routeGeometry.coordinates[routeGeometry.coordinates.length - 1],
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
      routeGeometry.coordinates.forEach((coord: number[]) => {
        bounds.extend(coord as [number, number]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    } catch (error) {
      console.error("Erreur lors de l'affichage de la route:", error);
    }
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
