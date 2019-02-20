import asyncio
import gpxpy
import gpxpy.gpx
import datetime
from geographiclib.geodesic import Geodesic

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
