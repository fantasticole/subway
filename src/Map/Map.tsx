import React, { useMemo } from "react";

import allStations from "../utils/allStations.json";
import { calculateLatitude, calculateLongitude } from "../utils/stationData";
import { Location, StationMeta, Stops, Route } from "../utils/interfaces";

import Stop from "../Stop/Stop";

import './Map.css';

export interface highlightMap {
  [stationId: string]: string;
}

interface MapParams {
  // Station IDs to highlight with a specified className
  highlights: highlightMap;
}

const DEFAULT_MAP_HEIGHT = 700;
const DEFAULT_MAP_WIDTH = 700;
const DEFAULT_STOP_HEIGHT = 5;
const DEFAULT_STOP_WIDTH = 5;

function Map({ highlights }: MapParams) {
  let mapHeight = DEFAULT_MAP_HEIGHT;
  let mapWidth = DEFAULT_MAP_WIDTH;
  let stopHeight = DEFAULT_STOP_HEIGHT;
  let stopWidth = DEFAULT_STOP_WIDTH;

  const style = {
    height: mapHeight + stopHeight,
    width: mapWidth + stopWidth,
  };

  const stationPlots: StationMeta[] = useMemo(
    () => Object.values(allStations).map(station => {
      const [lat, lon] = station.location;
      const scaledLocation: Location = [
        calculateLatitude(mapHeight, lat), calculateLongitude(mapWidth, lon),
      ];

      return {
        ...station,
        location: scaledLocation,
        // TODO: TS compiler complains about this being StationMeta because it says stops is not comparable to Stops
        stops: station.stops as unknown as Stops,
      };
    }),
    [allStations, mapHeight, mapWidth]
  );

  return (
    <div data-testid="map"
         className="map"
         style={style}>
      {stationPlots.map(({id, location, name}: StationMeta) => (
        <Stop key={id}
             location={location}
             height= {stopHeight}
             width= {stopWidth}
             title={`${name}`}
             data-testid="stop"
             highlightClass={highlights[id]} />
        ))}
    </div>
  );
}

export default Map;
