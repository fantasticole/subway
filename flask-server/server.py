from flask import Flask, render_template, request, jsonify
from flask_squeeze import Squeeze
from asgiref.wsgi import WsgiToAsgi
from flask_cors import CORS, cross_origin
from mtapi import Mtapi

import asyncio
import os
import json

from nyct_gtfs import NYCTFeed

from nyct_gtfs.gtfs_static_types import Stations

from datetime import datetime, date, time, timezone, tzinfo, timedelta
import arrow
from itertools import groupby, chain

from tzlocal import get_localzone

Feeds = ("1", "A", "F", "G", "J", "L", "N", "SI")
NYCTFeeds = [NYCTFeed(feed, fetch_immediately=True) for feed in Feeds]

# initialize flask app
squeeze = Squeeze()
app = Flask(__name__)
CORS(app, support_credentials=True)
squeeze.init_app(app)
asgi_app = WsgiToAsgi(app)

# globals
last_updated_time = datetime.now()
stations_json = json.load(open("../src/utils/allStations.json", encoding="utf-8"))
mta = Mtapi(NYCTFeeds)

def add_cors_header(resp):
    if True:
    # if app.config['DEBUG']:
        resp.headers['Access-Control-Allow-Origin'] = '*'
    elif 'CROSS_ORIGIN' in app.config:
        resp.headers['Access-Control-Allow-Origin'] = app.config['CROSS_ORIGIN']

    return resp

async def refresh():
    global last_updated_time
    if (datetime.now() - last_updated_time).seconds >= 14:
        last_updated_time = datetime.now()
        timer = datetime.now()
        print(arrow.get(timer), "refreshing")
        await asyncio.gather(*(feed.refresh_async() for feed in NYCTFeeds))
        print(str(arrow.utcnow()), "refresh finished in", str(datetime.now() - timer))


async def get_arrivals(stations):
    print(str(arrow.utcnow()), "getting arrivals")
    trains = []
    await refresh()

    directional_stations = [(f"{station}N", f"{station}S") for station in stations]
    stops = list(chain.from_iterable(directional_stations))

    for stop in stops:
        for feed in NYCTFeeds:
            trains += feed.filter_trips(headed_for_stop_id=stop, underway=True)

    arrivals = [
        (
            train.route_id,
            train.headsign_text if train.headsign_text else train.shape_id,
            [
                update.arrival
                for update in train.stop_time_updates
                if any([update.stop_id == stop for stop in stops])
            ][0],
            train.direction,
            train.trip_id,
        )
        for train in trains
    ]

    return arrivals


@app.route("/arrivals")
async def arrivals():
    stop_ids = tuple(request.args.get("stop_ids", "A41,R29").split(","))
    arrivals = await get_arrivals(stop_ids)
    station_name = "/".join(
        set([Stations().get_station_name(stop_id) for stop_id in stop_ids])
    )

    relative_arrivals = [
        {
            "route": route,
            "dest": dest,
            "arrival_time": arrow.get(arrival_time, get_localzone()).isoformat(),
            "relative": (arrival_time - datetime.now()).seconds // 60,
            "direction": direction,
            "trip_id": trip_id,
        }
        for (route, dest, arrival_time, direction, trip_id) in arrivals
    ]

    response = jsonify({
            'stop_ids': request.args.get("stop_ids", "A41,R29"),
            'station_name': station_name,
            'mode': request.args.get("mode", "detailed"),
            'last_updated': [
                            arrow.get(last_updated_time, get_localzone()).isoformat(),
                            arrow.get(last_updated_time, get_localzone()).humanize(arrow.utcnow()),
                        ],
            'arrivals': sorted(
                [arr for arr in relative_arrivals if arr["relative"] < 30],
                key=lambda arr: arr["arrival_time"],
            ),
            })
    return add_cors_header(response)

@app.route("/route/<route_id>")
async def route(route_id):
    data = mta.get_by_route(route_id)

    response = jsonify({
        'data': json.dumps(data, indent=4, sort_keys=True, default=str),
        'updated': last_updated_time
        })
    return add_cors_header(response)

@app.route("/stations")
def stations():
    response = jsonify({
        'stations_json':stations_json,
        'stations':list(stations_json.values()),
        'embed':request.args.get("embed"),
            })
    return add_cors_header(response)


@app.route("/train/<trip_id>")
async def train(trip_id):
    await refresh()
    for feed in NYCTFeeds:
        for trip in feed.trips:
            if trip_id == trip.trip_id:
                response = jsonify({
                        "trip_id": trip_id,
                        "route": trip.route_id,
                        "dest": trip.headsign_text
                        if trip.headsign_text
                        else trip.shape_id,
                        "summary": str(trip),
                        "nyct_train_id": trip.nyc_train_id,
                        "stops": [
                            {
                                "stop_id": update.stop_id,
                                "stop_name": update.stop_name,
                                "arrival": arrow.get(
                                    update.arrival, get_localzone()
                                ).isoformat(),
                                "relative": (update.arrival - datetime.now()).seconds
                                // 60
                                if update.arrival > datetime.now()
                                else -1,
                            }
                            for update in trip.stop_time_updates
                        ],
                    })
                return add_cors_header(response)
    return jsonify({"error": "uhh no train here"})


if __name__ == '__main__':
    app.run(use_reloader=True)
