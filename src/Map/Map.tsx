import React from "react";

import allStations from "../utils/allStations.json";
import { calculateLatitude, calculateLongitude } from "../utils/stationData";
import { Location, StationMeta, Stops, Route } from "../utils/interfaces";

import './Map.css';

interface MapParams {
  // List of station IDs to highlight
  highlights: string[];
  selectedRoute: Route;
}

const DEFAULT_MAP_HEIGHT = 700;
const DEFAULT_MAP_WIDTH = 700;
const DEFAULT_STOP_HEIGHT = 5;
const DEFAULT_STOP_WIDTH = 5;

function Map({ highlights, selectedRoute }: MapParams) {
  const style = {
    height: DEFAULT_MAP_HEIGHT + DEFAULT_STOP_HEIGHT,
    width: DEFAULT_MAP_WIDTH + DEFAULT_STOP_WIDTH,
  };

  const stationList = Object.values(allStations);
  const stationPlots: StationMeta[] = stationList.map(station => {
    const [lat, lon] = station.location;
    const scaledLocation: Location = [
      calculateLatitude(DEFAULT_MAP_HEIGHT, lat), calculateLongitude(DEFAULT_MAP_WIDTH, lon),
    ];

    return {
      ...station,
      // TODO: TS compiler complains about this being StationMeta because it says stops is not comparable to Stops
      stops: station.stops as unknown as Stops,
      location: scaledLocation,
    };
  })

  function highlightStop(stationId: string): string {
    if (!highlights.includes(stationId)) {
      return '';
    }
    return `train${selectedRoute} highlighted`;
  }

  return (
    <div data-testid="map"
         className="map"
         style={style}>
      {stationPlots.map(({id, location, name}: StationMeta) => (
        <div key={id}
             style = {{
               bottom: location[0],
               left: location[1],
               height: DEFAULT_STOP_HEIGHT,
               width: DEFAULT_STOP_WIDTH,
             }}
             title={`${name}`}
             data-testid="stop"
             className={'stop ' + highlightStop(id)} />
        ))}
    </div>
  );
}

export default Map;
