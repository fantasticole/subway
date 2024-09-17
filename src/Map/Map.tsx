import React, { useMemo, useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

import { calculateLatitude, calculateLongitude } from "../utils/stationData";
import {
  AllStationsMap,
  Location,
  NextStop,
  Route,
  StationMeta,
  Train,
  TrainColorMap,
  TrainStop,
} from "../utils/interfaces";

import Stop from "../Stop/Stop";
import TrainComponent from "../Train/Train";

import './Map.css';

export interface highlightMap {
  [stationId: string]: string;
}

export interface Path {
  before ? : string | undefined;
  after ? : string | undefined;
}

export interface PathSet {
  [stopId: string]: Set < string > ;
}

/* ID & location of a stop */
type StopMeta = {
  id: string;
  location: Location;
}

interface MapParams {
  // Station IDs to highlight with a specified className
  highlights: highlightMap;
  selectedRoute: Route;
  autoSize ? : boolean;
}

const DEFAULT_MAP_HEIGHT = 700;
const DEFAULT_MAP_WIDTH = 700;
const DEFAULT_STOP_HEIGHT = 5;
const DEFAULT_STOP_WIDTH = 5;
const DEFAULT_BORDER_WIDTH = 10;

const getDimensions = (borderWidth: number = DEFAULT_BORDER_WIDTH) => ({
  width: window.innerWidth - (2 * borderWidth),
  height: window.innerHeight - (2 * borderWidth),
});

function getRouteLines(trains: Train[]) {
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

function Map({ highlights, autoSize, selectedRoute }: MapParams) {
  const [height, setHeight] = useState(autoSize ? getDimensions().height : DEFAULT_MAP_HEIGHT);
  const [width, setWidth] = useState(autoSize ? getDimensions().width : DEFAULT_MAP_WIDTH);
  const [socketInstance, setSocketInstance] = useState < Socket > ();
  const [isConnected, setIsConnected] = useState < boolean > (false);
  const [trains, setTrains] = useState < Train[] > ([]);
  const [trainLines, setTrainLines] = useState < PathSet > ({});

  useEffect(() => {
    const socket = io(`http://127.0.0.1:5000/${selectedRoute}`, {
      withCredentials: true,
      transports: ["websocket"],
    });

    setSocketInstance(socket);
  }, [selectedRoute]);

  // If there's a socket instance, set listeners & event handlers
  // Remvoe them when no longer mounted
  useEffect(() => {
    if (socketInstance) {
      const onConnect = () => setIsConnected(true);
      const onDisconnect = () => setIsConnected(false);
      const onStreamLine = (lines: Train[]) => {
        setTrains(lines);
        setTrainLines(getRouteLines(lines))
      }

      socketInstance.on('connect', onConnect);
      socketInstance.on('disconnect', onDisconnect);
      socketInstance.on('streamline', onStreamLine);

      return () => {
        socketInstance.off('connect', onConnect);
        socketInstance.off('disconnect', onDisconnect);
        socketInstance.off('streamline', onStreamLine);
      };
    }
  }, [socketInstance]);

  useEffect(() => {
    function handleResize() {
      const { height, width } = getDimensions();
      setHeight(height);
      setWidth(width);
    }

    if (autoSize) {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [autoSize]);

  const stopHeight = DEFAULT_STOP_HEIGHT;
  const stopWidth = DEFAULT_STOP_WIDTH;

  const style = {
    height,
    width,
    borderWidth: DEFAULT_BORDER_WIDTH,
  };

  const scaleLocation = useCallback(([lat, lon]: Location, offset = false): Location => ([
    calculateLatitude((offset ? height - stopHeight : height), lat),
    calculateLongitude((offset ? width - stopWidth : width), lon),
  ]), [height, stopHeight, width, stopWidth]);

  const generateMeta = useCallback((id: string): StopMeta | undefined => {
    let location = (AllStationsMap[id] || {}).location;
    if (!location) {
      const stationMeta = Object.values(AllStationsMap).find(({ stops }) => !!stops[id]);
      if (!stationMeta) return;
      location = stationMeta.stops[id];
    }
    const [lat, lon] = scaleLocation(location);
    return {
      id,
      location: [(height - lat), lon]
    };
  }, [height, scaleLocation]);

  const mapLines: Array < StopMeta[] > = useMemo(
    () => Object.entries(trainLines).map(([pivot, trainLineSet]) => {
      const stops = Array.from(trainLineSet.keys());

      const fromMeta = generateMeta(pivot);
      const toMetaList = stops.map(generateMeta).filter(meta => !!meta);

      if (!fromMeta || toMetaList.length === 0) return null;
      const lines = toMetaList.map(toMeta => ([fromMeta!, toMeta!] as StopMeta[]));

      return lines;
    }).flat().filter(line => line !== null),
    [trainLines, generateMeta]
  );

  const stationPlots: StationMeta[] = useMemo(
    () => Object.values(AllStationsMap).map(station => {
      const stationStops = Object.keys(station.stops);
      const stops = trains.map(({ next_stop, route, trip_id }: Train) => ({ ...next_stop, route, trip_id } as NextStop));
      const incomingTrains = stops.filter(({ stop_id }) => (stop_id === station.id || stationStops.includes(stop_id)));

      return {
        ...station,
        location: scaleLocation(station.location, true),
        incoming: incomingTrains,
      };
    }),
    [trains, scaleLocation]
  );

  const getTrainPosition = useCallback(({ next_stop }: Train): Location | undefined => {
    if (!next_stop) return;
    const { stop_id } = next_stop;
    const station = stationPlots.find(({ id }) => id === stop_id);
    if (!station) return;
    return station.location;
  }, [stationPlots])

  const trainList: Array < { train: Train;position: Location } > = useMemo(
    () => (trains
      // Filter if we don't have a position for this train
      // (Linter didn't like this coming after the map)
      .filter((train) => (!!getTrainPosition(train)))
      .map(train => ({ train, position: getTrainPosition(train) ! }))),
    [trains, getTrainPosition]
  );

  const stroke = TrainColorMap[selectedRoute];

  const svgStyle = {
    stroke,
    strokeWidth: DEFAULT_STOP_WIDTH,
  };

  return (
    <div data-testid="map"
         className="map"
         style={style}>
      <svg height={style.height} width={style.width}>
      {mapLines.map(([firstLoc, secondLoc]) => (
        <line key={firstLoc.id + secondLoc.id}
              className={firstLoc.id + secondLoc.id}
              y1={firstLoc.location[0]}
              x1={firstLoc.location[1]}
              y2={secondLoc.location[0]}
              x2={secondLoc.location[1]}
              style={svgStyle} />
        ))}
      </svg>
      {stationPlots.map((stationMeta: StationMeta) => (
        <Stop key={stationMeta.id}
              stationMeta={stationMeta}
              height= {stopHeight}
              width= {stopWidth}
              data-testid="stop"
              highlightClass={highlights[stationMeta.id] || ''} />
        ))}
      {trainList.map(({train, position}, i) => (
        // include index in key because sometimes the same trip id comes through multiple times
        <TrainComponent key={train.trip_id + i}
                        train={train}
                        position={position} />
        ))}
    </div>
  );
}

export default Map;
