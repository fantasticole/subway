import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  const [showStations, setShowStations] = useState < boolean > (true);
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
      const onStream = ({ trains, updated, route, stations }: TrainMapStream) => {
        setTrains(trains);
        setRoutes(Object.keys(trains) as RouteData[]);
        const date = new Date(updated).toTimeString();
        const time = date.split(" ")[0];
        setUpdated(time);
        setStations(stations);
        setSelectedRoute(route);
      }

      socketInstance.on('connect', onConnect);
      socketInstance.on('disconnect', onDisconnect);
      socketInstance.on('stream', onStream);

      return () => {
        socketInstance.off('connect', onConnect);
        socketInstance.off('disconnect', onDisconnect);
        socketInstance.off('stream', onStream);
      };
    }
  }, [socketInstance]);

  // Stream the selected route if we're connected to the socket
  // Only update if the route changes & the socket is connected
  useEffect(() => {
    if (socketInstance && isConnected) {
      socketInstance.emit('stream');
      socketInstance.emit('route', RouteData.A);
    }
  }, [isConnected, socketInstance]);

  const trainList: TrainMap = useMemo(
    () => (onlySelected ? {
      [selectedRoute]: (trains[selectedRoute] || [])
    } : trains),
    [onlySelected, selectedRoute, trains]
  );

  const selectRoute = useCallback(
    (route: RouteData) => {
      if (socketInstance && isConnected) {
        socketInstance.emit('route', route);
      }
    }, [isConnected, socketInstance]);

  const stationStyle = {
    width: showStations ? 350 : 0,
  }

  return (
    <div className="App">
        <h1>SUBWAY</h1>
        <h2>All Current Routes</h2>
        <div className="checkbox">
          <label>
            <input
              type="checkbox"
              checked={onlySelected}
              onChange={() => setOnlySelected(!onlySelected)}
            />
            Only render selected route
          </label>
          <label>
            <input
              type="checkbox"
              checked={showStations}
              onChange={() => setShowStations(!showStations)}
            />
            Show stations
          </label>
        </div>
        <span data-testid="route-list" className="routeList">
          {routes?.map((route: RouteData, i: number) => (
            <Route route={route}
                   key={i}
                   onClick={() => selectRoute(route)} />
            ))}
        </span>
        <div className="container">
          <Map stations={stations}
               selectedRoute={selectedRoute}
               hasSidebar={showStations}
               trains={trainList}
               autoSize />
          <div className="stationData" style={stationStyle}>
            <div className="heading">
              <h3>Along the {selectedRoute}</h3>
              <span>{updated}</span>
            </div>
            <span data-testid="station-list" className="stations">
              {stations?.map((station: StationData, i: number) => (
                <Station station={station} key={i} />
                ))}
            </span>
          </div>
        </div>
    </div>
  );
}

export default App;
