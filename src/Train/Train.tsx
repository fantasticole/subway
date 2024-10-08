import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Train as TrainData, Location } from "../utils/interfaces";

import Route from "../Route/Route";

import { TrainAudioMap } from "./TrainAudio";
import './Train.css';

interface TrainParams {
	train: TrainData;
	playAudio: boolean;
	position: Location;
}

function Train({ train, playAudio, position }: TrainParams) {
	const arrivalTime = useRef < number > (-1);
	const playingAudio = useRef < boolean > (playAudio);
	const prevTrain = useRef < TrainData > ();
	const timeoutRef = useRef < ReturnType < typeof setTimeout > | null > (null);
	const [countdown, setCountdown] = useState < boolean > (false);
	const [coolingOff, setCoolingOff] = useState < boolean > (false);

	useEffect(() => {
		return () => {
			// On unmount, clear any leftover timeouts
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		}
	}, []);

	const sameTrain: boolean = useMemo(
		() => (!!prevTrain.current && train.trip_id === prevTrain.current.trip_id),
		[train, prevTrain]
	);

	const nextArrivalTime: number = useMemo(
		() => {
			const stop = train.stops.find(({ stop_id }) => stop_id === train.location);
			if (!stop || !stop.arrival) return -1;
			return new Date(stop.arrival).getTime();
		}, [train]);

	useEffect(() => {
		const now = new Date().getTime();
		const arrivalChanged = arrivalTime.current !== nextArrivalTime;
		// If the arrival time has changed and it's still in the future
		if (arrivalChanged && nextArrivalTime > now && !coolingOff) {
			// Update the arrival time
			arrivalTime.current = nextArrivalTime;
			setCountdown(true);
		}
	}, [train, nextArrivalTime, coolingOff]);

	// Prevent audio from playing twice if train arrival gets delayed a few seconds at the last moment
	const coolOff = (): void => {
		setCoolingOff(true);
		setTimeout(() => setCoolingOff(false), 10000);
	};

	const playTransition = useCallback((): void => {
		timeoutRef.current = null;
		coolOff();
		if (playAudio) {
			const audio = TrainAudioMap[train.route];
			audio.play();
		}
	}, [playAudio, train.route]);

	useEffect(() => {
		// If playAudio changes after setTimeout is set it won't
		// recognize the update, so we need to reset the countdown
		if (playAudio !== playingAudio.current) {
			playingAudio.current = playAudio;
			if (timeoutRef.current) {
				setCountdown(true);
			}
		}
	}, [playAudio]);

	const clearCountdown = useCallback((): void => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	}, []);

	const startCountdown = useCallback((): void => {
		// Check if there is an existing countdown and clear it if so
		clearCountdown();

		const timeToArrival = arrivalTime.current - new Date().getTime();
		// If the arrival is in the future
		if (timeToArrival > -1) {
			// Create a timeout
			timeoutRef.current = setTimeout(playTransition, timeToArrival);
		}
	}, [clearCountdown, playTransition]);

	useEffect(() => {
		if (countdown) {
			setCountdown(false);
			// If the arrivalTime changes, reset the countdown
			startCountdown();
		}
	}, [countdown, startCountdown]);

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
