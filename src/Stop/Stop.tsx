import React from "react";

import { StationMeta } from "../utils/interfaces";

import Route from "../Route/Route";

import './Stop.css';

interface StopParams {
	stationMeta: StationMeta;
	height: number;
	width: number;
	highlightClass: string;
}

function Stop({
	stationMeta,
	height,
	width,
	highlightClass,
}: StopParams) {
	const { name, incoming, location } = stationMeta;

	const style = {
		bottom: location[0],
		left: location[1],
		height,
		width,
	};

	return (
		<div style = {style}
         title={name}
         data-testid="stop"
         className={'stop ' + highlightClass}>
      {incoming?.map(({route, trip_id}, i) => (
      	// include index in key because sometimes the same trip id comes through multiple times
        <Route route={route} key={trip_id + i} />
        ))}
     </div>
	);

}

export default Stop;
