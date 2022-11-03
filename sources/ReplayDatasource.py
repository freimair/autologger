import json
import asyncio

class ReplayDatasource:
    def __init__(self, source, interval, router):
        self.source = source
        self.interval = interval
        self.router = router

    async def arm(self):
        with open(self.source) as sourcefile:
            for line in sourcefile:
                if(self.source.endswith(".logbook")):
                    tmp = json.JSONDecoder().decode(line)
                    for name, value in tmp.items():
                        if("DateTime" == name):
                            continue
                        await self.router.incoming(name, value)
                        await asyncio.sleep(0.1)
                else:
                    tmp = line[:-1].split(',')
                    await self.router.incoming(tmp[0], tmp[1])
                await asyncio.sleep(self.interval)
