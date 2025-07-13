const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export interface RouteResult extends GeoJSON.FeatureCollection {
  routeInfo: {
    distance: number;
    duration: number;
    mode: "driving" | "walking";
    drivingTime?: number; // Temps réel en voiture depuis Mapbox
  };
}

export async function getRoute(
  departure: string,
  arrival: string
): Promise<RouteResult> {
  if (!MAPBOX_TOKEN) {
    throw new Error("Token Mapbox manquant");
  }

  // Vérifier si departure est déjà des coordonnées GPS
  let departureCoords: [number, number];
  if (departure.includes(",") && departure.split(",").length === 2) {
    // C'est déjà des coordonnées GPS (latitude, longitude) → convertir en (longitude, latitude)
    const coords = departure
      .split(",")
      .map((coord) => parseFloat(coord.trim()));
    if (!isNaN(coords[0]) && !isNaN(coords[1])) {
      // Inverser : coords[0] = latitude, coords[1] = longitude → [longitude, latitude]
      departureCoords = [coords[1], coords[0]];
      console.log("🔄 Coordonnées inversées:", departure, "→", departureCoords);
    } else {
      // Si les coordonnées ne sont pas valides, géocoder comme une adresse
      departureCoords = await geocodeAddress(departure);
    }
  } else {
    // C'est une adresse, on la géocode
    departureCoords = await geocodeAddress(departure);
  }

  // Géocoder l'adresse d'arrivée
  const arrivalCoords = await geocodeAddress(arrival);

  // Essayer d'abord avec le mode driving, puis walking si ça échoue
  const tryGetRoute = async (mode: string) => {
    const url = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${departureCoords.join(
      ","
    )};${arrivalCoords.join(
      ","
    )}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;

    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Erreur API Directions (${mode}):`,
        response.status,
        errorText
      );
      throw new Error(`Erreur API Directions: ${response.status}`);
    }

    const data = await response.json();
    console.log(`📍 Réponse API Directions (${mode}):`, data);

    // Vérifier la cohérence des données
    if (data.routes && data.routes[0]) {
      const route = data.routes[0];
      const distanceKm = route.distance / 1000;
      const durationHours = route.duration / 3600;
      const speed = distanceKm / durationHours;

      console.log(`🔍 Vérification ${mode}:`, {
        distance: `${distanceKm.toFixed(1)} km`,
        duration: `${(route.duration / 60).toFixed(0)} min`,
        speed: `${speed.toFixed(1)} km/h`,
      });

      // Corriger les durées irréalistes pour la marche
      if (mode === "walking" && speed > 6) {
        console.warn(
          `⚠️ Vitesse de marche irréaliste (${speed.toFixed(
            1
          )} km/h), correction...`
        );
        // Vitesse de marche normale : 4-5 km/h
        route.duration = (distanceKm / 4.5) * 3600; // 4.5 km/h
        console.log(
          `✅ Durée corrigée: ${(route.duration / 60).toFixed(0)} min`
        );
      }
    }

    return data;
  };

  console.log("🚗 Calcul itinéraire:", {
    departure: departure,
    arrival: arrival,
    departureCoords: departureCoords,
    arrivalCoords: arrivalCoords,
  });

  try {
    // Essayer d'obtenir les deux : driving ET walking
    let drivingData = null;
    let walkingData = null;
    let primaryData;
    let usedMode: "driving" | "walking" = "driving";

    // 1. Essayer driving
    try {
      drivingData = await tryGetRoute("driving");
      primaryData = drivingData;
      usedMode = "driving";
      console.log("✅ Itinéraire voiture obtenu");
    } catch (error) {
      console.warn("⚠️ Mode driving échoué:", error);
    }

    // 2. Essayer walking (toujours, pour avoir une alternative)
    try {
      walkingData = await tryGetRoute("walking");
      if (!primaryData) {
        primaryData = walkingData;
        usedMode = "walking";
      }
      console.log("✅ Itinéraire à pied obtenu");
    } catch (error) {
      console.warn("⚠️ Mode walking échoué:", error);
    }

    // Si aucun des deux ne marche
    if (!primaryData) {
      throw new Error(
        "Impossible d'obtenir un itinéraire (driving et walking ont échoué)"
      );
    }

    const data = primaryData;

    if (!data.routes || data.routes.length === 0) {
      console.error("❌ Aucune route trouvée dans la réponse:", data);

      // Vérifier s'il y a un message d'erreur spécifique
      if (data.message) {
        throw new Error(`Mapbox: ${data.message}`);
      }

      // Vérifier si les coordonnées sont dans une zone supportée
      throw new Error(
        "Aucun itinéraire trouvé entre ces deux points. Vérifiez que les adresses sont accessibles par route."
      );
    }

    // Créer une FeatureCollection avec la route et les informations
    const route = data.routes[0];

    // Extraire le temps de conduite réel de Mapbox (si disponible)
    const drivingTime = drivingData?.routes?.[0]?.duration || null;

    const routeFeature: GeoJSON.Feature<GeoJSON.LineString> = {
      type: "Feature",
      geometry: route.geometry,
      properties: {
        distance: route.distance,
        duration: route.duration,
        mode: usedMode,
        drivingTime: drivingTime,
      },
    };

    const result = {
      type: "FeatureCollection" as const,
      features: [routeFeature],
      routeInfo: {
        distance: route.distance,
        duration: route.duration,
        mode: usedMode,
        drivingTime: drivingTime,
      },
    };

    console.log("✅ Itinéraire calculé:", result.routeInfo);
    return result;
  } catch (error) {
    console.error("Erreur lors du calcul de l'itinéraire:", error);
    throw new Error("Impossible de calculer l'itinéraire");
  }
}

async function geocodeAddress(address: string): Promise<[number, number]> {
  if (!MAPBOX_TOKEN) {
    throw new Error("Token Mapbox manquant");
  }

  // Ajouter "Kinshasa, RDC" si pas déjà spécifié pour améliorer la précision
  let searchQuery = address;
  if (
    !address.toLowerCase().includes("kinshasa") &&
    !address.toLowerCase().includes("rdc")
  ) {
    searchQuery = `${address}, Kinshasa, RDC`;
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    searchQuery
  )}.json?access_token=${MAPBOX_TOKEN}&country=CD&limit=1&proximity=15.3369,-4.3317`;

  console.log("🔍 Géocodage:", { address, searchQuery, url });

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erreur géocodage:", response.status, errorText);
      throw new Error(`Erreur géocodage: ${response.status}`);
    }

    const data = await response.json();
    console.log("📍 Résultat géocodage:", data);

    if (data.features && data.features.length > 0) {
      const coords = data.features[0].center;
      console.log("✅ Coordonnées trouvées:", coords, "pour", address);
      return coords;
    } else {
      console.error("❌ Aucune coordonnée trouvée pour:", address);
      throw new Error(`Adresse non trouvée: ${address}`);
    }
  } catch (error) {
    console.error("Erreur de géocodage:", error);
    throw new Error(`Impossible de localiser: ${address}`);
  }
}
