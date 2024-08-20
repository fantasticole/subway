import React, { useState, useEffect } from "react";

import {
  fetchRoute,
  fetchRoutes,
} from "./utils/subway_apis";
import { Station as StationData, Route as RouteData } from "./utils/interfaces";

import Station from "./Station/Station";
import Route from "./Route/Route";

import './App.css';

function App() {
  const [getRoutes, setGetRoutes] = useState < boolean > (true);
  const [updated, setUpdated] = useState < string > ();
  const [route, setRoute] = useState < StationData[] > ();
  const [routes, setRoutes] = useState < RouteData[] > ();
  const [selectedRoute, setSelectedRoute] = useState < RouteData > (RouteData.SS);


  useEffect(() => {
    if (getRoutes) {
      // fetch all routes
      fetchRoutes()
        // .then(res => setRoutes(res ? res.data : []));
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

  return (
    <div className="App">
        <h1>SUBWAY</h1>
        <h2>All routes</h2>
        {routes?.map((route: RouteData, i: number) => (
          <Route route={route}
                 key={i}
                 onClick={() => setSelectedRoute(route)} />
          ))}
        <h2>Along the {selectedRoute}</h2>
        <p data-testid="updated">updated: {updated}</p>
        {route?.map((station: StationData, i: number) => (
          <Station stationData={station} key={i} />
          ))}
    </div>
  );
}

export default App;
