import React from "react";
import { Location } from "../utils/interfaces";

import './Stop.css';

interface StopParams {
	location: Location;
	height: number;
	width: number;
	title: string;
	highlightClass: string;
}

function Stop({
	location,
	height,
	width,
	title,
	highlightClass,
}: StopParams) {
	const style = {
		bottom: location[0],
		left: location[1],
		height,
		width,
	};

	return (
		<div style = {style}
         title={title}
         data-testid="stop"
         className={'stop ' + highlightClass} />
	);

}

export default Stop;
