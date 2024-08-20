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
  [station_id: string]: Location;
}

/* Summary data about a subway station */
export interface Station {
  N: Stop[];
  S: Stop[];
  // list of train name strings e.g. [ "L", "G" ]
  routes: Route[];
  last_update: Date;
  // same as station_id above, e.g. L08
  id: string;
  location: Location;
  // station name, e.g. "Bedford Av"
  name: string;
  stops: Stops;
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
    H = "H", // Far Rockaway S
    J = "J",
    L = "L",
    M = "M",
    N = "N",
    Q = "Q",
    R = "R",
    S = "S",
    SI = "SI", // Staten Island Rail
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
    YELLOW = "#FCCC0A", // N, Q, R
    SLATE = "#808183", // S, H, FS
    RED = "#EE352E", // 1, 2, 3
    FOREST = "#00933C", // 4, 5, 6
    PURPLE = "#B933AD", // 7
    SEA = "#0078C6", // SIR
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
  [Route.H]: Color.SLATE,
  [Route.J]: Color.BROWN,
  [Route.L]: Color.GREY,
  [Route.M]: Color.ORANGE,
  [Route.N]: Color.YELLOW,
  [Route.Q]: Color.YELLOW,
  [Route.R]: Color.YELLOW,
  [Route.S]: Color.SLATE,
  [Route.SI]: Color.SEA,
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
