import React from "react";

import { Station as StationData, Route as RouteData } from "../utils/interfaces";

import Route from "../Route/Route";

import './Station.css';

interface StationParams {
  station: StationData;
}

function Station({ station }: StationParams) {
  return (
    <div data-testid="station" className="station">
      <h3 data-testid="name" className="name">
        {station.name} ({station.id})
      </h3>
      <div data-testid="routes" className="routes">
        {station.routes?.map((route: RouteData, i: number) => (
          <Route route={route} key={i} />
          ))}
      </div>
      {/* Add northbound & southbound trains */}
    </div>
  );
}

export default Station;
