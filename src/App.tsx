import React, { useState, useEffect } from "react";

import {fetchNearestStations} from "./utils/subway_apis";
import {Station} from "./utils/interfaces";

import './App.css';

const BEDFORD_L_LAT = 40.717304;
const BEDFORD_L_LON = -73.956872;

function App() {
  const [nearest, setNearest] = useState<Station[]>();
  const [updated, setUpdated] = useState<Date>();

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
          <p className="updated">updated: {JSON.stringify(updated)}</p>
          {nearest?.map((station, i) => (
            <div className="station" id="i">
              <p className="name">name: {station.name} ({station.id})</p>
              <p className="routes">routes: {JSON.stringify(station.routes)}</p>
              <p className="location">location: {JSON.stringify(station.location)}</p>
              {/* Add northbound & southbound trains */}
            </div>
            ))}
        </header>
      </div>
    );
}

export default App;
