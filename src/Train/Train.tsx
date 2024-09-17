import React, { useState, useEffect, useCallback } from "react";
import { Socket } from "socket.io-client";

import { Train as TrainData, Location } from "../utils/interfaces";

import Route from "../Route/Route";

import './Train.css';

interface TrainParams {
	train: TrainData;
	position: Location;
	socket ? : Socket | undefined;
}

function Train({ train, position, socket }: TrainParams) {
	const [refreshInterval, setRefreshInterval] = useState < ReturnType < typeof setInterval > > ();
	const [trip, setTrip] = useState < string > (train.summary);

	const getTrip = useCallback((): void => {
		if (socket) {
			socket.emit('get trip', train.trip_id)
		}
	}, [socket, train.trip_id]);

	useEffect(() => {
		if (socket) {
			if (!refreshInterval) {
				setRefreshInterval(setInterval(() => getTrip(), 1000));
			}
			const onTrip = (trip: string) => setTrip(trip);

			socket.on('trip', onTrip);

			return () => {
				socket.off('trip', onTrip);
				clearInterval(refreshInterval);
			};
		}
	}, [socket, refreshInterval, getTrip]);

	const style = {
		bottom: position[0],
		left: position[1],
	};

	return (
		<span style={style} className="train" title={trip}>
			<Route route={train.route}
		         data-testid="Train" />
		</span>
	);

}

export default Train;
