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

from utils import T

class Logbook:
    lock = Lock()

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
            status = "landed"
        else:
            status = lines[0].status

        result = {"status": status}
        return json.dumps(result)

    def tail(self, span) -> list[dict]:
        entries: list[Entry] = Entry.get(span)

        return [entry.toDict() for entry in entries]