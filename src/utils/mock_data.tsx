import {Station, StationList} from "./interfaces";

export const MOCK_STATION: Station = {
            N: [
                {
                    route: "L",
                    time: new Date("2024-08-15T17:30:23-04:00")
                },
                {
                    route: "L",
                    time: new Date("2024-08-15T17:33:33-04:00")
                },
                {
                    route: "L",
                    time: new Date("2024-08-15T17:39:12-04:00")
                },
                {
                    route: "L",
                    time: new Date("2024-08-15T17:41:18-04:00")
                },
            ],
            S: [
                {
                    route: "L",
                    time: new Date("2024-08-15T17:32:31-04:00")
                },
                {
                    route: "L",
                    time: new Date("2024-08-15T17:35:09-04:00")
                },
                {
                    route: "L",
                    time: new Date("2024-08-15T17:39:15-04:00")
                },
                {
                    route: "L",
                    time: new Date("2024-08-15T17:42:45-04:00")
                },
            ],
            routes: [
                "L"
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
