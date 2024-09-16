import React, { useMemo, useEffect, useState, useCallback } from "react";

import { calculateLatitude, calculateLongitude } from "../utils/stationData";
import {
  AllStationsMap,
  Location,
  NextStop,
  StationMeta,
  Train,
  TrainColorMap
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

export interface PathMap {
  [stopId: string]: Path;
}

/* ID & location of a stop */
type StopMeta = {
  id: string;
  location: Location;
}

interface MapParams {
  // Station IDs to highlight with a specified className
  highlights: highlightMap;
  incoming: Train[];
  autoSize ? : boolean;
  lines: PathMap;
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

function Map({ highlights, autoSize, incoming, lines }: MapParams) {
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

  const scaleLocation = useCallback(([lat, lon]: Location): Location => ([
    calculateLatitude((height - stopHeight), lat),
    calculateLongitude((width - stopWidth), lon),
  ]), [height, stopHeight, width, stopWidth]);

  const generateMeta = useCallback((id: string): StopMeta | undefined => {
    const stationMeta = AllStationsMap[id];
    if (!stationMeta) return;
    const loc = scaleLocation(stationMeta.location);
    return {
      id,
      location: [(height - loc[0]), loc[1]]
    };
  }, [height, scaleLocation]);

  const mapLines: Array < StopMeta[] > = useMemo(
    () => Object.values(lines).map(stopPosition => {
      if (!stopPosition.before || !stopPosition.after) return null;

      const beforeMeta = generateMeta(stopPosition.before);
      const afterMeta = generateMeta(stopPosition.after);

      return (!beforeMeta || !afterMeta) ? null : [beforeMeta, afterMeta];
    }).filter(line => line !== null),
    [lines, generateMeta]
  );

  const stationPlots: StationMeta[] = useMemo(
    () => Object.values(AllStationsMap).map(station => {
      const stationStops = Object.keys(station.stops);
      const stops = incoming.map(({ next_stop, route, trip_id }: Train) => ({ ...next_stop, route, trip_id } as NextStop));
      const incomingTrains = stops.filter(({ stop_id }) => (stop_id === station.id || stationStops.includes(stop_id)));

      return {
        ...station,
        location: scaleLocation(station.location),
        incoming: incomingTrains,
      };
    }),
    [incoming, scaleLocation]
  );

  const getTrainPosition = useCallback(({ next_stop }: Train): Location | undefined => {
    if (!next_stop) return;
    const { stop_id } = next_stop;
    const station = stationPlots.find(({ id }) => id === stop_id);
    if (!station) return;
    return station.location;
  }, [stationPlots])

  const trains: Array < { train: Train;position: Location } > = useMemo(
    () => (incoming
      // Filter if we don't have a position for this train
      // (Linter didn't like this coming after the map)
      .filter((train) => (!!getTrainPosition(train)))
      .map(train => ({ train, position: getTrainPosition(train) ! }))),
    [incoming, getTrainPosition]
  );

  const stroke = incoming[0] ? TrainColorMap[incoming[0].route] : 'black';

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
      {trains.map(({train, position}, i) => (
        // include index in key because sometimes the same trip id comes through multiple times
        <TrainComponent key={train.trip_id + i}
                        train={train}
                        position={position} />
        ))}
    </div>
  );
}

export default Map;
