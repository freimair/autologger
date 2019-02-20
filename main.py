from sanic import Sanic
from sanic import response
from utils import T
from apps.logbook import Logbook
from sources.GPSviaUSB import GPSviaUSB


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
        self.sources=[GPSviaUSB(self)]
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

router = Router(app)
        
app.static("/", "./statics")
app.run(host="0.0.0.0", port=8000, debug=True)
