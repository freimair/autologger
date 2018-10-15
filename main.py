from sanic import Sanic
from sanic.response import file

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
        print(data)
        
server = Server()
        
app.static("/", "./statics")
app.run(host="0.0.0.0", port=8000, debug=True)
