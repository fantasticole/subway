import copy
import json
import datetime
import math
from collections import defaultdict
from operator import itemgetter
from pytz import timezone
from itertools import islice

def distance(p1, p2):
    return math.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2)

# globals
stations_json = json.load(open('../src/utils/allStations.json', encoding='utf-8'))

TZ = timezone('US/Eastern')

class Mtapi(object):

    class _Station(object):
        last_update = None

        def __init__(self, json):
            self.json = json
            self.trains = {}
            self.clear_train_data()

        def __getitem__(self, key):
            return self.json[key]

        def add_train(self, route_id, direction, train_time, feed_time):
            self.routes.add(route_id)
            # direction could be None
            if direction:
                self.trains[direction].append({
                    'route': route_id,
                    'time': train_time
                })
            self.last_update = feed_time

        def clear_train_data(self):
            self.trains['N'] = []
            self.trains['S'] = []
            self.routes = set()
            self.last_update = None

        def sort_trains(self, max_trains):
            self.trains['S'] = sorted(self.trains['S'], key=itemgetter('time'))[:max_trains]
            self.trains['N'] = sorted(self.trains['N'], key=itemgetter('time'))[:max_trains]

        def serialize(self):
            out = {
                'N': self.trains['N'],
                'S': self.trains['S'],
                'routes': list(self.routes),
                'last_update': self.last_update,
            }
            out.update(self.json)
            return out

    def __init__(self, nyct_feeds, expires_seconds=60, max_trains=10, max_minutes=30):
        self._MAX_TRAINS = max_trains
        self._MAX_MINUTES = max_minutes
        self._EXPIRES_SECONDS = expires_seconds
        self._nyct_feeds = nyct_feeds
        self._stations = {}
        self._stops_to_stations = {}
        self._routes = {}

        # initialize the stations database
        self._stations = stations_json
        for id in self._stations:
            self._stations[id] = self._Station(self._stations[id])
        self._stops_to_stations = self._build_stops_index(self._stations)

        self._update()

    def _update(self):
        print('updating...')
        self._last_update = datetime.datetime.now(TZ)

        # create working copy for thread safety
        stations = copy.deepcopy(self._stations)

        # clear old times
        for id in stations:
            stations[id].clear_train_data()

        routes = defaultdict(set)

        for feed in list(self._nyct_feeds):
            max_time = self._last_update + datetime.timedelta(minutes = self._MAX_MINUTES)

            for trip in feed.trips:
                direction = trip.direction
                route_id = trip.route_id

                for update in trip.stop_time_updates:

                    try:
                        raw_time = update.arrival or update.departure
                        time_int = int(raw_time.timestamp())
                        trip_time = datetime.datetime.fromtimestamp(time_int, TZ)
                    except AttributeError:
                        trip_time = None

                    if trip_time < self._last_update or trip_time > max_time:
                        continue

                    # strip last character because it tells the direction (N/S)
                    stop_id = update.stop_id[:-1]

                    if stop_id not in self._stops_to_stations:
                        # "any stop ID which appears in the GTFS-rt feed but does not appear in the GTFS stops.txt file should be treated as a non-revenue stop and can be dropped." (https://groups.google.com/g/mtadeveloperresources/c/W_HSpV1BO6I/m/v8HjaopZAwAJ)
                        print('Stop %s not found' % (stop_id))
                        continue

                    station_id = self._stops_to_stations[stop_id]
                    stations[station_id].add_train(route_id,
                                                   direction,
                                                   trip_time,
                                                   feed.last_generated)

                    routes[route_id].add(stop_id)


        # sort by time
        for id in stations:
            stations[id].sort_trains(self._MAX_TRAINS)

        self._routes = routes
        self._stations = stations

    @staticmethod
    def _build_stops_index(stations):
        stops = {}
        for station_id in stations:
            for stop_id in stations[station_id]['stops'].keys():
                stops[stop_id] = station_id

        return stops


    def get_by_point(self, point, limit=5):
        if self.is_expired():
            self._update()

        sortable_stations = copy.deepcopy(self._stations).values()

        sorted_stations = sorted(sortable_stations, key=lambda s: distance(s['location'], point))
        serialized_stations = map(lambda s: s.serialize(), sorted_stations)

        return list(islice(serialized_stations, limit))

    def get_current_routes(self):
        return self._routes.keys()

    def get_by_route(self, route):
        route = route.upper()

        if self.is_expired():
            self._update()

        out = [ self._stations[self._stops_to_stations[k]].serialize() for k in self._routes[route] ]

        out.sort(key=lambda x: x['name'])
        return out

    def get_by_id(self, ids):
        if self.is_expired():
            self._update()

        out = [ self._stations[k].serialize() for k in ids ]

        return out

    def is_expired(self):
        if self._EXPIRES_SECONDS:
            age = datetime.datetime.now(TZ) - self._last_update
            return age.total_seconds() > self._EXPIRES_SECONDS
        else:
            return False
