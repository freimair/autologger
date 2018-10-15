from sanic import Sanic
from sanic.response import file
import csv
from datetime import datetime
import os

app = Sanic(__name__)


@app.route('/')
async def index(request):
    return await file('templates/main.html')

@app.websocket('/ws')
async def feed(request, ws):
    while True:
        command = await ws.recv()
        await server.onReceiveCommand(command)

class Server():
    async def onReceiveCommand(self, data):
        with open('logbook.csv', 'a') as csvfile:
            csvfile.write(str(datetime.now().strftime("%Y-%m-%d %H:%M:%S")) + "," + data + os.linesep)

server = Server()
        
app.static("/", "./statics")
app.run(host="0.0.0.0", port=8000, debug=True)
