export interface Stop {
  // train name string, e.g. "L"
  route: string;
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
  routes: string[];
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