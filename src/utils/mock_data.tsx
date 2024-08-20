import { Station, StationList, Route, RouteList } from "./interfaces";

export const MOCK_STATION: Station = {
  N: [{
      route: Route.L,
      time: new Date("2024-08-15T17:30:23-04:00")
    },
    {
      route: Route.L,
      time: new Date("2024-08-15T17:33:33-04:00")
    },
    {
      route: Route.L,
      time: new Date("2024-08-15T17:39:12-04:00")
    },
    {
      route: Route.L,
      time: new Date("2024-08-15T17:41:18-04:00")
    },
  ],
  S: [{
      route: Route.L,
      time: new Date("2024-08-15T17:32:31-04:00")
    },
    {
      route: Route.L,
      time: new Date("2024-08-15T17:35:09-04:00")
    },
    {
      route: Route.L,
      time: new Date("2024-08-15T17:39:15-04:00")
    },
    {
      route: Route.L,
      time: new Date("2024-08-15T17:42:45-04:00")
    },
  ],
  routes: [
    Route.L
  ],
  last_update: new Date("2024-08-15T17:29:47-04:00"),
  id: "L08",
  location: [
    40.717304,
    -73.956872
  ],
  name: "Bedford Av",
  stops: {
    L08: [
      40.717304,
      -73.956872
    ]
  }
}

export const MOCK_STATION_LIST: StationList = {
  data: [MOCK_STATION],
  updated: new Date("2024-08-15T17:29:41-04:00")
}

export const MOCK_ROUTES: Route[] = [
  Route.ONE,
  Route.TWO,
  Route.THREE,
  Route.FOUR,
  Route.FIVE,
  Route.SIX,
  Route.SIXX,
  Route.SEVEN,
  Route.SEVENX,
  Route.A,
  Route.B,
  Route.C,
  Route.D,
  Route.E,
  Route.F,
  Route.FS,
  Route.G,
  Route.H,
  Route.J,
  Route.L,
  Route.M,
  Route.N,
  Route.Q,
  Route.R,
  Route.S,
  Route.SI,
  Route.W,
  Route.Z,
];

export const MOCK_ROUTE_LIST: RouteList = {
  data: MOCK_ROUTES,
  updated: new Date("2024-07-15T17:29:41-04:00")
}
