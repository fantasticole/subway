export interface Stop {
  // train name string, e.g. "L"
  route: Route;
  // e.g. "2024-08-15T17:33:33-04:00"
  time: Date;
}

export type Location = [
  latitude: number,
  longitude: number
]

export interface Stops {
  // L08 for "Bedford Av" as station_id
  [station_id: string]: Location;
}

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

export interface StationList {
  data: Station[];
  updated: Date;
}

export interface RouteList {
  data: Route[];
  updated: Date;
}

export enum Route {
  ONE = "1",
    TWO = "2",
    THREE = "3",
    FOUR = "4",
    FIVE = "5",
    SIX = "6",
    SIXX = "6 X",
    SEVEN = "7",
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    E = "E",
    F = "F",
    FS = "FS",
    G = "G",
    H = "H",
    J = "J",
    L = "L",
    M = "M",
    N = "N",
    Q = "Q",
    R = "R",
    S = "S",
    SI = "SI",
    W = "W",
}