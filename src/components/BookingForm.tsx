"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Phone, Search, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const bookingSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z
    .string()
    .min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres"),
  departure: z.string().min(3, "Le point de départ est requis"),
  arrival: z.string().min(3, "Le point d'arrivée est requis"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  onBookingSubmit: (data: BookingFormData) => void;
  isLoading?: boolean;
}

export function BookingForm({
  onBookingSubmit,
  isLoading = false,
}: BookingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = (data: BookingFormData) => {
    onBookingSubmit(data);
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
            <Label htmlFor="departure">Point de départ</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="departure"
                {...register("departure")}
                placeholder="Adresse de départ"
                className="pl-10"
              />
            </div>
            {errors.departure && (
              <p className="text-sm text-red-500">{errors.departure.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="arrival">Point d&apos;arrivée</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="arrival"
                {...register("arrival")}
                placeholder="Adresse d'arrivée"
                className="pl-10"
              />
            </div>
            {errors.arrival && (
              <p className="text-sm text-red-500">{errors.arrival.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Recherche..." : "Chercher un conducteur"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
