import allStations from "./allStations.json";

/* Data about what time a route stops at a station */
export interface Stop {
  // train name string, e.g. "L"
  route: Route;
  // e.g. "2024-08-15T17:33:33-04:00"
  time: Date;
}

/* Latitude & longitude of a locale */
export type Location = [
  latitude: number,
  longitude: number
]

/* Stop IDs and their locations */
// Some stops are comprised of multiple stations
export interface Stops {
  // L08 for "Bedford Av" as station_id
  [stop_id: string]: Location;
}

/* Summary data about a subway station */
export interface StationMeta {
  // same as station_id above, e.g. L08
  id: string;
  location: Location;
  // station name, e.g. "Bedford Av"
  name: string;
  stops: Stops;
}

/* Summary data about a subway station */
export interface Station extends StationMeta {
  N: Stop[];
  S: Stop[];
  // list of train name strings e.g. [ "L", "G" ]
  routes: Route[];
  last_update: Date;
}

/* Stations indexed by their Station IDs */
export interface StationMap {
  // L08 for "Bedford Av" as station_id
  [station_id: string]: StationMeta;
}

/* Response format for all stations API call */
export interface AllStationsResponse {
  stations_json: StationMap;
  station_list: StationMeta[];
  updated: Date;
}

/* Format for a list of stations */
export interface StationList {
  data: Station[];
  updated: Date;
}

/* Format for a list of routes */
export interface RouteList {
  data: Route[];
  updated: Date;
}

/* Format for a train arrival */
export interface Arrival {
  arrival_time: string;
  dest: string;
  direction: string;
  relative: number;
  route: Route;
  trip_id: string;
}

/* Format for a list of arrivals */
export interface ArrivalList {
  arrivals: Arrival[];
  mode: string;
  station_name: string;
  stop_ids: string[];
  updated_readable: string;
  updated: Date;
}

/* Format for a train's data */
export interface TrainStop {
  arrival: string | undefined;
  relative: number;
  stop_id: string;
  stop_name: string;
}

/* Format for a train's data */
export interface Train {
  dest: string;
  direction: string;
  last_position_update: string;
  next_stop ? : TrainStop | null;
  nyct_train_id: string;
  route: Route;
  stops: TrainStop[];
  summary: string;
  trip_id: string;
}

/* Format for a list of lines */
export interface LineList {
  lines: TrainMap;
  updated: Date;
}

/* Format for a map of routes and their trains */
export interface TrainMap {
  [route: string]: Train[]
}

/* Format for data about the next stop for a train */
export interface NextStop extends TrainStop {
  route: Route;
  trip_id: string;
}

/* Format for a map of line connections */
export interface PathSet {
  [stopId: string]: Set < string > ;
}

/* All route types */
export enum Route {
  ONE = "1",
    TWO = "2",
    THREE = "3",
    FOUR = "4",
    FIVE = "5",
    SIX = "6",
    SIXX = "6X",
    SEVEN = "7",
    SEVENX = "7X",
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    E = "E",
    F = "F",
    FS = "FS", // Franklin Ave S
    FX = "FX", // Franklin Ave S
    G = "G",
    GS = "GS", // Grand Central - Times Square S
    H = "H", // Far Rockaway S
    J = "J",
    L = "L",
    M = "M",
    N = "N",
    Q = "Q",
    R = "R",
    S = "S",
    SF = "SF", // Franklin Ave S
    SI = "SI", // Staten Island Rail
    SIR = "SIR", // Staten Island Rail
    SR = "SR", // Far Rockaway S
    SS = "SS", // Staten Island Rail
    W = "W",
    Z = "Z",
}

/* All route icon colors */
export enum Color {
  BLUE = "#0039A6", // A, C, E
    ORANGE = "#FF6319", // B, D, F, M
    GREEN = "#6CBE45", // G
    BROWN = "#996633", // J, Z
    GREY = "#A7A9AC", // L
    YELLOW = "#FCCC0A", // N, Q, R, W
    SLATE = "#808183", // S, GS, H, FS
    RED = "#EE352E", // 1, 2, 3
    FOREST = "#00933C", // 4, 5, 6, 6X
    PURPLE = "#B933AD", // 7, 7X
    SEA = "#0078C6", // SIR, SI, SS
}

/* Map of each route to its icon color */
export const TrainColorMap: Record < Route, Color > = {
  [Route.ONE]: Color.RED,
  [Route.TWO]: Color.RED,
  [Route.THREE]: Color.RED,
  [Route.FOUR]: Color.FOREST,
  [Route.FIVE]: Color.FOREST,
  [Route.SIX]: Color.FOREST,
  [Route.SIXX]: Color.FOREST,
  [Route.SEVEN]: Color.PURPLE,
  [Route.SEVENX]: Color.PURPLE,
  [Route.A]: Color.BLUE,
  [Route.B]: Color.ORANGE,
  [Route.C]: Color.BLUE,
  [Route.D]: Color.ORANGE,
  [Route.E]: Color.BLUE,
  [Route.F]: Color.ORANGE,
  [Route.FS]: Color.SLATE,
  [Route.FX]: Color.ORANGE,
  [Route.G]: Color.GREEN,
  [Route.GS]: Color.SLATE,
  [Route.H]: Color.SLATE,
  [Route.J]: Color.BROWN,
  [Route.L]: Color.GREY,
  [Route.M]: Color.ORANGE,
  [Route.N]: Color.YELLOW,
  [Route.Q]: Color.YELLOW,
  [Route.R]: Color.YELLOW,
  [Route.S]: Color.SLATE,
  [Route.SF]: Color.SLATE,
  [Route.SI]: Color.SEA,
  [Route.SIR]: Color.SEA,
  [Route.SR]: Color.SLATE,
  [Route.SS]: Color.SEA,
  [Route.W]: Color.YELLOW,
  [Route.Z]: Color.BROWN,
};

/* List of icons with black font */
// Each othe route icon has white font
export const BlackFontRoutes = [
  Route.N,
  Route.Q,
  Route.R,
  Route.W,
];

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
