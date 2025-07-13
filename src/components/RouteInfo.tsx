"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, DollarSign, Car } from "lucide-react";

interface RouteInfoProps {
  distance?: number; // en mètres
  duration?: number; // en secondes
  mode?: "driving" | "walking";
  drivingTime?: number; // temps réel en voiture depuis Mapbox
}

export function RouteInfo({
  distance,
  mode = "driving",
  drivingTime,
}: RouteInfoProps) {
  if (!distance) return null;

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  // Utiliser le temps réel de Mapbox ou estimation de fallback
  const getDrivingTime = (): number => {
    if (drivingTime) {
      console.log("🚗 Utilisation du temps Mapbox:", drivingTime, "secondes");
      return drivingTime;
    }

    // Fallback : estimation basée sur la distance
    const distanceKm = distance / 1000;
    let avgSpeed: number;
    if (distanceKm <= 5) {
      avgSpeed = 20; // Centre-ville, trafic dense
    } else if (distanceKm <= 15) {
      avgSpeed = 30; // Zones urbaines
    } else if (distanceKm <= 30) {
      avgSpeed = 40; // Périphérie
    } else {
      avgSpeed = 50; // Routes principales
    }

    const estimatedTime = (distanceKm / avgSpeed) * 3600;
    console.log("⚠️ Utilisation de l'estimation:", estimatedTime, "secondes");
    return estimatedTime;
  };

  const finalDrivingTime = getDrivingTime();

  const estimatePrice = (distanceKm: number): string => {
    // Prix estimé basé sur la distance (exemple pour Kinshasa)
    const basePrice = 1000; // Prix de base en FC
    const pricePerKm = 500; // Prix par km en FC
    const totalPrice = basePrice + distanceKm * pricePerKm;
    return `${Math.round(totalPrice)} FC`;
  };

  const distanceKm = distance / 1000;
  const modeIcon =
    mode === "driving" ? (
      <Car className="h-4 w-4" />
    ) : (
      <MapPin className="h-4 w-4" />
    );
  const modeText = mode === "driving" ? "En voiture" : "À pied";

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {modeIcon}
          Informations du trajet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <MapPin className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Distance</p>
              <p className="font-semibold text-gray-900">
                {formatDistance(distance)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <Car className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">
                Durée en voiture {drivingTime ? "(Mapbox)" : "(estimée)"}
              </p>
              <p className="font-semibold text-gray-900">
                {formatDuration(finalDrivingTime)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <DollarSign className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Prix estimé</p>
              <p className="font-semibold text-gray-900">
                {estimatePrice(distanceKm)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {modeIcon}
            <span>{modeText}</span>
            <span className="mx-2">•</span>
            <span>Itinéraire optimal calculé</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
