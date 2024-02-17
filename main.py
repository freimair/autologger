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

class Router:
    def __init__(self, app):
        self.sanic_app = app

        self.apps=[App(app)]
        self.sanic_app.add_route(self.getGuiRouter, "/")

    def arm(self, sources: list):
        for current in sources:
            app.add_task(current.arm())

    def getGuiRouter(self, request):
        return response.html(T("main.html").render(tools=self.apps))

    async def incoming(self, data1, data2):
        for current in self.apps:
            await current.incoming(data1, data2)

router = Router(app)

@app.after_server_start
async def after_server_start(app, loop):
    if(app.state.is_debug):
        windAccumulator = Accumulator(app, router, "telemetry")
        sources=[
                GeneratorDatasource("Windspeed", 0, 45, 1, 0.2, windAccumulator),
                GeneratorDatasource("WindAngle", 0, 360, 0.2, 0.2, windAccumulator),
                ReplayDatasource("20221021.logbook", 0.2, Accumulator(app, router, "telemetry")),
                ReplayDatasource("mockWeather1.csv", 4, Accumulator(app, router, "weather")),
            ]
    else:
        sources=[
            NMEA2000(Accumulator(app, router, "telemetry")),
            Weatherstation(Accumulator(app, router, "weather")),
        ]

    router.arm(sources)
        
app.static("/", "./statics")
if __name__ == "__main__":
    app.run(debug=True)
