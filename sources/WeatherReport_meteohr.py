import requests
import re
import base64

class WeatherReport:

    text = 'https://meteo.hr/prognoze_e.php?section=prognoze_specp&param=jadran&el=jadran_e'
     # 03, 06, ..., 15  - forcast for xxh after report update
    images = 'https://prognoza.hr/nauticari/uvgst_sr_jadran_#REPLACE#_e.png'


    def __init__(self, router):
        self.router = router

    async def arm(self):
        WeatherReport.fetchWeather()

    @classmethod
    def fetchWeather(cls):
        result = ""
        r = requests.get(cls.text)
        
        x = re.search(r"<section id=\"main-content\".*?<\/section>", r.text, re.DOTALL)
        result = x.group()

        result += "<br />";

        for index in ["{:0>2d}".format(i) for i in range(13) if 0 == i % 3]:
            r = requests.get(cls.images.replace("#REPLACE#", index), stream = True)
            seppi = base64.b64encode(r.content).decode("ascii")
            result += '<img src="data:image/png;base64,' + seppi + '" />'

        return result