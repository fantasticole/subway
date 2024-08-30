import React from "react";

import { Stop, Station as StationData, Route as RouteData } from "../utils/interfaces";

import Route from "../Route/Route";

import './Station.css';

interface StationParams {
  station: StationData;
}

function Station({ station }: StationParams) {
  function getTime(time: Date) {
    const timeDate = new Date(time);
    return `${timeDate.getHours()}:${timeDate.getMinutes()}:${timeDate.getSeconds()}`;
  }

  return (
    <div data-testid="station" className="station">
      <h3 data-testid="name" className="name">
        {station.name} ({station.id})
      </h3>
      <div data-testid="routes" className="routes">
        {station.routes.map((route: RouteData, i: number) => (
          <Route route={route} key={i} />
          ))}
      </div>
      <div data-testid="north" className="north">
        <h4>NORTH</h4>
        <div className="list">
          {station.N.map((stop: Stop, i: number) => (
            <p key={i} className="incoming" data-testid="incoming">
              <Route route={stop.route} /> {getTime(stop.time)}
            </p>
            ))}
        </div>
      </div>
      <div data-testid="south" className="south">
        <h4>SOUTH</h4>
        <div className="list">
          {station.S.map((stop: Stop, i: number) => (
            <p key={i} className="incoming" data-testid="incoming">
              <Route route={stop.route} /> {getTime(stop.time)}
            </p>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Station;
