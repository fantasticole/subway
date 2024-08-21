import allStations from "../utils/allStations.json";

// Calculated via getStationEdges
/* Lowest latitude from allStations.json */
export const LOWEST_LAT = 40.512764;
/* Lowest longitude from allStations.json */
export const LOWEST_LON = -74.251961;
/* Highest latitude from allStations.json */
export const HIGHEST_LAT = 40.903125;
/* Highest longitude from allStations.json */
export const HIGHEST_LON = -73.755405;

/* Range of station latitudes */
export const LAT_DIFF = 0.39036100000000573;
/* Range of station longitudes */
export const LON_DIFF = 0.4965559999999982;

/* Calculate latitude based on map height */
export function calculateLatitude(mapHeight: number, latitude: number) {
	const scale = mapHeight / LAT_DIFF;
	const diff = (latitude - LOWEST_LAT);
	return (latitude - LOWEST_LAT) * scale;
}

/* Calculate longitude based on map width */
export function calculateLongitude(mapWidth: number, longitude: number) {
	const scale = mapWidth / LON_DIFF;
	return (longitude - LOWEST_LON) * scale;
}

function getStationEdges() {
	const allLocations = Object.values(allStations).map(({ location }) => location);
	const allLats = allLocations.map(([latitude]) => latitude);
	const allLons = allLocations.map(([, longitude]) => longitude);

	const lowestLat = Math.min(...allLats)
	const lowestLon = Math.min(...allLons);
	const highestLat = Math.max(...allLats)
	const highestLon = Math.max(...allLons);

	return {
		lowestLat,
		lowestLon,
		highestLat,
		highestLon,
	};
}
