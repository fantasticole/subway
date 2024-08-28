from flask import Flask, render_template, request, jsonify
# Minifies, protects, compresses & caches
# https://pypi.org/project/flask-squeeze/
from flask_squeeze import Squeeze
# wrap a WSGI application so it appears as a valid ASGI application.
# https://pypi.org/project/asgiref/
from asgiref.wsgi import WsgiToAsgi

# provides infrastructure for writing single-threaded concurrent code
import asyncio
# import os
import json

from nyct_gtfs import NYCTFeed

from nyct_gtfs.gtfs_static_types import Stations

from datetime import datetime, date, time, timezone, tzinfo, timedelta
# ensible and human-friendly approach to creating, manipulating, formatting and converting dates, times and timestamps
# https://pypi.org/project/arrow/
import arrow
# https://docs.python.org/3/library/itertools.html
from itertools import groupby, chain

# local timezone information
# https://pypi.org/project/tzlocal/
from tzlocal import get_localzone

# ApiKey = os.environ["API_KEY"]

Feeds = ("1", "2")
SomeFeeds = ("1", "A", "F", "G", "J", "L", "N", "SI")
AllFeeds = ('1', '2', '3', '4', '5', '6', '7', 'S', 'GS', 'A', 'C', 'E', 'H', 'FS', 'SF', 'SR', 'B', 'D', 'F', 'M', 'G', 'J', 'Z', 'N', 'Q', 'R', 'W', 'L', 'SI', 'SS', 'SIR')
NYCTFeeds = [NYCTFeed(feed, fetch_immediately=True) for feed in Feeds]
SomeNYCTFeeds = [NYCTFeed(feed, fetch_immediately=True) for feed in SomeFeeds]
AllNYCTFeeds = [NYCTFeed(feed, fetch_immediately=True) for feed in AllFeeds]
# NYCTFeeds = [NYCTFeed(feed, api_key=ApiKey, fetch_immediately=True) for feed in Feeds]

# initialize flask app
squeeze = Squeeze()
app = Flask(__name__)
squeeze.init_app(app)
# The WSGI application will be run in a synchronous threadpool, and the wrapped ASGI application will be one that accepts http class messages.
asgi_app = WsgiToAsgi(app)

# globals
last_updated_time = datetime.now()


async def refresh():
    global last_updated_time
    if (datetime.now() - last_updated_time).seconds >= 14:
        last_updated_time = datetime.now()
        timer = datetime.now()
        print(arrow.get(timer), "refreshing")
        # provides infrastructure for writing single-threaded concurrent code
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


@app.route("/")
async def arrivals():
    print("hiiiii")
    stop_ids = tuple(request.args.get("stop_ids", "A41,R29").split(","))
    print("get_arrivals")
    print(stop_ids)
    print(NYCTFeeds)
    # arrivals = await get_arrivals(stop_ids)
    # station_name = "/".join(
    #     set([Stations().get_station_name(stop_id) for stop_id in stop_ids])
    # )

    # relative_arrivals = [
    #     {
    #         "route": route,
    #         "dest": dest,
    #         "arrival_time": arrow.get(arrival_time, get_localzone()).isoformat(),
    #         "relative": (arrival_time - datetime.now()).seconds // 60,
    #         "direction": direction,
    #         "trip_id": trip_id,
    #     }
    #     for (route, dest, arrival_time, direction, trip_id) in arrivals
    # ]
    # print(relative_arrivals)

    # stop_ids = request.args.get("stop_ids", "A41,R29")
    # station_name = station_name
    # mode = request.args.get("mode", "detailed")
    # last_updated = (
    #     arrow.get(last_updated_time, get_localzone()),
    #     arrow.get(last_updated_time, get_localzone()).humanize(arrow.utcnow()),
    # )
    # arrivals = sorted(
    #     [arr for arr in relative_arrivals if arr["relative"] < 30],
    #     key=lambda arr: arr["arrival_time"],
    # )

    return json.dumps({
        "stop_ids": stop_ids,
        # "station_name": station_name,
        # "mode": mode,
        # "last_updated": last_updated,
        # "arrivals": arrivals,
        })

    #     return render_template(
    #     "arrivals.html",
    #     stop_ids=request.args.get("stop_ids", "A41,R29"),
    #     station_name=station_name,
    #     mode=request.args.get("mode", "detailed"),
    #     last_updated=(
    #         arrow.get(last_updated_time, get_localzone()),
    #         arrow.get(last_updated_time, get_localzone()).humanize(arrow.utcnow()),
    #     ),
    #     arrivals=sorted(
    #         [arr for arr in relative_arrivals if arr["relative"] < 30],
    #         key=lambda arr: arr["arrival_time"],
    #     ),
    # )

# import json
def pj(res):
    print(json.dumps(res, indent=4))

@app.route("/test")
def test():
    tripList = []
    print("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH")
    print(AllNYCTFeeds[0].trips[0])
    trains = [
        str(feed.trips[0])
        for feed in AllNYCTFeeds
    ]
    trips = [
        len(feed.trips)
        for feed in AllNYCTFeeds
    ]
    # for feed in AllNYCTFeeds:
    #     # print(feed.last_generated)
    #     # print(feed.trips)
    #     trains = [
    #         str(trip)
    #         for trip in feed.trips
    #     ]
    #     # print(trains)
    #     tripList.append(trains)
    # # first = AllNYCTFeeds[0]
    
    # # for key in first.keys():
    # #     print(key)

    num = len(AllNYCTFeeds[0].trips)
    print("num")
    print(num)

    return json.dumps({
            "feeds": trains,
            "trips": trips,
            "tripList": tripList,
        })


@app.route("/stations")
def stations():
    stations = json.load(open("../src/utils/allStations.json", encoding="utf-8"))
    station_values = list(stations.values())
    return json.dumps({
            "stationsJson": stations,
            "stationsList": station_values,
        })


# @app.route("/train/<trip_id>")
# async def train(trip_id):
#     await refresh()
#     for feed in NYCTFeeds:
#         for trip in feed.trips:
#             if trip_id == trip.trip_id:
#                 return render_template(
#                     "train.html",
#                     **{
#                         "trip_id": trip_id,
#                         "route": trip.route_id,
#                         "dest": trip.headsign_text
#                         if trip.headsign_text
#                         else trip.shape_id,
#                         "summary": str(trip),
#                         "nyct_train_id": trip.nyc_train_id,
#                         "stops": [
#                             {
#                                 "stop_id": update.stop_id,
#                                 "stop_name": update.stop_name,
#                                 "arrival": arrow.get(
#                                     update.arrival, get_localzone()
#                                 ).isoformat(),
#                                 "relative": (update.arrival - datetime.now()).seconds
#                                 // 60
#                                 if update.arrival > datetime.now()
#                                 else -1,
#                             }
#                             for update in trip.stop_time_updates
#                         ],
#                     },
#                 )
#     return jsonify({"error": "uhh no train here"})














# # Members API Route
# @app.route("/routes")
# def routes():
#        return {"data": ROUTES}











# from mtapi.mtapi import Mtapi
# from flask import Flask, request, Response, redirect
# import json
# from datetime import datetime
# from functools import wraps, reduce
# import logging
# from flask_cors import CORS, cross_origin

# app = Flask(__name__)
# app.config.update(
#     MAX_TRAINS=10,
#     MAX_MINUTES=30,
#     CACHE_SECONDS=60,
#     THREADED=True
# )
# CORS(app, origins=["http://localhost:3000"])

# # set debug logging
# if app.debug:
#     logging.basicConfig(level=logging.INFO,
#         format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

# class CustomJSONEncoder(json.JSONEncoder):
#     def default(self, obj):
#         try:
#             if isinstance(obj, datetime):
#                 return obj.isoformat()
#             iterable = iter(obj)
#         except TypeError:
#             pass
#         else:
#             return list(iterable)
#         return JSONEncoder.default(self, obj)

# mta = Mtapi(
#     max_trains=app.config['MAX_TRAINS'],
#     max_minutes=app.config['MAX_MINUTES'],
#     expires_seconds=app.config['CACHE_SECONDS'],
#     threaded=app.config['THREADED'])


# def response_wrapper(f):
#     @wraps(f)
#     def decorated_function(*args, **kwargs):
#         resp = f(*args, **kwargs)

#         if not isinstance(resp, Response):
#             # custom JSON encoder; this is important
#             resp = Response(
#                 response=json.dumps(resp, cls=CustomJSONEncoder),
#                 status=200,
#                 mimetype="application/json"
#             )

#         add_cors_header(resp)

#         return resp

#     return decorated_function

# def add_cors_header(resp):
#     if app.config['DEBUG']:
#         resp.headers['Access-Control-Allow-Origin'] = '*'
#     elif 'CROSS_ORIGIN' in app.config:
#         resp.headers['Access-Control-Allow-Origin'] = app.config['CROSS_ORIGIN']

#     return resp

# @app.route('/routes', methods=['GET'])
# @response_wrapper
# def routes():
#     return {
#         'data': sorted(mta.get_routes()),
#         'updated': mta.last_update()
#         }

# @app.route('/by-route/<route>', methods=['GET'])
# @response_wrapper
# def by_route(route):

#     if route.islower():
#         return redirect(request.host_url + 'by-route/' + route.upper(), code=301)

#     try:
#         data = mta.get_by_route(route)
#         return _make_envelope(data)
#     except KeyError as e:
#         resp = Response(
#             response=json.dumps({'error': 'Station not found'}),
#             status=404,
#             mimetype="application/json"
#         )

#         return add_cors_header(resp)

# def _envelope_reduce(a, b):
#     if a['last_update'] and b['last_update']:
#         return a if a['last_update'] < b['last_update'] else b
#     elif a['last_update']:
#         return a
#     else:
#         return b

# def _make_envelope(data):
#     time = None
#     if data:
#         time = reduce(_envelope_reduce, data)['last_update']

#     return {
#         'data': data,
#         'updated': time
#     }

if __name__ == "__main__":
	app.run(debug=True, use_reloader=True)
