import allStations from "./allStations.json";
import { PathSet, Train, TrainStop, StationMap, Location, Stops } from "./interfaces";

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
	return (latitude - LOWEST_LAT) * scale;
}

/* Calculate longitude based on map width */
export function calculateLongitude(mapWidth: number, longitude: number) {
	const scale = mapWidth / LON_DIFF;
	return (longitude - LOWEST_LON) * scale;
}

/* Calculate max and min lat and lon from station list */
export function getStationEdges() {
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

/* Calculate station connections from train list */
export function getRouteLines(trains: Train[]): PathSet {
	const pathSet: PathSet = {};
	trains.forEach(({ stops, direction }: Train) => {
		stops.forEach(({ stop_id }: TrainStop, i: number) => {
			if (!pathSet[stop_id]) {
				pathSet[stop_id] = new Set < string > ();
			}
			if (stops[i - 1]) {
				pathSet[stop_id].add(stops[i - 1].stop_id);
			}
			if (stops[i + 1]) {
				pathSet[stop_id].add(stops[i + 1].stop_id);
			}
		});
	});
	return pathSet;
}

/* Convert allStations.json in a StationsMap */
export const AllStationsMap: StationMap = Object.entries(allStations).reduce((map, [id, meta]) => {
	map[id] = {
		...meta,
		location: meta.location as Location,
		stops: Object.entries(meta.stops).reduce((stationStops, [id, loc]) => {
			stationStops[id] = loc as Location;
			return stationStops;
		}, {} as Stops),
	};
	return map;
}, {} as StationMap);
