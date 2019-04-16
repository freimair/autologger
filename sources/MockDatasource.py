import serial
import asyncio

class MockDatasource:
    def __init__(self, router):
        self.router = router

    async def arm(self):
        with open("mocktrip1.csv") as sourcefile:
            for line in sourcefile:
                tmp = line[:-1].split(',')
                await self.router.incoming(tmp[0], tmp[1])
                await asyncio.sleep(0.1)
