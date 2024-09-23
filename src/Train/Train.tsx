import React, { useRef, useMemo } from "react";

import { Train as TrainData, Location } from "../utils/interfaces";

import Route from "../Route/Route";

import './Train.css';

interface TrainParams {
	train: TrainData;
	position: Location;
}

function Train({ train, position }: TrainParams) {
	const prevTrain = useRef < TrainData > ();

	const sameTrain: boolean = useMemo(
		() => (!!prevTrain.current && train.trip_id === prevTrain.current.trip_id),
		[train, prevTrain]
	);

	const trainTransition = sameTrain ? 'bottom 1s ease-in-out, left 1s ease-in-out' : '';

	const style = {
		bottom: position[0],
		left: position[1],
		transition: trainTransition,
	};

	return (
		<span style={style} className="train" title={train.summary}>
			<Route route={train.route}
		         data-testid="Train" />
		</span>
	);
}

export default Train;
