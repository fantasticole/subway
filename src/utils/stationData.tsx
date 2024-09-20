import allStations from "./allStations.json";
import { PathSet, Train, TrainStop, StationMap, Location, Stops } from "./interfaces";

interface MapScaleData {
	minLatitude: number;
	minLongitude: number;
	latitudeRange: number;
	longitudeRange: number;
}

export const STATEN_ISLAND_STATIONS = [
	"S17",
	"S11",
	"S20",
	"S28",
	"S25",
	"S18",
	"S23",
	"S27",
	"S19",
	"S16",
	"S24",
	"S22",
	"S21",
	"S26",
	"S14",
	"S15",
	"S13",
	"S31",
	"S29",
	"S30",
	"S09"
];

/* Calculate longitude based on map height & width */
export const generateCalculators = (includeStatenIsland = true) => {
	const {
		minLatitude,
		minLongitude,
		latitudeRange,
		longitudeRange,
	} = getMapScaleData(includeStatenIsland);

	return {
		latitude: (mapHeight: number, lat: number) => {
			const scale = mapHeight / latitudeRange;
			return (lat - minLatitude) * scale;
		},
		longitude: (mapWidth: number, long: number) => {
			const scale = mapWidth / longitudeRange;
			return (long - minLongitude) * scale;
		},
	}
}

/* Calculate max and min lat and lon from station list */
export function getMapScaleData(includeStatenIsland = true): MapScaleData {
	const stations = includeStatenIsland ? Object.values(allStations) : Object.values(allStations).filter((station) => (!STATEN_ISLAND_STATIONS.includes(station.id)));
	const allLocations = stations.map(({ location }) => location).filter(([lat, lon]) => (lat !== 0 && lon !== 0));
	const allLats = allLocations.map(([latitude]) => latitude);
	const allLons = allLocations.map(([, longitude]) => longitude);

	const minLatitude = Math.min(...allLats)
	const minLongitude = Math.min(...allLons);
	const maxLatitude = Math.max(...allLats)
	const maxLongitude = Math.max(...allLons);
	const latitudeRange = maxLatitude - minLatitude;
	const longitudeRange = maxLongitude - minLongitude;

	return {
		minLatitude,
		minLongitude,
		latitudeRange,
		longitudeRange,
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
