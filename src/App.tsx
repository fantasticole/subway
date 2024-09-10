import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

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
  const [socketInstance, setSocketInstance] = useState < Socket > ();
  const [isConnected, setIsConnected] = useState < boolean > (false);

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
  }, [selectedRoute, onlySelected]);

  // only run once to create socket
  useEffect(() => {
    const socket = io("http://127.0.0.1:5000/", {
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket"],
      // cors: {
      //   origin: "http://localhost:3000/",
      // },
    });

    setSocketInstance(socket);

    const onConnect = () => setIsConnected(true)

    const onDisconnect = () => setIsConnected(false)

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    // socket.on('data', (data: string) => {
    //   console.log({ data });
    // });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const handleSubmit = () => {
    if (socketInstance) {
      socketInstance.emit("data", 'test');
    }
  };

  function connect() {
    if (socketInstance) {
      socketInstance.connect();
    }
  }

  function disconnect() {
    if (socketInstance) {
      socketInstance.disconnect();
    }
  }

  return (
    <div className="App">
        <h1>SUBWAY</h1>
        <div>
          <>
            <p data-testid="isConnected">isConnected: {`${isConnected}`}</p>
            <button onClick={ connect }>Connect</button>
            <button onClick={ disconnect }>Disconnect</button>
          </>
          <button onClick={handleSubmit}>submit</button>
        </div>
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
