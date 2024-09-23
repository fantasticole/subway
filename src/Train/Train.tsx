import React from "react";

import { Train as TrainData, Location } from "../utils/interfaces";

import Route from "../Route/Route";

import './Train.css';

interface TrainParams {
	train: TrainData;
	position: Location;
}

function Train({ train, position }: TrainParams) {
	const style = {
		bottom: position[0],
		left: position[1],
	};

	return (
		<span style={style} className="train" title={train.summary}>
			<Route route={train.route}
		         data-testid="Train" />
		</span>
	);
}

export default Train;
