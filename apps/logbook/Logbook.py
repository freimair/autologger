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

from utils import T

class Logbook:
    lock = Lock()

    """some path constant"""
    base = "logbook"
    dataPath = "statics/logbooks/"

    def __init__(self, id, title=None, description=None):
        self.title = title
        self.description = description

        if 0 == id:
            self.save()
        else:
            self.current = id

    def get_name(self):
        return self.current

    """csv download"""
    def download_logbook(self, request):
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

        return self.currentPath + '.csv'

    """gpx download"""
    def download_track(self, request):
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
        return self.currentPath + '.gpx'

    #########################################################################################
    # current logbook helpers ###############################################################
    #########################################################################################

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
        logline["Data"] = message

        with self.lock:
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


    """command parser 'get'"""
    def get_last(self):
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
                status = json.JSONDecoder().decode(lines[i]).get("status", "")
                i -= 1
                if len(lines) < abs(i):
                    status="landed"
        result = {"status": status}
        return json.dumps(result)

    def tail(self, span):
        with open(self.currentPath + '.logbook', 'r') as csvfile:
            lines = csvfile.read().splitlines()

        result = []
        for current in lines[-min(span + 1, len(lines) - 1):]:
            resulting_line = dict()
            line = json.JSONDecoder().decode(current)
            resulting_line['DateTime'] = line['DateTime']

            sepp = line['Data'].split(',', 1)[1].strip()

            data = json.JSONDecoder().decode(sepp)
            resulting_line.update(data)
            result.append(resulting_line)

        return result

    def save(self):
        with self.lock:
            condition = True
            while condition:
                newLogbookId = datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
                condition = os.path.isfile(self.dataPath + newLogbookId + '.logbook')

            logbook = dict()
            logbook["id"] = newLogbookId
            logbook["title"] = self.title
            logbook["description"] = self.description

            self.current = newLogbookId

            with open(self.currentPath + ".logbook", 'w') as csvfile:
                csvfile.write(json.dumps(logbook) + '\n')

