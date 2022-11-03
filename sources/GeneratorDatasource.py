from random import random
import asyncio

class GeneratorDatasource:
    def __init__(self, type, min, max, delta, interval, router):
        self.type = type
        self.min = min
        self.max = max
        self.delta = delta
        self.interval = interval
        self.router = router
        self.value = round((max-min)*random() + min,2)

    async def arm(self):
        while True:
            self.value = round(min(self.max, max(self.min, self.value + (random()*2*self.delta-self.delta))),2)
            await self.router.incoming(self.type, self.value)
            await asyncio.sleep(self.interval)
