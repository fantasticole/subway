import React from "react";

import { Station as StationData } from "../utils/interfaces";

function Station({ stationData }: { stationData: StationData }) {
  return (
    <div data-testid="station">
      <p data-testid="name">name: {stationData.name} ({stationData.id})</p>
      <p data-testid="routes">routes: {JSON.stringify(stationData.routes)}</p>
      <p data-testid="location">location: {JSON.stringify(stationData.location)}</p>
      {/* Add northbound & southbound trains */}
    </div>
  );
}

export default Station;