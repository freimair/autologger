from sanic import Sanic
from sanic.response import file
import csv
from datetime import datetime
import os
from recorder import Recorder


app = Sanic(__name__)


@app.route('/')
async def index(request):
    return await file('templates/main.html')

@app.route('/logbook')
async def index(request):
    return await file('logbook.csv')

@app.websocket('/ws')
async def feed(request, ws):
    while True:
        command = await ws.recv()
        answer = await server.onReceiveCommand(command)
        if answer:
            await ws.send(answer)

class Server():

    def __init__(self):
        self.recorder = Recorder()

    async def onReceiveCommand(self, data):
        # assemble log line
        logline = str(datetime.now().strftime("%Y-%m-%d %H:%M:%S")) + ","
        logline += str(self.recorder.getDistanceTravelled()) + ","
        logline += str(self.recorder.getCurrentSpeed()) + ","
        logline += data

        with open('logbook.csv', 'a') as csvfile:
            csvfile.write(logline + os.linesep)

        return logline

server = Server()
app.add_task(server.recorder.update())
        
app.static("/", "./statics")
app.run(host="0.0.0.0", port=8000, debug=True)
