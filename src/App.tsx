import React, { useState, useEffect, useMemo } from "react";

import {
  fetchRoute,
  fetchRoutes,
} from "./utils/subway_apis";
import { Station as StationData, Route as RouteData } from "./utils/interfaces";

import Station from "./Station/Station";
import Route from "./Route/Route";
import Map, { highlightMap }
from "./Map/Map";

import './App.css';

function App() {
  const [getRoutes, setGetRoutes] = useState < boolean > (true);
  const [updated, setUpdated] = useState < string > ();
  const [route, setRoute] = useState < StationData[] > ();
  const [routes, setRoutes] = useState < RouteData[] > ();
  const [selectedRoute, setSelectedRoute] = useState < RouteData > (RouteData.A);

  useEffect(() => {
    if (getRoutes) {
      // fetch all routes
      fetchRoutes()
        .then(res => {
          if (res) {
            setRoutes(res ? res.data : []);
            // If we have a response, we don't need to call this again
            setGetRoutes(false);
          }
        });
    }

    // fetch stations along selected route
    fetchRoute(selectedRoute).then(res => {
      if (res) {
        setRoute(res ? res.data : []);
        setUpdated(new Date(res.updated).toString());
      }
    });
  }, [selectedRoute, getRoutes]);

  const highlights: highlightMap = useMemo(
    () => (route || []).reduce((map, { id }) => {
      map[id] = `train${selectedRoute} highlighted`;
      return map;
    }, {} as highlightMap),
    [route]
  );

  return (
    <div className="App">
        <h1>SUBWAY</h1>
        <h2>All routes</h2>
        <span data-testid="route-list">
          {routes?.map((route: RouteData, i: number) => (
            <Route route={route}
                   key={i}
                   onClick={() => setSelectedRoute(route)} />
            ))}
        </span>
        <Map highlights={highlights} />
        <h2>Along the {selectedRoute}</h2>
        <p data-testid="updated">updated: {updated}</p>
        <span data-testid="station-list" className="stations">
          {route?.map((station: StationData, i: number) => (
            <Station station={station} key={i} />
            ))}
        </span>
    </div>
  );
}

export default App;
