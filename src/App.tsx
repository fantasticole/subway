import React, { useState, useEffect } from "react";

import { fetchNearestStations } from "./utils/subway_apis";
import { Station as StationData } from "./utils/interfaces";

import Station from "./Station/Station";

import './App.css';

const BEDFORD_L_LAT = 40.717304;
const BEDFORD_L_LON = -73.956872;

function App() {
  const [nearest, setNearest] = useState < StationData[] > ();
  const [updated, setUpdated] = useState < Date > ();

  useEffect(() => {
    fetchNearestStations(BEDFORD_L_LAT, BEDFORD_L_LON)
      .then(res => {
        if (res) {
          setNearest(res.data);
          setUpdated(res.updated);
        }
      });
  });

  return (
    <div className="App">
        <header className="App-header">
          <p data-testid="updated">updated: {JSON.stringify(updated)}</p>
          {nearest?.map((station: StationData, i: number) => (
            <Station stationData={station} key={i} />
            ))}
        </header>
      </div>
  );
}

export default App;