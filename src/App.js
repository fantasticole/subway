import React, { useState, useEffect } from "react";
import {fetchSubwayApi} from "./utils/subway_apis";

import './App.css';

function App() {
  const [res, setRes] = useState("");

  useEffect(() => {
    fetchSubwayApi()
      .then(res => setRes(res));
  });

    return (
      <div className="App">
        <header className="App-header">
          <p>res: {this.state.apiResponse}</p>
        </header>
      </div>
    );
}

export default App;
