"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface Booking {
  id: string;
  name: string;
  phone: string;
  departure: string;
  arrival: string;
  distance?: number;
  duration?: number;
  price?: number;
  status: string;
  driverName?: string;
  driverPhone?: string;
  driverCar?: string;
  driverPlate?: string;
  createdAt: string;
}

export function BookingHistory() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchBookings();
    }
  }, [session]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des réservations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "confirmed":
        return "Confirmé";
      case "completed":
        return "Terminé";
      case "cancelled":
        return "Annulé";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des réservations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des réservations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            Connectez-vous pour voir votre historique
          </p>
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des réservations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            Aucune réservation trouvée
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des réservations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{booking.name}</h3>
                    <p className="text-sm text-gray-600">{booking.phone}</p>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {getStatusText(booking.status)}
                  </Badge>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Départ:</span>
                    <span>{booking.departure}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Arrivée:</span>
                    <span>{booking.arrival}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {booking.distance && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{booking.distance.toFixed(1)} km</span>
                    </div>
                  )}
                  {booking.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>
                        {(() => {
                          const totalMinutes = Math.round(
                            booking.duration / 60
                          );
                          const hours = Math.floor(totalMinutes / 60);
                          const minutes = totalMinutes % 60;
                          if (hours > 0) {
                            return `${hours}h${
                              minutes > 0 ? ` ${minutes} min` : ""
                            }`;
                          }
                          return `${minutes} min`;
                        })()}
                      </span>
                    </div>
                  )}
                  {booking.price && (
                    <div className="flex items-center gap-2">
                      <span>{booking.price} FC</span>
                    </div>
                  )}
                </div>

                {booking.driverName && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">
                      Conducteur assigné:
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Nom:</span>{" "}
                        {booking.driverName}
                      </p>
                      <p>
                        <span className="font-medium">Téléphone:</span>{" "}
                        {booking.driverPhone}
                      </p>
                      <p>
                        <span className="font-medium">Véhicule:</span>{" "}
                        {booking.driverCar}
                      </p>
                      <p>
                        <span className="font-medium">Plaque:</span>{" "}
                        {booking.driverPlate}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(booking.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
