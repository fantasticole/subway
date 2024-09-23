import React, { useRef, useEffect, useMemo } from "react";

import { Train as TrainData, Location } from "../utils/interfaces";

import Route from "../Route/Route";

import './Train.css';

let bass = require('../audio/bass16b.wav');

interface TrainParams {
	train: TrainData;
	playAudio: boolean;
	position: Location;
}

function Train({ train, playAudio, position }: TrainParams) {
	const prevTrain = useRef < TrainData > ();

	const sameTrain: boolean = useMemo(
		() => (!!prevTrain.current && train.trip_id === prevTrain.current.trip_id),
		[train, prevTrain]
	);

	function playTransition() {
		new Audio(bass).play();
	}

	useEffect(() => {
		if (sameTrain && playAudio) {
			const prevStop = prevTrain.current!.location;
			const nextStop = train.location;
			if (nextStop !== prevStop) {
				playTransition();
			}
		}
		prevTrain.current = train;
	}, [train, sameTrain, playAudio]);

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
