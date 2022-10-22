import serial
import asyncio

class MockDatasource:
    def __init__(self, source, interval, router):
        self.source = source
        self.interval = interval
        self.router = router

    async def arm(self):
        with open(self.source) as sourcefile:
            for line in sourcefile:
                tmp = line[:-1].split(',')
                await self.router.incoming(tmp[0], tmp[1])
                await asyncio.sleep(self.interval)
