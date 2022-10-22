import asyncio
import json

class Accumulator:

    """the logbook state"""
    snapshot = dict()

    def __init__(self, sanic_app, router):
        self.router = router

        sanic_app.add_task(self.timer())

    async def incoming(self, name, value):
        self.snapshot.update({name: value})

    async def timer(self):
        while True:
            await asyncio.sleep(5)
            await self.router.incoming("telemetry", self.snapshot)