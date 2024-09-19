import React, { useState, useEffect, useMemo } from "react";
import { io, Socket } from "socket.io-client";

import {
  Route as RouteData,
  Station as StationData,
  TrainMap,
  TrainMapStream,
} from "./utils/interfaces";

import Station from "./Station/Station";
import Route from "./Route/Route";
import Map from "./Map/Map";

import './App.css';
import './variables.css';

function App() {
  const [updated, setUpdated] = useState < string > ();
  const [routes, setRoutes] = useState < RouteData[] > ([]);
  const [stations, setStations] = useState < StationData[] > ([]);
  const [trains, setTrains] = useState < TrainMap > ({});
  const [selectedRoute, setSelectedRoute] = useState < RouteData > (RouteData.A);
  const [onlySelected, setOnlySelected] = useState < boolean > (true);
  const [socketInstance, setSocketInstance] = useState < Socket > ();
  const [isConnected, setIsConnected] = useState < boolean > (false);

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
      const onStreamLine = ({ trains, updated }: TrainMapStream) => {
        setTrains(trains);
        setRoutes(Object.keys(trains) as RouteData[]);
        setUpdated((updated).toString());
      }
      const onStations = (stations: StationData[]) => setStations(stations);

      socketInstance.on('connect', onConnect);
      socketInstance.on('disconnect', onDisconnect);
      socketInstance.on('streamline', onStreamLine);
      socketInstance.on('stations', onStations);

      return () => {
        socketInstance.off('connect', onConnect);
        socketInstance.off('disconnect', onDisconnect);
        socketInstance.off('streamline', onStreamLine);
        socketInstance.off('stations', onStations);
      };
    }
  }, [socketInstance, selectedRoute]);

  // Stream the selected route if we're connected to the socket
  // Only update if the route changes & the socket is connected
  useEffect(() => {
    if (socketInstance && isConnected) {
      socketInstance.emit('streamline');
    }
  }, [isConnected, socketInstance]);

  useEffect(() => {
    if (socketInstance && isConnected) {
      socketInstance.emit('route', selectedRoute);
    }
  }, [isConnected, socketInstance, selectedRoute]);

  const trainList: TrainMap = useMemo(
    () => (onlySelected ? {
      [selectedRoute]: (trains[selectedRoute] || [])
    } : trains),
    [onlySelected, selectedRoute, trains]
  );

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
        <h2>All Current Routes</h2>
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
        <Map stations={stations}
             selectedRoute={selectedRoute}
             trains={trainList}
             autoSize />
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
