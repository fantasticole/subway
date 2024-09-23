import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

import {
  Route as RouteData,
  StatenIslandRoutes,
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
  const [selectedRoutes, setSelectedRoutes] = useState < RouteData[] > ([RouteData.A]);
  const [onlySelected, setOnlySelected] = useState < boolean > (true);
  const [showStations, setShowStations] = useState < boolean > (true);
  const [includeStatenIsland, setIncludeStatenIsland] = useState < boolean > (true);
  const [socketInstance, setSocketInstance] = useState < Socket > ();
  const [isConnected, setIsConnected] = useState < boolean > (false);
  let headerRef = useRef < HTMLDivElement > (null);

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
      const onStream = ({ trains, updated, stations }: TrainMapStream) => {
        setTrains(trains);
        setRoutes(Object.keys(trains) as RouteData[]);
        const date = new Date(updated).toTimeString();
        const time = date.split(" ")[0];
        setUpdated(time);
        setStations(stations);
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
      socketInstance.emit('route', [RouteData.A]);
    }
  }, [isConnected, socketInstance]);

  const trainList: TrainMap = useMemo(
    () => (onlySelected ? selectedRoutes.reduce((map, route) => {
      if (includeStatenIsland || !StatenIslandRoutes.includes(route)) {
        map[route] = (trains[route] || []);
      }
      return map;
    }, {} as TrainMap) : trains),
    [onlySelected, selectedRoutes, trains, includeStatenIsland]
  );

  const filterRoutes =
    (routes: RouteData[]): RouteData[] => (includeStatenIsland ? routes : routes.filter(route => !StatenIslandRoutes.includes(route)));

  const setRouteSelection = useCallback(
    (route: RouteData) => {
      if (socketInstance && isConnected) {
        let updatedRoutes = [...selectedRoutes];
        if (selectedRoutes.includes(route)) {
          updatedRoutes.splice(updatedRoutes.indexOf(route), 1);
        } else {
          updatedRoutes = [...selectedRoutes, route];
        }
        setSelectedRoutes(updatedRoutes);
        socketInstance.emit('route', updatedRoutes);
      }
    }, [isConnected, socketInstance, selectedRoutes]);

  const fadeRoute = useCallback(
    (route: RouteData): boolean => (onlySelected && !selectedRoutes.includes(route)),
    [onlySelected, selectedRoutes]
  );

  const getHeaderHeight = useCallback(
    (): number => (headerRef.current ? headerRef.current.offsetHeight : 200),
    [headerRef]
  );

  const filteredStations = useMemo(
    (): StationData[] => (includeStatenIsland ? stations : stations.filter(({ routes }) => !routes.some(route => StatenIslandRoutes.includes(route)))),
    [stations, includeStatenIsland]
  );

  const stationStyle = {
    width: showStations ? 350 : 0,
    height: `calc(100vh - ${getHeaderHeight()}px)`,
  }

  return (
    <div className="App">
        <div className="header" ref={headerRef}>
          <h1>SUBWAY</h1>
          <h2>All Current Routes</h2>
          <div className="checkbox">
            <label>
              <input
                type="checkbox"
                checked={onlySelected}
                onChange={() => setOnlySelected(!onlySelected)}
              />
              Only render selected route(s)
            </label>
            <label>
              <input
                type="checkbox"
                checked={showStations}
                onChange={() => setShowStations(!showStations)}
              />
              Show stations
            </label>
            <label>
              <input
                type="checkbox"
                checked={includeStatenIsland}
                onChange={() => setIncludeStatenIsland(!includeStatenIsland)}
              />
              Include Staten Island
            </label>
          </div>
          <span data-testid="route-list" className="routeList">
            {filterRoutes(routes).map((route: RouteData, i: number) => (
              <Route route={route}
                     key={i}
                     faded={fadeRoute(route)}
                     onClick={() => setRouteSelection(route)} />
              ))}
          </span>
        </div>
        <div className="container">
          <Map stations={stations}
               hasSidebar={showStations}
               headerHeight={getHeaderHeight()}
               includeStatenIsland={includeStatenIsland}
               trains={trainList}
               autoSize />
          <div className="stationData" style={stationStyle}>
            <div className="stationDataHeader">
              <h3>Along the {filterRoutes(selectedRoutes).join(", ")}</h3>
              <span>{updated}</span>
            </div>
            <span data-testid="station-list" className="stations">
              {filteredStations.map((station: StationData, i: number) => (
                <Station station={station} key={i} />
                ))}
            </span>
          </div>
        </div>
    </div>
  );
}

export default App;
