import asyncio

class Recorder():

    def __init__(self):
        self.distance = 31
        self.interval = 3

    async def update(self):
        while True:
            #getGPS
            #write position to file (gpx?)
            #calculate distance
            #update self.distance
            self.distance = self.distance + 1
            print("distance updated to " + str(self.distance))
            #update reference position
            await asyncio.sleep(self.interval)

    def getDistanceTravelled(self):
        return self.distance;
