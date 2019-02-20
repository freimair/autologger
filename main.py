from sanic import Sanic
from sanic.response import file
import csv
import serial
from datetime import datetime
import os
import asyncio
from recorder import Recorder


app = Sanic(__name__)


@app.route('/')
async def index(request):
    return await file('templates/main.html')

@app.route('/logbook.csv')
async def index(request):
    return await file('logbook.csv')

@app.route('/track.gpx')
async def index(request):
    return await file('track.gpx')

@app.websocket('/ws')
async def feed(request, ws):
    while True:
        command = await ws.recv()
        answer = await router.onReceiveCommand(command)
        if answer:
            await ws.send(answer)

class Router:
    def __init__(self, app):
        self.sources=[DataSource(self)]
        for current in self.sources:
            app.add_task(current.arm())

        self.apps=[Server()]

    async def incoming(self, data):
        for current in self.apps:
            await current.incoming(data)

    async def onReceiveCommand(self, data):
        pass

class DataSource:
    def __init__(self, router):
        self.router = router
        self.serial = serial.Serial("/dev/ttyUSB0", 4800)

    async def arm(self):
        while True:
            #getGPS
            line = ['']
            while not line[0].endswith("$GPGGA"):
                line = str(self.serial.readline()).split(",")
            new_position = (int(line[2][0:2]) + float(line[2][2:])/60, int(line[4][0:3]) + float(line[4][3:])/60)
            await self.router.incoming([new_position, float(line[1])])
            await asyncio.sleep(2)

class Server():

    def __init__(self):
        with open('logbook.csv', 'r') as csvfile:
            lines = csvfile.readlines()

        self.recorder = Recorder()
        self.recorder.distance = float(lines[-1].split(',')[1])

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
        logline = str(datetime.now().strftime("%Y-%m-%d %H:%M:%S")) + ","
        logline += str(self.recorder.getDistanceTravelled()) + ","
        logline += str(self.recorder.getCurrentSpeed()) + ","
        logline += str(self.recorder.getCourseOverGround()) + ","
        logline += data

        with open('logbook.csv', 'a') as csvfile:
            csvfile.write(logline + os.linesep)

        return logline

router = Router(app)
        
app.static("/", "./statics")
app.run(host="0.0.0.0", port=8000, debug=True)
