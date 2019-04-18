"""
the logbook app
"""

import datetime
import json
import csv
import os
from threading import Lock
import asyncio

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

    """the logbook state"""
    snapshot = dict()

    """init the logbook app by registering endpoints"""
    def __init__(self, sanic_app):
        sanic_app.add_websocket_route(self.feed, self.base + '/ws')
        sanic_app.add_route(self.getGui, self.base)
        sanic_app.add_route(self.download_logbook, self.base + '/logbook.csv')
        sanic_app.add_route(self.download_track, self.base + '/track.gpx')

        sanic_app.add_task(self.timer())

    """csv download"""
    async def download_logbook(self, request):
        columns = set()
        for line in reversed(list(open(self.currentPath + '.logbook', "r"))):
            source = json.loads(line)
            columns.update(source.keys())

        columns.discard("id")
        columns.discard("title")
        columns.discard("description")

        columns = sorted(columns)

        with open(self.currentPath + '.csv', "w") as outfile:
            for current in source:
                outfile.write(current + ": " + source[current] + os.linesep)
            outfile.write(os.linesep)

            writer = csv.DictWriter(outfile, fieldnames=columns, restval="")
            writer.writeheader()
            for line in open(self.currentPath + '.logbook', "r"):
                source = json.loads(line)
                try:
                    writer.writerow(source)
                except:
                    # the id, title, description columns are not in the list of columns
                    pass

        return await response.file(self.currentPath + '.csv')

    """gpx download"""
    async def download_track(self, request):
        with open(self.currentPath + '.gpx', "w") as outfile:
            gpx = gpxpy.gpx.GPX()
            segment = gpxpy.gpx.GPXTrackSegment()
            track = gpxpy.gpx.GPXTrack()
            with open(self.currentPath + '.logbook', "r") as infile:
                source = json.loads(infile.readline())
                gpx.name = source.get("title")
                track.name = source.get("title")
                gpx.description = source.get("description")
                track.description = source.get("description")
            track.segments.append(segment)
            gpx.tracks.append(track)

            for line in open(self.currentPath + '.logbook', "r"):
                source = json.loads(line)
                try:
                    gpx.tracks[0].segments[0].points.append(
                        gpxpy.gpx.GPXTrackPoint(source["Latitude"], source["Longitude"], time=datetime.datetime.strptime(source["DateTime"], '%Y-%m-%d %H:%M:%S')))
                except Exception:
                    pass # first line is special

            outfile.write(gpx.to_xml())
        return await response.file(self.currentPath + '.gpx')

    async def timer(self):
        while True:
            await asyncio.sleep(5)
            await self.broadcast(json.dumps({"logline": self.log("")}))

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
    async def incoming(self, name, value):
        try:
            self.snapshot.update({name: value})
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

    """create a new line in the logbook"""
    def log(self, message):
        # assemble log line
        logline = dict()
        logline["DateTime"] = str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        logline.update(self.snapshot)
        logline["Note"] = message

        with open(self.currentPath + '.logbook', 'a') as csvfile:
            csvfile.write(json.dumps(logline) + os.linesep)

        return logline

    """delete the last logline
    
    currently unused. may eventually become capable of removing any logline
    """
    def undo(self, data):
        # do we need to delete the last logline?
        if data.startswith('undo'):
            f = open(self.dataPath + str(self.current) + '.logbook', 'r')
            lines = f.readlines()
            f.close()

            f = open(self.dataPath + str(self.current) + '.logbook', 'w')
            f.writelines([item for item in lines[:-1]])
            f.close()
            return "last entry has been removed"

    #########################################################################################
    # websocket stuff #######################################################################
    #########################################################################################

    """the websocket endpoint handler

    adds and removes websocket clients to the list of receivers.
    """
    async def feed(self, request, ws):
        self.websockets.add(ws)

        try:
            async for command in ws:
                answer = await self.onReceiveCommand(command, ws)
                if answer:
                    await self.broadcast(answer)
        except:
            self.websockets.remove(ws)

    """broadcast messages
    
    distributes answers to clients that are subscribed to the answer.
    """
    async def broadcast(self, data):
        for client in self.websockets:
            if list(json.loads(data))[0] in self.users.get(self.clients.get(client)):
                await client.send(data)


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
                with open(self.currentPath + '.logbook', 'r') as csvfile:
                    lines = csvfile.read().splitlines()

                if len(lines) < 2:
                    # in case we have an empty logbook
                    status = "landed"
                else:
                    i = -1
                    status = ''
                    while status not in ['landed', 'sailing', 'reef', 'motoring']:
                        status = json.JSONDecoder().decode(lines[i]).get("Note", "")
                        i -= 1
                result = {"status": status}
                return json.dumps(result)
            except:
                await ws.send('{"error": "noLogbook"}')
        elif "logbooks" in data.get("get"):
            with os.scandir(self.dataPath) as entries:
                result = '{"logbooks" : ['
                for entry in entries:
                    if entry.is_file() and entry.name.endswith(".logbook"):
                        with open(self.dataPath + entry.name, 'r') as csvfile:
                            result += csvfile.readline() + ","
            await ws.send(result[:-1] + ']}')

    """command parser 'status'"""
    async def parse_status(self, data, ws):
        logline = self.log(data.get("status"))
        return json.dumps({"status": data.get("status"), "logline": logline})

    """command parser 'message'"""
    async def parse_message(self, data, ws):
        logline = self.log(data.get("message"))

        return json.dumps({"logline": logline})

    """command parser 'save'"""
    async def parse_save(self, data, ws):
        logbook = data.get("save")
        if logbook.get("id") is 0:
            with self.lock:
                condition = True
                while condition:
                    newLogbookId = datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
                    condition = os.path.isfile(self.dataPath + newLogbookId + '.logbook')

                logbook["id"] = newLogbookId

                self.current = newLogbookId

                with open(self.currentPath + ".logbook", 'w') as csvfile:
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

        if not "logline" in data.get("subscribe") or not os.path.exists(self.currentPath + ".logbook"):
            return

        # and send the last 5 entries for now
        with open(self.currentPath + '.logbook', 'r') as csvfile:
            lines = csvfile.read().splitlines()

        for logline in lines[-min(len(lines), 5):]:
            await ws.send(json.dumps({"logline": json.JSONDecoder().decode(logline)}))


    """command parser 'register'"""
    async def parse_register(self, data, ws):
        self.clients[ws] = data.get("register")
        self.users[self.clients[ws]] = set({'status'})

