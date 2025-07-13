"use client";

import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AddressSuggestion {
  id: string;
  place_name: string;
  center: [number, number];
  place_type: string[];
}

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
  place_type?: string[];
}

interface AddressAutocompleteProps {
  placeholder: string;
  value: string;
  onChange: (value: string, coordinates?: [number, number]) => void;
  className?: string;
  icon?: React.ReactNode;
}

export function AddressAutocomplete({
  placeholder,
  value,
  onChange,
  className,
  icon = <MapPin className="h-4 w-4" />,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Recherche d'adresses avec debounce
  useEffect(() => {
    const searchAddresses = async () => {
      if (value.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      console.log("🔍 Recherche pour:", value);

      try {
        // 1. D'abord chercher à Kinshasa (priorité locale)
        const localQuery =
          value.toLowerCase().includes("kinshasa") ||
          value.toLowerCase().includes("rdc")
            ? value
            : `${value}, Kinshasa, RDC`;

        let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          localQuery
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        }&country=CD&limit=3&proximity=15.3369,-4.3317&types=address,poi,place`;

        console.log("🏠 URL de recherche Kinshasa (priorité):", url);
        let response = await fetch(url);
        const localData = await response.json();

        // 2. Ensuite chercher globalement pour compléter
        url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          value
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        }&limit=3&types=poi,place`;

        console.log("🌐 URL de recherche globale (complément):", url);
        response = await fetch(url);
        const globalData = await response.json();

        // 3. Combiner les résultats : Kinshasa d'abord, puis global
        const localFeatures = localData.features || [];
        const globalFeatures = globalData.features || [];

        // Filtrer les doublons globaux (éviter les résultats déjà dans Kinshasa)
        const filteredGlobalFeatures = globalFeatures.filter(
          (globalFeature: MapboxFeature) =>
            !localFeatures.some((localFeature: MapboxFeature) =>
              localFeature.place_name
                .toLowerCase()
                .includes(globalFeature.place_name.split(",")[0].toLowerCase())
            )
        );

        // Créer la réponse combinée
        const data = {
          features: [...localFeatures, ...filteredGlobalFeatures].slice(0, 5),
        };

        console.log("🔄 Résultats combinés:", {
          local: localFeatures.length,
          global: filteredGlobalFeatures.length,
          total: data.features.length,
        });

        if (response.ok) {
          console.log("🔍 Résultats de recherche:", data);

          const formattedSuggestions: AddressSuggestion[] = data.features.map(
            (feature: MapboxFeature) => ({
              id: feature.id,
              place_name: feature.place_name,
              center: feature.center,
              place_type: feature.place_type || [],
            })
          );

          console.log("✅ Suggestions formatées:", formattedSuggestions);
          setSuggestions(formattedSuggestions);
          setShowSuggestions(formattedSuggestions.length > 0);
        } else {
          console.error("❌ Erreur API géocodage:", response.status);
        }
      } catch (error) {
        console.error("Erreur lors de la recherche d'adresses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchAddresses, 300); // Debounce de 300ms
    return () => clearTimeout(timeoutId);
  }, [value]);

  // Fermer les suggestions si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    onChange(suggestion.place_name, suggestion.center);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const getPlaceIcon = (placeType: string[]) => {
    if (placeType.includes("poi")) return "🏢";
    if (placeType.includes("address")) return "🏠";
    if (placeType.includes("place")) return "📍";
    return "📍";
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute left-3 top-3 text-gray-400">{icon}</div>
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`pl-10 ${className}`}
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
        />
        {isLoading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
            >
              <span className="text-lg">
                {getPlaceIcon(suggestion.place_type)}
              </span>
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">
                  {suggestion.place_name.split(",")[0]}
                </div>
                <div className="text-xs text-gray-500">
                  {suggestion.place_name.split(",").slice(1).join(",").trim()}
                </div>
                {/* Afficher le pays si c'est un résultat global */}
                {!suggestion.place_name.toLowerCase().includes("kinshasa") &&
                  !suggestion.place_name.toLowerCase().includes("congo") && (
                    <div className="text-xs text-blue-600 font-medium">
                      🌍 Résultat international
                    </div>
                  )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
