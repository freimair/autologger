from sanic import Sanic
from sanic import response
from utils import T
from apps.logbook.App import App
from apps.logbook.Accumulator import Accumulator
from sources.GPSviaUSB import GPSviaUSB
from sources.NMEA2000 import NMEA2000
from sources.Weatherstation import  Weatherstation
from sources.ReplayDatasource import ReplayDatasource
from sources.GeneratorDatasource import GeneratorDatasource
from sources.WeatherReport_meteohr import WeatherReport


app = Sanic(__name__)


@app.route('/')
async def index(request):
    return response.html(router.getGui())

class Router:
    def __init__(self, app):
        #self.sources=[ReplayDatasource("mocktrip1.csv", 0.1, Accumulator(app, self, "telemetry")),
        #              ReplayDatasource("mockWeather1.csv", 4, Accumulator(app, self, "weather"))]
        self.sources=[]
        #windAccumulator = Accumulator(app, self, "telemetry")
        #self.sources=[GeneratorDatasource("Windspeed", 0, 45, 1, 0.2, windAccumulator),
        #              GeneratorDatasource("WindAngle", 0, 360, 0.2, 0.2, windAccumulator),
        #              ReplayDatasource("20221021.logbook", 0.2, Accumulator(app, self, "telemetry"))]
        for current in self.sources:
            app.add_task(current.arm())

        self.apps=[App(app)]

    def getGui(self):
        return T("main.html").render(tools=self.apps)

    async def incoming(self, data1, data2):
        for current in self.apps:
            await current.incoming(data1, data2)

router = Router(app)
        
app.static("/", "./statics")
if __name__ == "__main__":
    app.run(debug=True)
