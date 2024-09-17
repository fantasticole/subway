from flask import Flask, render_template, request, jsonify
from flask_squeeze import Squeeze
from asgiref.wsgi import WsgiToAsgi
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, emit, join_room, leave_room, send, Namespace
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

async def refresh():
    global last_updated_time
    if (datetime.now() - last_updated_time).seconds >= 14:
        last_updated_time = datetime.now()
        timer = datetime.now()
        print(arrow.get(timer), 'refreshing')
        await asyncio.gather(*(feed.refresh_async() for feed in NYCTFeeds))
        print(str(arrow.utcnow()), 'refresh finished in', str(datetime.now() - timer))

def refresh_all():
    [feed.refresh() for feed in NYCTFeeds]
    mta._update()

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

# thread = None
# # Thread events signal a thread (loop) when it should stop and start
# thread_event = Event()
# # Thread locks are synchronization mechanisms that allow multiple threads to access a shared resource safely
# thread_lock = Lock()
#     # if there is a thread, signal for it to stop
#     with thread_lock:
#         if thread is not None:
#             thread_event.clear()
#             thread.join()
#     with thread_lock:
#         if thread is not None:
#             # signal the thread to stop
#             thread_event.clear()
#             thread.join()
#             # signal the thread to start
#             thread_event.set()
#             thread = socketio.start_background_task(linestream, line_id, thread_event)
#         if thread is None:
#             # signal the thread to start
#             thread_event.set()
#             thread = socketio.start_background_task(linestream, line_id, thread_event)

class TrainNamespace(Namespace):        
    def on_connect(self):
        print("on_connect")
        self.thread = None
        self.thread_event = Event()
        self.thread_lock = Lock()
        line_id = self.namespace[1:]
        print("line_id" , line_id)
        # for key in dir(self):
        #     print("key ", key)
        #     key  call
        # key  close_room
        # key  disconnect
        # key  emit
        # key  enter_room
        # key  get_session
        # key  is_asyncio_based
        # key  leave_room
        # key  linestream
        # key  namespace
        # key  on_connect
        # key  on_disconnect
        # key  on_event
        # key  rooms
        # key  save_session
        # key  send
        # key  server
        # key  session
        # key  socketio
        # key  thread
        # key  thread_event
        # key  thread_lock
        # key  trigger_event
        with self.thread_lock:
            if self.thread is None:
                # signal the thread to start
                self.thread_event.set()
                self.thread = self.socketio.start_background_task(self.linestream, line_id)

    def on_disconnect(self):
        with self.thread_lock:
            if self.thread is not None:
                self.thread_event.clear()
                self.thread.join()

    def linestream(self, line_id):
        print("linestream" , line_id)
        count = 0
        try:
            while self.thread_event.is_set():
                print("count" , count)
                count += 1
                route = RouteMap[line_id]
                feed = NYCTFeedMap[route]
                feed.refresh()
                # mta._update()
                update = get_trip_update(line_id)
                self.emit('streamline', update)
                self.socketio.sleep(1)
        finally:
            self.thread_event.clear()
            thread = None

    def on_event(self, data):
        print("my_event")
        print("self" , self)
        print("namespace" , self.namespace)
        line = self.namespace[1:]
        print("line" , line)
        print("thread" , self.thread)
        emit('my_response', data)

socketio.on_namespace(TrainNamespace('/1'))
socketio.on_namespace(TrainNamespace('/2'))
socketio.on_namespace(TrainNamespace('/3'))
socketio.on_namespace(TrainNamespace('/4'))
socketio.on_namespace(TrainNamespace('/5'))
socketio.on_namespace(TrainNamespace('/6'))
socketio.on_namespace(TrainNamespace('/6X'))
socketio.on_namespace(TrainNamespace('/7'))
socketio.on_namespace(TrainNamespace('/7X'))
socketio.on_namespace(TrainNamespace('/S'))
socketio.on_namespace(TrainNamespace('/GS'))
socketio.on_namespace(TrainNamespace('/A'))
socketio.on_namespace(TrainNamespace('/C'))
socketio.on_namespace(TrainNamespace('/E'))
socketio.on_namespace(TrainNamespace('/H'))
socketio.on_namespace(TrainNamespace('/FS'))
socketio.on_namespace(TrainNamespace('/SF'))
socketio.on_namespace(TrainNamespace('/SR'))
socketio.on_namespace(TrainNamespace('/B'))
socketio.on_namespace(TrainNamespace('/D'))
socketio.on_namespace(TrainNamespace('/F'))
socketio.on_namespace(TrainNamespace('/M'))
socketio.on_namespace(TrainNamespace('/G'))
socketio.on_namespace(TrainNamespace('/J'))
socketio.on_namespace(TrainNamespace('/Z'))
socketio.on_namespace(TrainNamespace('/N'))
socketio.on_namespace(TrainNamespace('/Q'))
socketio.on_namespace(TrainNamespace('/R'))
socketio.on_namespace(TrainNamespace('/W'))
socketio.on_namespace(TrainNamespace('/L'))
socketio.on_namespace(TrainNamespace('/SI'))
socketio.on_namespace(TrainNamespace('/SS'))
socketio.on_namespace(TrainNamespace('/SIR'))

# @socketio.on('train', namespace='/test')
# def handle_my_custom_namespace_event(json):
#     print('received json: ' + str(json))



# def stream_this_line(N):
#     def action(X):
#         return X * N
#     return action

# socketio.on_namespace(TrainNamespace('/test'))
# socketio.on_namespace(MyCustomNamespace('/test'))

# @socketio.on('join')
# def on_join(room):
#     print('join room ', room)
#     join_room(room)
#     # send('cole has entered the room.', to=room)
#     emit('update', 'cole has entered the room.', room=room)

# # @socketio.on('test')
# # def on_test():
# #     # print('join room ', room)
# #     # join_room(room)
# #     # # send('cole has entered the room.', to=room)
# #     # emit('update', 'cole has entered the room.', to=room)
# #     emit('testevent', 'my_data', to=request.sid)

# @socketio.on('leave')
# def on_leave(room):
#     print('leave room ', room)
#     leave_room(room)
#     # send('cole has left the room.', to=room)
#     emit('update', 'cole has left the room.', room=room)

def linestream(line_id, event):
    global thread
    count = 0
    try:
        while event.is_set():
            count += 1
            refresh_all()
            update = get_trip_update(line_id)
            socketio.emit('streamline', update)
            socketio.sleep(1)
    finally:
        event.clear()
        thread = None

@socketio.on('streamline')
def streamline(line_id):
    print('streamline')
    global thread
    # lock the thread if it isn't already
    with thread_lock:
        if thread is not None:
            # signal the thread to stop
            thread_event.clear()
            thread.join()
            # signal the thread to start
            thread_event.set()
            thread = socketio.start_background_task(linestream, line_id, thread_event)
        if thread is None:
            # signal the thread to start
            thread_event.set()
            thread = socketio.start_background_task(linestream, line_id, thread_event)

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

    if not line_id:
        for feed in NYCTFeeds:
            trips += feed.trips
        this_line = get_this_line(trips)
    else:
        this_line = get_trip_update(line_id)

    response = jsonify({
        'lines': this_line,
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
