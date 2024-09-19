from flask import Flask, render_template, request, jsonify
from flask_squeeze import Squeeze
from asgiref.wsgi import WsgiToAsgi
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, emit
from mtapi import Mtapi
from time import sleep
from threading import Event, Lock

import asyncio
import os
import json

from nyct_gtfs import NYCTFeed

from nyct_gtfs.gtfs_static_types import Stations

from datetime import datetime, date, time, timezone, tzinfo, timedelta
import arrow
from itertools import groupby, chain

from tzlocal import get_localzone

RouteMap = {
    '1': '1',
    '2': '1',
    '3': '1',
    '4': '1',
    '5': '1',
    '6': '1',
    '6X': '1',
    '7': '1',
    '7X': '1',
    'S': '1',
    'GS': '1',
    'A': 'A',
    'C': 'A',
    'E': 'A',
    'H': 'A',
    'FS': 'A',
    'SF': 'A',
    'SR': 'A',
    'B': 'F',
    'D': 'F',
    'F': 'F',
    'FX': 'F',
    'M': 'F',
    'G': 'G',
    'J': 'J',
    'Z': 'J',
    'N': 'N',
    'Q': 'N',
    'R': 'N',
    'W': 'N',
    'L': 'L',
    'SI': 'SI',
    'SS': 'SI',
    'SIR': 'SI',
}

Feeds = ('1', 'A', 'F', 'G', 'J', 'L', 'N', 'SI')
NYCTFeedMap = {
    '1': NYCTFeed('1', fetch_immediately=True),
    'A': NYCTFeed('A', fetch_immediately=True),
    'F': NYCTFeed('F', fetch_immediately=True),
    'G': NYCTFeed('G', fetch_immediately=True),
    'J': NYCTFeed('J', fetch_immediately=True),
    'L': NYCTFeed('L', fetch_immediately=True),
    'N': NYCTFeed('N', fetch_immediately=True),
    'SI': NYCTFeed('SI', fetch_immediately=True),
}
NYCTFeeds = NYCTFeedMap.values()

# initialize flask app
squeeze = Squeeze()
app = Flask(__name__)
CORS(app, support_credentials=True)
socketio = SocketIO(app, cors_allowed_origins='*')
squeeze.init_app(app)
asgi_app = WsgiToAsgi(app)

# globals
last_updated_time = datetime.now()
stations_json = json.load(open('../src/utils/allStations.json', encoding='utf-8'))
mta = Mtapi(NYCTFeeds)
thread = None
selected_route = None
# Thread events signal a thread (loop) when it should stop and start
thread_event = Event()
# Thread locks are synchronization mechanisms that allow multiple threads to access a shared resource safely
thread_lock = Lock()

def add_cors_header(resp):
    if True:
    # if app.config['DEBUG']:
        resp.headers['Access-Control-Allow-Origin'] = '*'
    elif 'CROSS_ORIGIN' in app.config:
        resp.headers['Access-Control-Allow-Origin'] = app.config['CROSS_ORIGIN']

    return resp

def get_trip_by_id(trip_id):
    for feed in NYCTFeeds:
        for trip in feed.trips:
            if trip_id == trip.trip_id:
                return trip

def format_time(time):
    if time is not None:
        return arrow.get(time, get_localzone()).isoformat()
    return 0

def get_arrival(time):
    if time is not None:
        return {
            'arrival': format_time(time),
            'relative': (time - datetime.now()).seconds
            // 60
            if time > datetime.now()
            else -1,
        }
    return {}


def get_stop_time_update(update):
    return {
        **get_arrival(update.arrival),
        'stop_id': update.stop_id[:-1],
        'stop_name': update.stop_name,
    }

def train_data_from_trip(trip):
    try:
        trip_string = str(trip)
    except ValueError:
        trip_string =  'No trip string'

    return {
        'trip_id': trip.trip_id,
        'route': trip.route_id,
        'direction': trip.direction,
        # This is the time of the last detected movement of the train.
        # This allows feed consumers to detect the situation when a train
        # stops moving (aka stalled)
        'last_position_update': format_time(trip.last_position_update),
        'dest': trip.headsign_text
        if trip.headsign_text
        else trip.shape_id,
        'summary': trip_string,
        'nyct_train_id': trip.nyc_train_id,
        'stops': [
            get_stop_time_update(update) for update in trip.stop_time_updates
        ],
    }

def get_trip_update(line_id):
    route = RouteMap[line_id]
    feed = NYCTFeedMap[route]
    trips = feed.filter_trips(line_id=line_id, underway=True)

    this_line = get_this_line(trips)

    return this_line

def get_this_line(trips):
    this_line = []

    for trip in trips:
        train_data = train_data_from_trip(trip)
        next_stop = train_data['stops'][0] if len(train_data['stops']) != 0 else None
        this_line.append({
            **train_data,
            'next_stop': next_stop,
            })

    return this_line

def format_stations(stations):
    station_list = []

    for station in stations:
        formatted = {
            'N': [
                {'route': arrival['route'],
                'time': format_time(arrival['time']),} for arrival in station['N']
            ],
            'S': [
                {'route': arrival['route'],
                'time': format_time(arrival['time']),} for arrival in station['S']
            ],
            'id': station['id'],
            'last_update': format_time(station['last_update']),
            'location': station['location'],
            'name': station['name'],
            'routes': station['routes'],
            'stops': station['stops'],
        }
        station_list.append(formatted)

    return station_list
 
def refresh_all():
    global last_updated_time
    [feed.refresh() for feed in NYCTFeeds]
    mta._update()
    last_updated_time = datetime.now()

def map_feeds(line_id=None):
    feed_map = {}

    if not line_id:
        for feed in NYCTFeeds:
            feed_trips = get_this_line(feed.trips)
            for trip in feed_trips:
                route = trip['route']
                feed_map[route] = feed_map.get(route, []) + [trip]

    else:
        route = RouteMap[line_id]
        feed = NYCTFeedMap[route]
        trip_list = feed.filter_trips(line_id=line_id)
        feed_map[route] = get_this_line(trip_list)

    return feed_map;

async def refresh():
    global last_updated_time
    if (datetime.now() - last_updated_time).seconds >= 14:
        last_updated_time = datetime.now()
        timer = datetime.now()
        print(arrow.get(timer), 'refreshing')
        await asyncio.gather(*(feed.refresh_async() for feed in NYCTFeeds))
        print(str(arrow.utcnow()), 'refresh finished in', str(datetime.now() - timer))

async def get_arrivals(stations):
    print(str(arrow.utcnow()), 'getting arrivals')
    trains = []
    await refresh()

    directional_stations = [(f'{station}N', f'{station}S') for station in stations]
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

@socketio.on('connect')
def connected():
    # event listener when client connects to the server
    print("request.sid ", request.sid)
    print('client has connected')

@socketio.on('disconnect')
def disconnected():
    # event listener when client disconnects from the server
    print("request.sid ", request.sid)
    print('client has disconnected')
    # if there is a thread, signal for it to stop
    with thread_lock:
        if thread is not None:
            thread_event.clear()
            thread.join()

@socketio.on('route')
def on_route(route_id):
    global selected_route
    selected_route = route_id

def linestream(event):
    global thread
    count = 0
    try:
        while event.is_set():
            count += 1
            refresh_all()
            train_map = map_feeds()
            if selected_route is not None:
                stations = format_stations(mta.get_by_route(selected_route))
            else:
                stations = []
            update = {
                'trains': train_map,
                'stations': stations,
                'route': selected_route,
                'updated': format_time(last_updated_time),
            }

            socketio.emit('stream', update)
            socketio.sleep(1)
    finally:
        event.clear()
        thread = None

@socketio.on('stream')
def stream():
    print('stream')
    global thread
    # lock the thread if it isn't already
    with thread_lock:
        if thread is not None:
            # signal the thread to stop
            thread_event.clear()
            thread.join()
            # signal the thread to start
            thread_event.set()
            thread = socketio.start_background_task(linestream, thread_event)
        if thread is None:
            # signal the thread to start
            thread_event.set()
            thread = socketio.start_background_task(linestream, thread_event)

@app.route('/arrivals')
async def arrivals():
    stop_ids = tuple(request.args.get('stop_ids', 'A41,R29').split(','))
    arrivals = await get_arrivals(stop_ids)
    station_name = '/'.join(
        set([Stations().get_station_name(stop_id) for stop_id in stop_ids])
    )

    relative_arrivals = [
        {
            'route': route,
            'dest': dest,
            'arrival_time': arrow.get(arrival_time, get_localzone()).isoformat(),
            'relative': (arrival_time - datetime.now()).seconds // 60,
            'direction': direction,
            'trip_id': trip_id,
        }
        for (route, dest, arrival_time, direction, trip_id) in arrivals
    ]

    response = jsonify({
            'stop_ids': request.args.get('stop_ids', 'A41,R29').split(','),
            'station_name': station_name,
            'mode': request.args.get('mode', 'detailed'),
            'updated': arrow.get(last_updated_time, get_localzone()).isoformat(),
            'updated_readable': arrow.get(last_updated_time, get_localzone()).humanize(arrow.utcnow()),
            'arrivals': sorted(
                [arr for arr in relative_arrivals if arr['relative'] < 30],
                key=lambda arr: arr['arrival_time'],
            ),
            })
    return add_cors_header(response)


@app.route('/route/<route_id>')
async def route(route_id):
    data = mta.get_by_route(route_id)

    response = jsonify({
        'data': data,
        'updated': last_updated_time
        })
    return add_cors_header(response)


@app.route('/routes')
async def routes():
    data = list(mta.get_current_routes())

    response = jsonify({
        'data': data,
        'updated': last_updated_time
        })
    return add_cors_header(response)


@app.route('/stations')
def stations():
    response = jsonify({
        'stations_json': stations_json,
        'station_list': list(stations_json.values()),
        'updated': last_updated_time
        })
    return add_cors_header(response)

@app.route('/lines', defaults={'line_id': None})
@app.route('/lines/<line_id>')
async def line(line_id):
    trips = []
    all_lines = map_feeds(line_id)

    response = jsonify({
        'lines': all_lines,
        'updated': last_updated_time
        })

    return add_cors_header(response)


@app.route('/train/<trip_id>')
async def train(trip_id):
    await refresh()
    trip = get_trip_by_id(trip_id)
    if trip:
        response = jsonify(train_data_from_trip(trip))
        return add_cors_header(response)
    return jsonify({'error': 'uhh no train here'})


@app.route('/by-location', methods=['GET'])
def by_location():
    try:
        location = (float(request.args['lat']), float(request.args['lon']))
    except KeyError as e:
        print(e)
        resp = Response(
            response=json.dumps({'error': 'Missing lat/lon parameter'}),
            status=400,
            mimetype='application/json'
        )

        return add_cors_header(resp)

    data = mta.get_by_point(location, 5)
    response = jsonify({
        'data': data,
        'updated': last_updated_time
        })
    return add_cors_header(response)


@app.route('/by-id/<id_string>', methods=['GET'])
def by_index(id_string):
    ids = id_string.split(',')
    try:
        data = mta.get_by_id(ids)
        response = jsonify({
            'data': data,
            'updated': last_updated_time
            })
        return add_cors_header(response)
    except KeyError as e:
        resp = Response(
            response=json.dumps({'error': 'Station not found'}),
            status=404,
            mimetype='application/json'
        )

        return add_cors_header(resp)

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000, use_reloader=True)
