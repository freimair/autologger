import gpxpy.gpx
from sanic import response
from geographiclib.geodesic import Geodesic
import datetime
import os
from utils import T

class Logbook:

    base = "logbook"
    name = "LogBook"

    def __init__(self, app):
        app.add_route(self.getGui, self.base)
        app.add_route(self.download_logbook, self.base + '/logbook.csv')
        app.add_route(self.download_track, self.base + '/track.gpx')

        with open('logbook.csv', 'r') as csvfile:
            lines = csvfile.readlines()

        self.recorder = Recorder()
        self.recorder.distance = float(lines[-1].split(',')[1])

    async def getGui(self, request):
        return response.html(T("index.html").render())

    async def download_logbook(self, request):
        return await response.file('logbook.csv')

    async def download_track(self, request):
        return await response.file('track.gpx')

    async def incoming(self, data):
        self.recorder.incoming(data)

    async def onReceiveCommand(self, data):
        # do we need to delete the last logline?
        if data.startswith('undo'):
            f = open('logbook.csv', 'r')
            lines = f.readlines()
            f.close()

            f = open('logbook.csv', 'w')
            f.writelines([item for item in lines[:-1]])
            f.close()
            return "last entry has been removed"

        # assemble log line
        logline = str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")) + ","
        logline += str(self.recorder.getDistanceTravelled()) + ","
        logline += str(self.recorder.getCurrentSpeed()) + ","
        logline += str(self.recorder.getCourseOverGround()) + ","
        logline += data

        with open('logbook.csv', 'a') as csvfile:
            csvfile.write(logline + os.linesep)

        return logline

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
