import React, { useState, useEffect } from "react";

import {
  fetchCurrentRoutes,
  fetchLine,
  fetchRoute,
} from "./utils/subway_apis";
import { Station as StationData, Route as RouteData, Train, NextStop } from "./utils/interfaces";

import Station from "./Station/Station";
import Route from "./Route/Route";
import Map, { highlightMap } from "./Map/Map";

import './App.css';
import './variables.css';

function App() {
  const [updated, setUpdated] = useState < string > ();
  const [routes, setRoutes] = useState < RouteData[] > ([]);
  const [stations, setStations] = useState < StationData[] > ();
  const [highlights, setHighlights] = useState < highlightMap > ({});
  const [selectedRoute, setSelectedRoute] = useState < RouteData > (RouteData.A);
  const [nextStops, setNextStops] = useState < NextStop[] > ([]);
  const [onlySelected, setOnlySelected] = useState < boolean > (true);

  useEffect(() => {
    fetchLine(onlySelected ? selectedRoute : undefined)
      .then(line => {
        if (line) {
          const { lines } = line;
          const stops = lines.map(({ next_stop, route, trip_id }: Train) => ({ ...next_stop, route, trip_id } as NextStop));
          setNextStops(stops);
        }
      });

    fetchCurrentRoutes()
      .then(currentRoutes => {
        if (currentRoutes) setRoutes(currentRoutes.data);
      });

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

    testStream();
  }, [selectedRoute, onlySelected]);

  const testStream = async () => {
    fetch('test')
      .then((response) => {
        const reader = response.body!.getReader();
        return new ReadableStream({
          start(controller) {
            return pump();

            function pump(): any {
              return reader.read().then(({ done, value }: any) => {
                // When no more data needs to be consumed, close the stream
                if (done) {
                  controller.close();
                  return;
                }
                const chunk = new TextDecoder().decode(value);
                // Enqueue the next data chunk into our target stream
                controller.enqueue(value);
                return pump();
              });
            }
          },
        });
      })
      .catch((err) => console.error(err));
  };

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
        <div>
          <label>
            <input
              type="checkbox"
              checked={onlySelected}
              onChange={() => setOnlySelected(!onlySelected)}
            />
            Only render selected route
          </label>
        </div>
        <Map highlights={highlights} incoming={nextStops} autoSize />
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
