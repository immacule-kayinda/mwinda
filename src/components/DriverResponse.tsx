"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Car, Clock, Star, Phone } from "lucide-react";

interface Driver {
  name: string;
  car: string;
  rating: number;
  phone: string;
  eta: number;
  plate: string;
}

interface DriverResponseProps {
  isOpen: boolean;
  onClose: () => void;
  driver?: Driver;
}

const mockDrivers: Driver[] = [
  {
    name: "Alex",
    car: "Toyota Corolla",
    rating: 4.8,
    phone: "+33 6 12 34 56 78",
    eta: 3,
    plate: "AB-123-CD",
  },
  {
    name: "Marie",
    car: "Renault Clio",
    rating: 4.9,
    phone: "+33 6 98 76 54 32",
    eta: 5,
    plate: "XY-789-ZW",
  },
  {
    name: "Thomas",
    car: "Peugeot 208",
    rating: 4.7,
    phone: "+33 6 45 67 89 01",
    eta: 2,
    plate: "EF-456-GH",
  },
];

export function DriverResponse({
  isOpen,
  onClose,
  driver,
}: DriverResponseProps) {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen && !driver) {
      setIsSearching(true);
      // Simuler la recherche d'un conducteur
      setTimeout(() => {
        const randomDriver =
          mockDrivers[Math.floor(Math.random() * mockDrivers.length)];
        setSelectedDriver(randomDriver);
        setIsSearching(false);
      }, 2000);
    } else if (driver) {
      setSelectedDriver(driver);
    }
  }, [isOpen, driver]);

  const handleAccept = () => {
    // Ici vous pourriez ajouter la logique pour accepter le conducteur
    console.log("Conducteur accepté:", selectedDriver);
    onClose();
  };

  const handleCall = () => {
    if (selectedDriver) {
      window.open(`tel:${selectedDriver.phone}`, "_blank");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conducteur trouvé !</DialogTitle>
        </DialogHeader>

        {isSearching ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium">
              Recherche d&apos;un conducteur...
            </p>
            <p className="text-sm text-gray-500 mt-2">Veuillez patienter</p>
          </div>
        ) : selectedDriver ? (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Car className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedDriver.name}
                    </h3>
                    <p className="text-gray-600">{selectedDriver.car}</p>
                    <p className="text-sm text-gray-500">
                      Plaque: {selectedDriver.plate}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Temps d&apos;arrivée
                      </span>
                    </div>
                    <span className="font-medium">
                      {selectedDriver.eta} min
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">Note</span>
                    </div>
                    <span className="font-medium">
                      {selectedDriver.rating}/5
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleCall} variant="outline" className="flex-1">
                <Phone className="h-4 w-4 mr-2" />
                Appeler
              </Button>
              <Button onClick={handleAccept} className="flex-1">
                Accepter
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
