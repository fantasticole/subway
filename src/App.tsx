import React, { useState, useEffect } from "react";
import {fetchSubwayApi, fetchNearestStations} from "./utils/subway_apis";

import './App.css';

// const SAMPLE_LAT = 40.849505;
// const SAMPLE_LON = -73.933596;
const BEDFORD_L_LAT = 40.717304;
const BEDFORD_L_LON = -73.956872;

function App() {
  const [res, setRes] = useState<string>("");
  const [nearest, setNearest] = useState<string>("");

  useEffect(() => {
    fetchSubwayApi()
      .then(res => setRes(res || ""));
    fetchNearestStations(BEDFORD_L_LAT, BEDFORD_L_LON)
    // fetchNearestStations(SAMPLE_LAT, SAMPLE_LON)
      .then(res => setNearest(res || ""));
  });

    return (
      <div className="App">
        <header className="App-header">
          <p className="basic">res: {res}</p>
          <p className="stations">nearby: {nearest}</p>
        </header>
      </div>
    );
}

export default App;
