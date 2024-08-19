import React from "react";

import {
  Route as RouteData,
  TrainColorMap,
  BlackFontRoutes
} from "../utils/interfaces";

import './Route.css';

function Route({ route }: { route: RouteData }) {
  const style = {
    backgroundColor: TrainColorMap[route],
    color: BlackFontRoutes.includes(route) ? "#000" : "#fff",
  };

  return (
    <div data-testid="route" className="route" style={style}>
      <span data-testid="name" >{route}</span>
    </div>
  );
}

export default Route;
