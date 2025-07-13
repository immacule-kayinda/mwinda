const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export async function getRoute(
  departure: string,
  arrival: string
): Promise<GeoJSON.FeatureCollection> {
  if (!MAPBOX_TOKEN) {
    throw new Error("Token Mapbox manquant");
  }

  // Géocoder les adresses pour obtenir les coordonnées
  const departureCoords = await geocodeAddress(departure);
  const arrivalCoords = await geocodeAddress(arrival);

  // Appeler l'API Directions
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${departureCoords.join(
    ","
  )};${arrivalCoords.join(
    ","
  )}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
  const response = await fetch(url);
  if (!response.ok)
    throw new Error("Erreur lors de la récupération de l'itinéraire");
  const data = await response.json();
  return data.routes[0].geometry as GeoJSON.FeatureCollection;
}

async function geocodeAddress(address: string): Promise<[number, number]> {
  if (!MAPBOX_TOKEN) {
    throw new Error("Token Mapbox manquant");
  }
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    address
  )}.json?access_token=${MAPBOX_TOKEN}&country=FR&limit=1`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Erreur lors du géocodage");
  const data = await response.json();
  if (data.features && data.features.length > 0) {
    return data.features[0].center;
  } else {
    throw new Error("Adresse non trouvée");
  }
}
