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
from apps.logbook.database.Database import Database
from apps.logbook.database.Entry import Entry
from apps.logbook.database.Status import Status
from apps.logbook.database.Telemetry import Telemetry

from utils import T

class Logbook:
    lock = Lock()

    currentPath: str = "statics/downloads"

    def __init__(self, title: str):
        self.id = title
        self.title = title

        Database.use(self.title)

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

            gpx.name = self.title
            track.name = self.title

            for entry in Telemetry.get():
                if entry.Latitude is not None and entry.Longitude is not None:
                    segment.points.append(
                        gpxpy.gpx.GPXTrackPoint(entry.Latitude, entry.Longitude, time=entry.timestamp))

            track.segments.append(segment)
            gpx.tracks.append(track)

            outfile.write(gpx.to_xml())
        return self.currentPath + '.gpx'

    #########################################################################################
    # current logbook helpers ###############################################################
    #########################################################################################

    """create a new line in the logbook"""
    def log(self, name, value):

        entry: Entry = Entry.getType(name).fromDictionary(value)
        entry.save()

        return entry.toDict()

    """delete the last logline
    
    currently unused. may eventually become capable of removing any logline
    """
    def undo(self, data):
        # # do we need to delete the last logline?
        # if data.startswith('undo'):
        #     f = open(self.dataPath + str(self.current) + '.logbook', 'r')
        #     lines = f.readlines()
        #     f.close()

        #     f = open(self.dataPath + str(self.current) + '.logbook', 'w')
        #     f.writelines([item for item in lines[:-1]])
        #     f.close()
        #     return "last entry has been removed"
        pass

    #########################################################################################
    # websocket stuff #######################################################################
    #########################################################################################


    def get_last(self):
        """command parser 'get'"""
        lines: list[Status] = Status.get(1)

        if len(lines) < 1:
            # in case we have an empty logbook
            return Status.fromDictionary({'timestamp': "", 'status': 'landed'}).toDict()
        else:
            return lines[0].toDict()

    def tail(self, span) -> list[dict]:
        entries: list[Entry] = Entry.get(span)

        return [entry.toDict() for entry in entries]