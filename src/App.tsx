import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

import {
  fetchCurrentRoutes,
  fetchLine,
  fetchRoute,
} from "./utils/subway_apis";
import {
  Station as StationData,
  Route as RouteData,
  Train,
} from "./utils/interfaces";

import Station from "./Station/Station";
import Route from "./Route/Route";
import Map, { highlightMap } from "./Map/Map";

import './App.css';
import './variables.css';

function App() {
  const [updated, setUpdated] = useState < string > ();
  const [routes, setRoutes] = useState < RouteData[] > ([]);
  const [stations, setStations] = useState < StationData[] > ();
  const [trains, setTrains] = useState < Train[] > ([]);
  const [highlights, setHighlights] = useState < highlightMap > ({});
  const [selectedRoute, setSelectedRoute] = useState < RouteData > (RouteData.A);
  const [onlySelected, setOnlySelected] = useState < boolean > (true);
  const [socketInstance, setSocketInstance] = useState < Socket > ();
  const [isConnected, setIsConnected] = useState < boolean > (false);

  useEffect(() => {
    fetchLine(onlySelected ? selectedRoute : undefined)
      .then(line => {
        if (line) setTrains(line.lines);
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
  }, [selectedRoute, onlySelected, isConnected]);

  // Only run once to create socket
  useEffect(() => {
    const socket = io("http://127.0.0.1:5000/", {
      // autoConnect: false,
      withCredentials: true,
      transports: ["websocket"],
    });

    setSocketInstance(socket);
  }, []);

  // If there's a socket instance, set listeners & event handlers
  // Remvoe them when no longer mounted
  useEffect(() => {
    if (socketInstance) {
      const onConnect = () => setIsConnected(true);
      const onDisconnect = () => setIsConnected(false);
      const onStreamLine = (lines: Train[]) => setTrains(lines);

      socketInstance.on('connect', onConnect);
      socketInstance.on('disconnect', onDisconnect);
      socketInstance.on('streamline', onStreamLine);

      return () => {
        socketInstance.off('connect', onConnect);
        socketInstance.off('disconnect', onDisconnect);
        socketInstance.off('streamline', onStreamLine);
      };
    }
  }, [socketInstance]);

  // Stream the selected route if we're connected to the socker
  // Only update if the route changes & the socket is connected
  useEffect(() => {
    if (socketInstance && isConnected) {
      socketInstance.emit('streamline', selectedRoute);
    }
  }, [isConnected, selectedRoute, socketInstance]);

  return (
    <div className="App">
        <h1>SUBWAY</h1>
        <div>
          {socketInstance &&
            <>
              <p data-testid="isConnected">isConnected: {`${isConnected}`}</p>
              {
                isConnected ?
                <button onClick={ () => socketInstance.disconnect() }>Disconnect</button> :
                <button onClick={ () => socketInstance.connect() }>Connect</button>
              }
            </>}
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
        <Map highlights={highlights} incoming={trains} autoSize />
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
