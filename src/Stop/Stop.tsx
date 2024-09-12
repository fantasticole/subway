import React from "react";

import { StationMeta } from "../utils/interfaces";

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
	const { name, location } = stationMeta;

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
     </div>
	);

}

export default Stop;
