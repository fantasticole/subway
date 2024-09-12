import React, { useMemo, useEffect, useState } from "react";

import allStations from "../utils/allStations.json";
import { calculateLatitude, calculateLongitude } from "../utils/stationData";
import { Location, StationMeta, Stops, Train, NextStop } from "../utils/interfaces";

import Stop from "../Stop/Stop";
import TrainComponent from "../Train/Train";

import './Map.css';

export interface highlightMap {
  [stationId: string]: string;
}

interface MapParams {
  // Station IDs to highlight with a specified className
  highlights: highlightMap;
  incoming: Train[];
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

function Map({ highlights, autoSize, incoming }: MapParams) {
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

  const stationPlots: StationMeta[] = useMemo(
    () => Object.values(allStations).map(station => {
      const [lat, lon] = station.location;
      const scaledLocation: Location = [
        calculateLatitude((height - stopHeight), lat), calculateLongitude((width - stopWidth), lon),
      ];

      const stationStops = Object.keys(station.stops);
      const stops = incoming.map(({ next_stop, route, trip_id }: Train) => ({ ...next_stop, route, trip_id } as NextStop));
      const incomingTrains = stops.filter(({ stop_id }) => (stop_id === station.id || stationStops.includes(stop_id)));

      return {
        ...station,
        location: scaledLocation,
        incoming: incomingTrains,
        // TODO: TS compiler complains about this being StationMeta because it says stops is not comparable to Stops
        stops: station.stops as unknown as Stops,
      };
    }),
    [height, width, stopHeight, stopWidth, incoming]
  );

  function getTrainPosition({ next_stop }: Train) {
    if (!next_stop) return;
    const { stop_id } = next_stop;
    const station = stationPlots.find(({ id }) => id === stop_id);
    if (!station) return;
    return station.location;
  }

  return (
    <div data-testid="map"
         className="map"
         style={style}>
      {stationPlots.map((stationMeta: StationMeta) => (
        <Stop key={stationMeta.id}
              stationMeta={stationMeta}
              height= {stopHeight}
              width= {stopWidth}
              data-testid="stop"
              highlightClass={highlights[stationMeta.id] || ''} />
        ))}
      {incoming.map((train, i) => (
        // include index in key because sometimes the same trip id comes through multiple times
        <TrainComponent key={train.trip_id + i}
                        train={train}
                        position={getTrainPosition(train)} />
        ))}
    </div>
  );
}

export default Map;
