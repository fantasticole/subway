export interface Stop {
  route: string; // train name string
  time: Date;
}

export type Location = [
  latitude: number,
  longitude: number
]

export interface Stops {
  [station_id: string]: Location;
}

export interface Station {
  N: Stop[];
  S: Stop[];
  routes: string[]; // list of train name strings
  last_update: Date,
    id: string;
  location: Location;
  name: string; // station name
  stops: Stops;
}

export interface StationList {
  data: Station[];
  updated: Date;
}