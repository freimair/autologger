from sanic import Sanic
from sanic import response
from utils import T
from apps.logbook.App import App
from sources.GPSviaUSB import GPSviaUSB
from sources.NMEA2000 import NMEA2000
from sources.Weatherstation import  Weatherstation
from sources.MockDatasource import MockDatasource


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
        self.sources=[MockDatasource(self)]
        for current in self.sources:
            app.add_task(current.arm())

        self.apps=[App(app)]

    def getGui(self):
        return T("main.html").render(tools=self.apps)

    async def incoming(self, data1, data2):
        for current in self.apps:
            await current.incoming(data1, data2)

    async def onReceiveCommand(self, data):
        pass

router = Router(app)
        
app.static("/", "./statics")
app.run(host="0.0.0.0", port=8000, debug=True)
