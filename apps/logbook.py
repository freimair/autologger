"""
the logbook app
"""

import datetime
import json
import os
from threading import Lock

from geographiclib.geodesic import Geodesic
import gpxpy.gpx
from sanic import response

from utils import T

class Logbook:
    lock = Lock()

    """some path constant"""
    base = "logbook"
    dataPath = "statics/logbooks/"

    """websocket stuff"""
    clients = dict()  # websocket -> id
    users = dict()  # id -> subscriptions
    websockets = set()

    """init the logbook app by registering endpoints"""
    def __init__(self, sanic_app):
        sanic_app.add_websocket_route(self.feed, self.base + '/ws')
        sanic_app.add_route(self.getGui, self.base)
        sanic_app.add_route(self.download_logbook, self.base + '/logbook.csv')
        sanic_app.add_route(self.download_track, self.base + '/track.gpx')

    """csv download"""
    async def download_logbook(self, request):
        return await response.file(self.currentPath + '.csv')

    """gpx download"""
    async def download_track(self, request):
        return await response.file(self.currentPath + '.gpx')

    #########################################################################################
    # API calls #############################################################################
    #########################################################################################

    """the applications name"""
    name = "LogBook"

    """API call getGui
    
    get the single page application HTML
    """
    async def getGui(self, request):
        return response.html(T("logbook.html").render())

    """API call incoming
    
    this is where data arrives when produced by an infoSource (e.g. the ship or a GPS)
    """
    async def incoming(self, data):
        try:
            self.recorder.incoming(data)
        except:
            pass

    #########################################################################################
    # current logbook helpers ###############################################################
    #########################################################################################

    """the current logbook
    
    Keeps track of the currently active logbook.
    The getter reads the current logbook if it is empty.
    The setter persists the new current logbook immediately.
    Hence, using self.current just works.
    """
    __current = ""

    @property
    def current(self):
        # TODO rethink? gets checked every time self.current is used (and it is used A LOT)
        if self.__current is "":
            try:
                with open(self.dataPath + 'current', 'r') as csvfile:
                    lines = csvfile.readlines()
                self.load(lines[0])
            except:
                pass

        return self.__current

    @current.setter
    def current(self, value):
        with open(self.dataPath + 'current', 'w') as csvfile:
            csvfile.write(value)
        self.__current = value

    """constructs the base path (without the extension) for a logbook"""
    @property
    def currentPath(self):
        return self.dataPath + self.current

    """helper for changing the current logbook"""
    def load(self, logbookId):
        self.current = logbookId

        # TODO optimize! read from last line
        with open(self.currentPath + '.csv', 'r') as csvfile:
            lines = csvfile.readlines()

        self.recorder = Recorder()
        self.recorder.gpxfile = self.currentPath + ".gpx"
        try:
            self.recorder.distance = float(lines[-1].split(',')[1])
        except:
            self.recorder.distance = 0

    """create a new line in the logbook"""
    def log(self, data, what):
        # assemble log line
        logline = str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")) + ","
        logline += str(self.recorder.getDistanceTravelled()) + ","
        logline += str(self.recorder.getCurrentSpeed()) + ","
        logline += str(self.recorder.getCourseOverGround()) + ","
        logline += data.get(what)

        with open(self.currentPath + '.csv', 'a') as csvfile:
            csvfile.write(logline + os.linesep)

        return logline

    """delete the last logline
    
    currently unused. may eventually become capable of removing any logline
    """
    def undo(self, data):
        # do we need to delete the last logline?
        if data.startswith('undo'):
            f = open(self.dataPath + str(self.current) + '.csv', 'r')
            lines = f.readlines()
            f.close()

            f = open(self.dataPath + str(self.current) + '.csv', 'w')
            f.writelines([item for item in lines[:-1]])
            f.close()
            return "last entry has been removed"

    #########################################################################################
    # websocket stuff #######################################################################
    #########################################################################################

    """the websocket endpoint handler
    
    adds and removes websocket clients to the list of receivers.
    distributes answers to clients that are subscribed to the answer.
    """
    async def feed(self, request, ws):
        self.websockets.add(ws)

        try:
            async for command in ws:
                answer = await self.onReceiveCommand(command, ws)
                if answer:
                    for client in self.websockets:
                        if list(json.loads(answer))[0] in self.users.get(self.clients.get(ws)):
                            await client.send(answer)
        except:
            self.websockets.remove(ws)

    """command relay"""
    async def onReceiveCommand(self, data, ws):
        incoming = json.JSONDecoder().decode(data)
        result = await getattr(self, 'parse_' + list(incoming)[0], None)(incoming, ws)
        return result

    """command parser 'get'"""
    async def parse_get(self, data, ws):
        if "last" in data.get("get"):
            try:
                # TODO optimize! read from last line
                with open(self.currentPath + '.csv', 'r') as csvfile:
                    lines = csvfile.read().splitlines()

                if len(lines) < 2:
                    # in case we have an empty logbook
                    return '{"status": "landed"}'
                else:
                    i = -1
                    while lines[i].split(',')[-1] not in ['landed', 'sailing', 'reef', 'motoring']:
                        i -= 1
                    return '{"status": "' + lines[i].split(',')[-1] + '"}'
            except:
                await ws.send('{"error": "noLogbook"}')
        elif "logbooks" in data.get("get"):
            with os.scandir(self.dataPath) as entries:
                result = '{"logbooks" : ['
                for entry in entries:
                    if entry.is_file() and entry.name.endswith(".csv"):
                        with open(self.dataPath + entry.name, 'r') as csvfile:
                            result += csvfile.readline() + ","

                return result[:-1] + ']}'

    """command parser 'status'"""
    async def parse_status(self, data, ws):
        logline = self.log(data, "status")

        return '{"status":"' + data.get("status") + '","logline": "<tr><td>' + logline.replace(',', '</td><td>') + '</td></tr>"}'

    """command parser 'message'"""
    async def parse_message(self, data, ws):
        logline = self.log(data, "message")

        return '{"logline": "<tr><td>' + logline.replace(',', '</td><td>') + '</td></tr>"}'

    """command parser 'save'"""
    async def parse_save(self, data, ws):
        logbook = data.get("save")
        if logbook.get("id") is 0:
            with self.lock:
                condition = True
                while condition:
                    newLogbookId = datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
                    condition = os.path.isfile(self.dataPath + newLogbookId + '.csv')

                logbook["id"] = newLogbookId

                self.current = newLogbookId

                with open(self.currentPath + ".csv", 'w') as csvfile:
                    csvfile.write(json.dumps(logbook) + '\n')

            self.load(self.current)
            return await self.parse_get(json.JSONDecoder().decode('{"get": "last"}'))
        else:
            print("editing logbooks is not supported yet")

    """command parser 'load'"""
    async def parse_load(self, data, ws):
        self.load(data.get("load"))

    """command parser 'subscribe'"""
    async def parse_subscribe(self, data, ws):
        self.users[self.clients[ws]].add(data.get("subscribe"))

        if not "logline" in data.get("subscribe") or not os.path.exists(self.currentPath + ".csv"):
            return

        # and send the last 5 entries for now
        with open(self.currentPath + '.csv', 'r') as csvfile:
            lines = csvfile.read().splitlines()

        result = '{"logline": "'
        for logline in lines[-5:]:
            if logline[0] is not "{":  # we have less then 5 entries in our logbook
                result += '<tr><td>' + logline.replace(',', '</td><td>') + '</td></tr>'

        await ws.send(result + '"}')

    """command parser 'register'"""
    async def parse_register(self, data, ws):
        self.clients[ws] = data.get("register")
        self.users[self.clients[ws]] = set({'status'})

"""
the gpx recorder used by the logbook
"""
class Recorder():

    def __init__(self):
        self.distance = 0
        self.old_position = (0, 0)
        self.old_timestamp = 0
        self.tackspeed = 0
        self.tack = 0
        self.gpxfile = "track.gpx"

    def incoming(self, data):
        try:
            new_position = data[0]
            new_timestamp = data[1]

            # write position to file (gpx?)
            try:
                # if os.path.isfile(self.gpxfile):
                with open(self.gpxfile, 'r') as f:
                    gpx = gpxpy.parse(f)
            except:
                gpx = gpxpy.gpx.GPX()
                segment = gpxpy.gpx.GPXTrackSegment()
                track = gpxpy.gpx.GPXTrack()
                track.segments.append(segment)
                gpx.tracks.append(track)

            gpx.tracks[0].segments[0].points.append(gpxpy.gpx.GPXTrackPoint(new_position[0], new_position[1], time = datetime.datetime.today()))

            with open(self.gpxfile, "w") as f:
                f.write(gpx.to_xml())
        except:
            self.old_position = (0, 0)

        if 0 != self.old_position[0] and 0 != self.old_position[1] and 0 != self.old_timestamp:
            # calculate distance
            data = Geodesic.WGS84.Inverse(self.old_position[0], self.old_position[1], new_position[0], new_position[1])
            self.tack = data['s12'] * 0.000539956803
            self.cog = data['azi1']

            # calculate tack speed
            self.tackspeed = self.tack / (new_timestamp - self.old_timestamp) * 3600
            # print("tack speed has been " + str(self.getCurrentSpeed()))

            # update self.distance
            self.distance = self.distance + self.tack
            # print("distance updated to " + str(self.distance))

        # update reference position
        self.old_position = new_position
        self.old_timestamp = new_timestamp

    def getDistanceTravelled(self):
        return float("{0:.2f}".format(round(self.distance, 2)))

    def getCurrentSpeed(self):
        return float("{0:.2f}".format(round(self.tackspeed, 2)))

    def getCourseOverGround(self):
        if 0 == self.getCurrentSpeed():
            return "-"
        else:
            return float("{0:.2f}".format(round(self.cog, 0)))
