import React from "react";

import {
  Route as RouteData,
  TrainColorMap,
  BlackFontRoutes
} from "../utils/interfaces";

import './Route.css';

interface RouteParams {
  route: RouteData
  onClick: (event: React.MouseEvent < HTMLButtonElement > ) => void
}

function Route({ route, onClick }: RouteParams) {
  const style = {
    backgroundColor: TrainColorMap[route],
    color: BlackFontRoutes.includes(route) ? "#000" : "#fff",
  };

  return (
    <button data-testid="route"
            className="route"
            type="button"
            onClick={onClick}
            style={style}>
      <span data-testid="route-name" >{route}</span>
    </button>
  );
}

export default Route;
