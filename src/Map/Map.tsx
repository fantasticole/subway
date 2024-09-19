import React, { useMemo, useEffect, useState, useCallback } from "react";

import { calculateLatitude, calculateLongitude, getRouteLines } from "../utils/stationData";
import {
  AllStationsMap,
  Location,
  PathSet,
  Route,
  Station,
  StationMeta,
  Train,
  TrainColorMap,
  TrainMap,
} from "../utils/interfaces";

import Stop from "../Stop/Stop";
import TrainComponent from "../Train/Train";

import './Map.css';

/* ID & location of a stop */
type StopMeta = {
  id: string;
  location: Location;
}

interface MapParams {
  stations: Station[];
  trains: TrainMap;
  selectedRoute: Route;
  autoSize ? : boolean;
}

interface MapLinesByRoute {
  [route: string]: Array < StopMeta[] > ;
}

const DEFAULT_MAP_HEIGHT = 700;
const DEFAULT_MAP_WIDTH = 700;
const DEFAULT_STOP_HEIGHT = 5;
const DEFAULT_STOP_WIDTH = 5;
const DEFAULT_BORDER_WIDTH = 10;

const getDimensions = (borderWidth: number = DEFAULT_BORDER_WIDTH) => ({
  width: window.innerWidth - (2 * borderWidth) - 350,
  height: window.innerHeight - (2 * borderWidth) - 200,
});

function Map({ autoSize, selectedRoute, stations, trains }: MapParams) {
  const [height, setHeight] = useState(autoSize ? getDimensions().height : DEFAULT_MAP_HEIGHT);
  const [width, setWidth] = useState(autoSize ? getDimensions().width : DEFAULT_MAP_WIDTH);

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
    if (location[0] === 0 && location[1] === 0) return;
    const [lat, lon] = scaleLocation(location);
    return {
      id,
      location: [(height - lat), lon]
    };
  }, [height, scaleLocation]);

  const getMapLines = useCallback(
    (pathSet: PathSet): Array < StopMeta[] > => Object.entries(pathSet).map(([pivot, trainLineSet]) => {
      const stops: string[] = Array.from(trainLineSet.keys());

      const fromMeta = generateMeta(pivot);
      const toMetaList = stops.map(generateMeta).filter(meta => !!meta);

      if (!fromMeta || toMetaList.length === 0) return null;
      const lines = toMetaList.map(toMeta => ([fromMeta!, toMeta!] as StopMeta[]));

      return lines;
    }).flat().filter(line => line !== null),
    [generateMeta]
  );

  /* Map of SVG line coordinate for each route in the trainLinesMap */
  const mapLines: MapLinesByRoute = useMemo(
    () => Object.entries(trains).reduce((map, [route, trainList]) => {
      // Get the set of stop IDs and the stops they connect to in the list of trains
      const pathSet = getRouteLines(trainList);
      // Turn that set of paths into coordinates to use for SVG lines
      map[route] = getMapLines(pathSet);
      return map;
    }, {} as MapLinesByRoute),
    [trains, getMapLines]
  );

  const stationPlots: StationMeta[] = useMemo(
    () => Object.values(AllStationsMap).map(station => {
      if (station.location[0] === 0 && station.location[1] === 0) {
        return station;
      }
      return {
        ...station,
        location: scaleLocation(station.location, true),
      };
    }),
    [scaleLocation]
  );

  const getTrainPosition = useCallback(({ next_stop }: Train): Location | undefined => {
    if (!next_stop) return;
    const { stop_id } = next_stop;
    const station = stationPlots.find(({ id }) => id === stop_id);
    if (!station) return;
    return station.location;
  }, [stationPlots])

  const getClassName = useCallback((stationId: string): string => {
    const station = stations.find(({ id }) => id === stationId);
    return station ? `train${selectedRoute} highlighted` : '';
  }, [stations, selectedRoute])

  const trainList: Array < { train: Train;position: Location } > = useMemo(
    () => (Object.values(trains).flat()
      // Filter if we don't have a position for this train
      // (Linter didn't like this coming after the map)
      .filter((train) => (!!getTrainPosition(train)))
      .map(train => ({ train, position: getTrainPosition(train) ! }))),
    [trains, getTrainPosition]
  );

  return (
    <div data-testid="map"
         className="map"
         style={style}>
      <svg height={style.height} width={style.width}>
        {Object.entries(mapLines).map(([route, routeMapLines]) => (
          routeMapLines.map(([firstLoc, secondLoc]) => (
            <line key={firstLoc.id + secondLoc.id}
                  className={firstLoc.id + secondLoc.id}
                  y1={firstLoc.location[0]}
                  x1={firstLoc.location[1]}
                  y2={secondLoc.location[0]}
                  x2={secondLoc.location[1]}
                  style={{
                    stroke: TrainColorMap[route as Route],
                    strokeWidth: DEFAULT_STOP_WIDTH,
                  }} />
            ))
        ))}
      </svg>
      {stationPlots.map((stationMeta: StationMeta) => (
        <Stop key={stationMeta.id}
              stationMeta={stationMeta}
              height= {stopHeight}
              width= {stopWidth}
              data-testid="stop"
              highlightClass={getClassName(stationMeta.id)} />
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
