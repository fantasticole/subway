import {
  AllStationsResponse,
  Arrival,
  ArrivalList,
  LineList,
  Route,
  RouteList,
  Station,
  StationList,
  StationMap,
  StationMeta,
  Train,
  TrainStop,
} from "./interfaces";

export const MOCK_STATION_META: StationMeta = {
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

export const MOCK_L_STATION: Station = {
  ...MOCK_STATION_META,
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

export const MOCK_STATION_MAP: StationMap = {
  "L08": MOCK_STATION_META,
};

export const MOCK_STATIONS_RESPONSE: AllStationsResponse = {
  stations_json: MOCK_STATION_MAP,
  station_list: [MOCK_STATION_META],
  updated: new Date("2024-06-15T17:29:41-04:00"),
}

export const MOCK_ARRIVAL: Arrival = {
  arrival_time: "2024-08-31T11:31:25-04:00",
  dest: "Far Rockaway-Mott Av",
  direction: "S",
  relative: 0,
  route: Route.A,
  trip_id: "063950_A..S57X001",
}

export const MOCK_ARRIVAL_LIST: ArrivalList = {
  arrivals: [MOCK_ARRIVAL],
  mode: "detailed",
  station_name: "Jay St-MetroTech",
  stop_ids: ['A41', 'R29'],
  updated_readable: "just now",
  updated: new Date("2024-05-15T17:29:41-04:00")
}

export const MOCK_TRAIN_STOP: TrainStop = {
  arrival: "2024-08-31T12:16:45-04:00",
  relative: -1,
  stop_id: "H08S",
  stop_name: "Beach 44 St",
}

export const MOCK_TRAIN: Train = {
  dest: "Far Rockaway-Mott Av",
  direction: "S",
  location: "A09",
  last_position_update: "2024-09-04T11:51:09-04:00",
  nyct_train_id: "1A 1039+ 207/FAR",
  route: Route.A,
  next_stop: MOCK_TRAIN_STOP,
  stops: [MOCK_TRAIN_STOP],
  summary: "Southbound A to Far Rockaway-Mott Av, departed origin 10:39:30, Currently STOPPED_AT Beach 44 St, last update at 11:51:09",
  trip_id: "063950_A..S57X001",
}

export const MOCK_LINE_LIST: LineList = {
  lines: {
    [Route.A]: [MOCK_TRAIN]
  },
  updated: new Date("2024-05-15T17:29:41-04:00")
}
