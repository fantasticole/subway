import React, { useState, useEffect } from "react";

import {
  fetchRoute,
  fetchRoutes,
} from "./utils/subway_apis";
import { Station as StationData, Route as RouteData } from "./utils/interfaces";

import Station from "./Station/Station";
import Route from "./Route/Route";
import Map, { highlightMap } from "./Map/Map";

import './App.css';
import './variables.css';

function App() {
  const [getRoutes, setGetRoutes] = useState < boolean > (true);
  const [updated, setUpdated] = useState < string > ();
  const [stations, setStations] = useState < StationData[] > ();
  const [routes, setRoutes] = useState < RouteData[] > ();
  const [highlights, setHighlights] = useState < highlightMap > ({});
  const [selectedRoute, setSelectedRoute] = useState < RouteData > (RouteData.A);

  useEffect(() => {
    // if (getRoutes) {
    //   // fetch all routes
    //   fetchRoutes()
    //     .then(res => {
    //       if (res) {
    //         setRoutes(res.data);
    //         // If we have a response, we don't need to call this again
    //         setGetRoutes(false);
    //       }
    //     });
    // }

    fetch("/").then(resOne => {
      console.log({ resOne });
      console.log({ body: resOne.body });
      const reader = resOne.body ? resOne.body.getReader() : null;
      console.log({ reader });
      // return resOne.text();
      // return resOne.text();
      // }).then(text => {
      //   console.log({ text });
      //   return JSON.parse(text);
      // }).then(sthn => {
      // console.log({ sthn });
    })

    // fetch("/").then(resOne => {
    //   console.log({ resOne });
    //   return resOne.text();
    // }).then(res => {
    //   console.log({ res });
    // })

    fetch("/test").then(res => res.text()).then(text => {
      console.log({ text });
      //   return JSON.parse(text);
      // }).then(test => {
      //   console.log({ test });
    })

    // fetch("/test").then(res => res.text()).then(text => (JSON.parse(text))).then(test => {
    //   console.log({ test });
    // })

    fetch("/stations").then(res => res.text()).then(text => (JSON.parse(text))).then(stations => {
      console.log({ stations });
    })

    // // fetch stations along selected route
    // fetchRoute(selectedRoute).then(res => {
    //   if (res) {
    //     setStations(res.data);
    //     setUpdated(new Date(res.updated).toString());
    //     setHighlights(() => (res.data || []).reduce((map, { id }) => {
    //       map[id] = `train${selectedRoute} highlighted`;
    //       return map;
    //     }, {} as highlightMap), );
    //   }
    // });
  }, [selectedRoute, getRoutes]);


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
