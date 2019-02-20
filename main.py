from sanic import Sanic
from sanic import response
import serial
import asyncio
from utils import T
from logbook import Logbook


app = Sanic(__name__)


@app.route('/')
async def index(request):
    return response.html(router.getGui())

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

        self.apps=[Logbook(app)]

    def getGui(self):
        return T("main.html").render(tools=self.apps)

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

router = Router(app)
        
app.static("/", "./statics")
app.run(host="0.0.0.0", port=8000, debug=True)
