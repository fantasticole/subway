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
  NextStop,
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
  const [highlights, setHighlights] = useState < highlightMap > ({});
  const [selectedRoute, setSelectedRoute] = useState < RouteData > (RouteData.A);
  const [nextStops, setNextStops] = useState < NextStop[] > ([]);
  const [onlySelected, setOnlySelected] = useState < boolean > (true);
  const [socketInstance, setSocketInstance] = useState < Socket > ();
  const [isConnected, setIsConnected] = useState < boolean > (false);
  const [refreshInterval, setRefreshInterval] = useState < ReturnType < typeof setInterval > > ();

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
    });

    setSocketInstance(socket);
  }, []);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    if (socketInstance) {
      const onStreamLine = async (lines: Train[]) => {
        const stops = lines.map(({ next_stop, route, trip_id }: Train) => ({ ...next_stop, route, trip_id } as NextStop));
        setNextStops(stops);
      }

      socketInstance.on('connect', onConnect);
      socketInstance.on('disconnect', onDisconnect);
      socketInstance.on('streamline', onStreamLine);

      return () => {
        clearInterval(refreshInterval);
        socketInstance.off('connect', onConnect);
        socketInstance.off('disconnect', onDisconnect);
        socketInstance.off('streamline', onStreamLine);
      };
    }
  }, [socketInstance, refreshInterval]);

  const handleChangeRoute = (route: RouteData) => {
    setSelectedRoute(route);
    if (socketInstance) {
      socketInstance.emit('stopstreamline');
      socketInstance.emit('startstreamline', route);
      setRefreshInterval(setInterval(() => fetch('refresh'), 5000));
    }
  };

  function connect() {
    if (socketInstance) {
      socketInstance.connect();
      socketInstance.emit('startstreamline', selectedRoute);
      setRefreshInterval(setInterval(() => fetch('refresh'), 5000));
      setIsConnected(true);
    }
  }

  function disconnect() {
    if (socketInstance) {
      socketInstance.disconnect();
      clearInterval(refreshInterval);
      setIsConnected(false);
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
        </div>
        <h2>All routes</h2>
        <span data-testid="route-list">
          {routes?.map((route: RouteData, i: number) => (
            <Route route={route}
                   key={i}
                   onClick={() => handleChangeRoute(route)} />
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
