"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, User, Phone, MapPin, Navigation } from "lucide-react";
import { AddressAutocomplete } from "./AddressAutocomplete";

const bookingSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z
    .string()
    .min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres"),
  arrival: z.string().min(3, "Le point d'arrivée est requis"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  onBookingSubmit: (
    data: BookingFormData & {
      departure: string;
      arrivalCoords?: [number, number];
    }
  ) => void;
  isLoading?: boolean;
}

export function BookingForm({
  onBookingSubmit,
  isLoading = false,
}: BookingFormProps) {
  const [userLocation, setUserLocation] = useState<string>("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string>("");
  const [arrivalValue, setArrivalValue] = useState<string>("");
  const [arrivalCoords, setArrivalCoords] = useState<
    [number, number] | undefined
  >();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  // Géolocalisation automatique au chargement
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setIsLocating(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        "La géolocalisation n'est pas supportée par votre navigateur"
      );
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);

        try {
          // Reverse geocoding pour obtenir l'adresse
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=address&limit=1&country=CD`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.features && data.features.length > 0) {
              setUserLocation(data.features[0].place_name);
            } else {
              setUserLocation(
                `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
              );
            }
          } else {
            setUserLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        } catch {
          setUserLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }

        setIsLocating(false);
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error);
        setLocationError(
          "Impossible d'obtenir votre position. Veuillez autoriser la géolocalisation."
        );
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Plus de temps pour obtenir une position précise
        maximumAge: 30000, // Position plus fraîche
      }
    );
  };

  const handleArrivalChange = (
    value: string,
    coordinates?: [number, number]
  ) => {
    setArrivalValue(value);
    setArrivalCoords(coordinates);
    setValue("arrival", value);
  };

  const onSubmit = (data: BookingFormData) => {
    if (!userLocation) {
      setLocationError("Veuillez autoriser la géolocalisation pour continuer");
      return;
    }

    onBookingSubmit({
      ...data,
      departure: userLocation,
      arrivalCoords: arrivalCoords,
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Réserver un trajet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                {...register("name")}
                placeholder="Votre nom"
                className="pl-10"
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Numéro de téléphone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                {...register("phone")}
                placeholder="Votre numéro"
                className="pl-10"
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Point de départ (votre position)</Label>
            <div className="relative">
              <Navigation className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                value={userLocation || "Détection de votre position..."}
                disabled
                className="pl-10 bg-gray-50"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isLocating}
                className="absolute right-1 top-1"
              >
                {isLocating ? "..." : "Actualiser"}
              </Button>
            </div>
            {locationError && (
              <p className="text-sm text-red-500">{locationError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="arrival">Point d&apos;arrivée</Label>
            <AddressAutocomplete
              placeholder="Où allez-vous ? (ex: Bandal, Gombe...)"
              value={arrivalValue}
              onChange={handleArrivalChange}
              icon={<MapPin className="h-4 w-4" />}
            />
            {errors.arrival && (
              <p className="text-sm text-red-500">{errors.arrival.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isLocating || !userLocation}
          >
            {isLoading ? "Recherche..." : "Chercher un conducteur"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
