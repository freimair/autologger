import gpxpy.gpx
from sanic import response
from geographiclib.geodesic import Geodesic
import datetime
import os
from utils import T
import json

class Logbook:

    base = "logbook"
    name = "LogBook"
    dataPath = "statics/logbooks/"

    __current = 0
    @property
    def current(self):
        if self.__current is 0:
            try:
                with open(self.dataPath + 'current', 'r') as csvfile:
                    lines = csvfile.readlines()
                self.load(int(lines[0]))
            except:
                pass

        return self.__current

    @current.setter
    def current(self, value):
        with open(self.dataPath + 'current', 'w') as csvfile:
            csvfile.write(str(value))
        self.__current = value

    def __init__(self, app):
        app.add_websocket_route(self.feed, self.base + '/ws')
        app.add_route(self.getGui, self.base)
        app.add_route(self.download_logbook, self.base + '/logbook.csv')
        app.add_route(self.download_track, self.base + '/track.gpx')


    async def getGui(self, request):
        return response.html(T("logbook.html").render())

    async def feed(self, request, ws):
        while True:
            command = await ws.recv()
            answer = await self.onReceiveCommand(command)
            if answer:
                await ws.send(answer)

    async def download_logbook(self, request):
        return await response.file('logbook.csv')

    async def download_track(self, request):
        return await response.file('track.gpx')

    async def incoming(self, data):
        try:
            self.recorder.incoming(data)
        except:
            pass

    def load(self, logbookId):
        self.current = logbookId

        with open(self.dataPath + str(logbookId) + '.csv', 'r') as csvfile:
            lines = csvfile.readlines()

        self.recorder = Recorder()
        self.recorder.gpxfile = self.dataPath + str(logbookId) + ".gpx" 
        try:
            self.recorder.distance = float(lines[-1].split(',')[1])
        except:
            self.recorder.distance = 0

    async def parse_get(self, data):
        if "last" in data.get("get"):
            try:
                with open(self.dataPath + str(self.current) + '.csv', 'r') as csvfile:
                    lines = csvfile.read().splitlines()

                if len(lines) < 2:
                    # in case we have an empty logbook
                    return '{"status": "landed"}'
                else:
                    return '{"status": "' + lines[-1].split(',')[-1] + '"}'
            except:
                return '{"error": "noLogbook"}'
        else:
            return '{"logbooks":[{"logbook": {"id":1, "title":"logbook1", "description":"description1"}}, {"logbook": {"id":2, "title":"logbook2", "description":"description2"}}, {"logbook": {"id":3, "title":"logbook3", "description":"description3"}}]}'

    async def parse_status(self, data):
        # assemble log line
        logline = str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")) + ","
        logline += str(self.recorder.getDistanceTravelled()) + ","
        logline += str(self.recorder.getCurrentSpeed()) + ","
        logline += str(self.recorder.getCourseOverGround()) + ","
        logline += data.get("status")

        with open(self.dataPath + str(self.current) + '.csv', 'a') as csvfile:
            csvfile.write(logline + os.linesep)

        return json.dumps(data);

    async def parse_save(self, data):
        logbook = data.get("save")
        if logbook.get("id") is 0:
            # find free id
            ids = [0]
            with os.scandir(self.dataPath) as entries:
                for entry in entries:
                    if entry.is_file() and entry.name.endswith(".csv"):
                        ids.append(int(entry.name.replace(".csv", "")))

            ids.sort(reverse = True)

            with open(self.dataPath + str(ids[0] + 1) + ".csv", 'w') as csvfile:
                csvfile.write(json.dumps(logbook) + '\n')

            self.load(ids[0] + 1)
            return await self.parse_get(json.JSONDecoder().decode('{"get": "last"}'))
        else:
            print("editing logbooks is not supported yet")

    async def parse_load(self, data):
        print("load " + json.dumps(data))

    async def onReceiveCommand(self, data):
        incoming = json.JSONDecoder().decode(data)
        result = await getattr(self, 'parse_' + list(incoming)[0], None)(incoming)
        return result

        # do we need to delete the last logline?
        if data.startswith('undo'):
            f = open(self.dataPath + str(self.current) + '.csv', 'r')
            lines = f.readlines()
            f.close()

            f = open(self.dataPath + str(self.current) + '.csv', 'w')
            f.writelines([item for item in lines[:-1]])
            f.close()
            return "last entry has been removed"

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

            #write position to file (gpx?)
            try:
                #if os.path.isfile(self.gpxfile):
                with open(self.gpxfile, 'r') as f:
                    gpx = gpxpy.parse(f)
            except:
                gpx = gpxpy.gpx.GPX()
                segment = gpxpy.gpx.GPXTrackSegment()
                track = gpxpy.gpx.GPXTrack()
                track.segments.append(segment)
                gpx.tracks.append(track)

            gpx.tracks[0].segments[0].points.append(gpxpy.gpx.GPXTrackPoint(new_position[0], new_position[1], time=datetime.datetime.today()))

            with open(self.gpxfile, "w") as f:
                f.write(gpx.to_xml())
        except:
            self.old_position = (0, 0)

        if 0 != self.old_position[0] and 0 != self.old_position[1] and 0 != self.old_timestamp:
            #calculate distance
            data = Geodesic.WGS84.Inverse(self.old_position[0], self.old_position[1], new_position[0], new_position[1])
            self.tack = data['s12']*0.000539956803
            self.cog = data['azi1']

            #calculate tack speed
            self.tackspeed = self.tack / (new_timestamp - self.old_timestamp) * 3600
            print("tack speed has been " + str(self.getCurrentSpeed()))

            #update self.distance
            self.distance = self.distance + self.tack
            print("distance updated to " + str(self.distance))

        #update reference position
        self.old_position = new_position
        self.old_timestamp = new_timestamp

    def getDistanceTravelled(self):
        return float("{0:.2f}".format(round(self.distance,2)))

    def getCurrentSpeed(self):
        return float("{0:.2f}".format(round(self.tackspeed,2)))

    def getCourseOverGround(self):
        if 0 == self.getCurrentSpeed():
            return "-"
        else:
            return float("{0:.2f}".format(round(self.cog, 0)))
