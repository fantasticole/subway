import React, { useState, useEffect, useMemo } from "react";

import {
  fetchRoute,
} from "./utils/subway_apis";
import { Station as StationData, Route as RouteData } from "./utils/interfaces";

import Station from "./Station/Station";
import Route from "./Route/Route";
import Map, { highlightMap } from "./Map/Map";

import './App.css';
import './variables.css';

const ALL_ROUTES = Object.values(RouteData);

function App() {
  const [updated, setUpdated] = useState < string > ();
  const [stations, setStations] = useState < StationData[] > ();
  const [highlights, setHighlights] = useState < highlightMap > ({});
  const [selectedRoute, setSelectedRoute] = useState < RouteData > (RouteData.A);

  useEffect(() => {
    // fetch stations along selected route
    fetchRoute(selectedRoute).then(res => {
      if (res) {
        setStations(res.data);
        setUpdated((res.updated).toString());
        setHighlights(() => (res.data || []).reduce((map, { id }) => {
          map[id] = `train${selectedRoute} highlighted`;
          return map;
        }, {} as highlightMap), );
      }
    });

  }, [selectedRoute]);

  return (
    <div className="App">
        <h1>SUBWAY</h1>
        <h2>All routes</h2>
        <span data-testid="route-list">
          {ALL_ROUTES?.map((route: RouteData, i: number) => (
            <Route route={route}
                   key={i}
                   onClick={() => setSelectedRoute(route)} />
            ))}
        </span>
        <Map highlights={highlights} autoSize />
        <h2>Along the {selectedRoute}</h2>
        <p data-testid="updated">updated: {updated}</p>
        <span data-testid="station-list" className="stations">
          {stations?.map((station: StationData, i: number) => (
            <Station station={station} key={i} />
            ))}
        </span>
    </div>
  );
}

export default App;
