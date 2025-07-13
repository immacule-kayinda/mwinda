"use client";

import { useState } from "react";
import { BookingForm } from "./BookingForm";
import { MapBox } from "./MapBox";
import { DriverResponse } from "./DriverResponse";
import { BookingHistory } from "./BookingHistory";
import { saveBooking } from "@/lib/storage";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Map, History } from "lucide-react";
import { getRoute, RouteResult } from "@/lib/mapbox";
import { RouteInfo } from "./RouteInfo";

interface Driver {
  name: string;
  car: string;
  rating: number;
  phone: string;
  eta: number;
  plate: string;
}

interface BookingData {
  name: string;
  phone: string;
  departure: string;
  arrival: string;
  arrivalCoords?: [number, number];
}

export function MwindaApp() {
  const [isLoading, setIsLoading] = useState(false);
  const [routeData, setRouteData] = useState<RouteResult | null>(null);
  const [currentBooking, setCurrentBooking] = useState<BookingData | null>(
    null
  );
  const [showDriverResponse, setShowDriverResponse] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const handleBookingSubmit = async (data: BookingData) => {
    setIsLoading(true);
    setCurrentBooking(data);

    try {
      // Obtenir l'itinéraire depuis Mapbox
      const route = await getRoute(data.departure, data.arrival);
      setRouteData(route);

      // Sauvegarder la réservation
      saveBooking(data);

      // Simuler la recherche d'un conducteur
      setTimeout(() => {
        const mockDriver = {
          name: "Alex",
          car: "Toyota Corolla",
          rating: 4.8,
          phone: "+33 6 12 34 56 78",
          eta: 3,
          plate: "AB-123-CD",
        };
        setSelectedDriver(mockDriver);
        setShowDriverResponse(true);
        setIsLoading(false);
        toast.success("Conducteur trouvé !");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la réservation:", error);
      toast.error("Erreur lors du calcul de l'itinéraire");
      setIsLoading(false);
    }
  };

  // const handleDriverAccept = () => {
  //   if (currentBooking && selectedDriver) {
  //     // Mettre à jour la réservation avec les infos du conducteur
  //     saveBooking({
  //       ...currentBooking,
  //       driver: selectedDriver,
  //     });
  //     toast.success("Réservation confirmée !");
  //   }
  //   setShowDriverResponse(false);
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mwinda</h1>
          <p className="text-gray-600">
            Votre application de réservation de trajet
          </p>
        </div>

        <Tabs defaultValue="booking" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="booking" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Réserver
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Carte
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Historique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="booking" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <BookingForm
                  onBookingSubmit={handleBookingSubmit}
                  isLoading={isLoading}
                />

                {/* Afficher les informations d'itinéraire */}
                {routeData?.routeInfo && (
                  <RouteInfo
                    distance={routeData.routeInfo.distance}
                    mode={routeData.routeInfo.mode}
                    drivingTime={routeData.routeInfo.drivingTime}
                  />
                )}
              </div>
              <div>
                {currentBooking && (
                  <MapBox
                    routeData={routeData || undefined}
                    isLoading={isLoading}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            {currentBooking ? (
              <div className="space-y-6">
                <MapBox
                  routeData={routeData || undefined}
                  isLoading={isLoading}
                />
                {/* Afficher les informations d'itinéraire aussi sur l'onglet carte */}
                {routeData?.routeInfo && (
                  <RouteInfo
                    distance={routeData.routeInfo.distance}
                    mode={routeData.routeInfo.mode}
                    drivingTime={routeData.routeInfo.drivingTime}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Effectuez une réservation pour voir l&apos;itinéraire sur la
                  carte
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <BookingHistory />
          </TabsContent>
        </Tabs>
      </div>

      <DriverResponse
        isOpen={showDriverResponse}
        onClose={() => setShowDriverResponse(false)}
        driver={selectedDriver || undefined}
        estimatedArrivalTime={
          routeData?.routeInfo?.drivingTime
            ? Math.round(routeData.routeInfo.drivingTime / 60)
            : undefined
        }
      />
    </div>
  );
}
