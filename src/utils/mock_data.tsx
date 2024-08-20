import { Station, StationList, Route, RouteList } from "./interfaces";

export const MOCK_L_STATION: Station = {
  N: [{
      route: Route.L,
      time: new Date("2024-08-15T17:30:23-04:00")
    },
    {
      route: Route.L,
      time: new Date("2024-08-15T17:33:33-04:00")
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
};

export const MOCK_G_STATION: Station = {
  N: [{
      route: Route.SEVENX,
      time: new Date("2024-08-20T18:01:18-04:00")
    },
    {
      route: Route.G,
      time: new Date("2024-08-20T18:01:18-04:00")
    },
    {
      route: Route.SEVEN,
      time: new Date("2024-08-20T18:03:10-04:00")
    },
    {
      route: Route.E,
      time: new Date("2024-08-20T18:07:31-04:00")
    },
  ],
  S: [{
      route: Route.M,
      time: new Date("2024-08-20T18:02:02-04:00")
    },
    {
      route: Route.SEVEN,
      time: new Date("2024-08-20T18:03:10-04:00")
    },
    {
      route: Route.E,
      time: new Date("2024-08-20T18:05:18-04:00")
    },
    {
      route: Route.SEVEN,
      time: new Date("2024-08-20T18:07:02-04:00")
    },
  ],
  routes: [
    Route.SEVENX,
    Route.G,
    Route.SEVEN,
    Route.E,
    Route.M,
  ],
  last_update: new Date("2024-08-20T18:00:20-04:00"),
  id: "719",
  location: [
    40.747141,
    -73.94503199999998
  ],
  name: "Court Sq-23 St",
  stops: {
    719: [
      40.747023,
      -73.945264
    ],
    F09: [
      40.747846,
      -73.946
    ],
    G22: [
      40.746554,
      -73.943832
    ]
  }
};

export const MOCK_STATION_LIST: StationList = {
  data: [MOCK_L_STATION, MOCK_G_STATION],
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
