import React from "react";
import { useState, useEffect } from "react";
import {fetchSubwayApi, fetchNearestStations} from "./utils/subway_apis";

import './App.css';

const SAMPLE_LAT = 40.849505;
const SAMPLE_LON = -73.933596;

function App() {
  const [res, setRes] = useState<string>("");
  const [nearest, setNearest] = useState<string>("");

  useEffect(() => {
    fetchSubwayApi()
      .then(res => setRes(res || ""));
    fetchNearestStations(SAMPLE_LAT, SAMPLE_LON)
      .then(res => setNearest(res || ""));
  });

    return (
      <div className="App">
        <header className="App-header">
          <p>res: {res}</p>
          <p>res: {nearest}</p>
        </header>
      </div>
    );
}

export default App;
