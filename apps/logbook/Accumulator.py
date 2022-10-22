import asyncio
import json

class Accumulator:

    def __init__(self, sanic_app, router, prefix):
        self.router = router
        self.prefix = prefix
        self.snapshot = dict()

        sanic_app.add_task(self.timer())

    async def incoming(self, name, value):
        self.snapshot.update({name: value})

    async def timer(self):
        while True:
            await asyncio.sleep(5)
            await self.router.incoming(self.prefix, self.snapshot)
