"""
the logbook app
"""

import datetime
import json
import csv
import os
from threading import Lock
import asyncio

from sanic import response

from utils import T
from apps.logbook.Logbook import Logbook

class App:
    lock = Lock()

    """some path constant"""
    base = "logbook"
    dataPath = "statics/logbooks/"

    """websocket stuff"""
    clients = set()

    """init the logbook app by registering endpoints"""
    def __init__(self, sanic_app):

        sanic_app.add_websocket_route(self.feed, self.base + '/ws')
        sanic_app.add_route(self.getGui, self.base)
        sanic_app.add_route(self.download_logbook, self.base + '/logbook.csv')
        sanic_app.add_route(self.download_track, self.base + '/track.gpx')

    """csv download"""
    async def download_logbook(self, request):
        return await response.file(self.current.download_logbook(request))

    """gpx download"""
    async def download_track(self, request):
        return await response.file(self.current.download_track(request))

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
            self.log(name + ", " + json.dumps(value))

            result = dict()
            result["DateTime"] = str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
            result.update(value)

            await self.broadcast(json.dumps({"logline": result}))
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
    __current = None

    @property
    def current(self):
        # TODO rethink? gets checked every time self.current is used (and it is used A LOT)
        if self.__current is None:
            try:
                with open(self.dataPath + 'current', 'r') as csvfile:
                    lines = csvfile.readlines()
                self.load(lines[0])
            except Exception:
                pass

        return self.__current

    @current.setter
    def current(self, value):
        with open(self.dataPath + 'current', 'w') as csvfile:
            csvfile.write(value.get_name())
        self.__current = value

    """helper for changing the current logbook"""
    def load(self, logbookId):
        self.current = Logbook(logbookId)

    """create a new line in the logbook"""
    def log(self, message):
        return self.current.log(message)

    """delete the last logline
    
    currently unused. may eventually become capable of removing any logline
    """
    def undo(self, data):
        if data.startswith('undo'):
            self.current.undo(data)
            return "last entry has been removed"

    #########################################################################################
    # websocket stuff #######################################################################
    #########################################################################################

    """the websocket endpoint handler

    adds and removes websocket clients to the list of receivers.
    """
    async def feed(self, request, ws):
        self.clients.add(ws)

        try:
            async for command in ws:
                answer = await self.onReceiveCommand(command, ws)
                if answer:
                    await self.broadcast(answer)
        except:
            self.clients.remove(ws)

    """broadcast messages
    
    distributes answers to clients that are subscribed to the answer.
    """
    async def broadcast(self, data):
        for client in self.clients:
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
                return self.current.get_last()
            except:
                await ws.send('{"error": "noLogbook"}')
        elif "tail" in data.get("get"):
            try:
                raw = self.current.tail(5)
                for current in raw:
                    await ws.send(json.dumps({"logline": current}))
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
        entry = dict()
        entry["status"] = data.get("status")
        sepp = self.log("status, " + json.dumps(entry))

        logline = dict()
        logline["DateTime"] = sepp['DateTime']
        logline.update(entry)

        return json.dumps({"status": data.get("status"), "logline": logline})

    """command parser 'message'"""
    async def parse_message(self, data, ws):
        logline = self.log(data.get("message"))
        return json.dumps({"logline": logline})

    """command parser 'save'"""
    async def parse_save(self, data, ws):
        logbook = data.get("save")

        self.current = Logbook(0, logbook["title"], logbook["description"])

        return self.current.get_last()

    """command parser 'load'"""
    async def parse_load(self, data, ws):
        self.load(data.get("load"))
