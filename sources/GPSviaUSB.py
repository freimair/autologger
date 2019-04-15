import serial
import asyncio

class GPSviaUSB:
    def __init__(self, router):
        self.router = router
        self.serial = serial.Serial("/dev/ttyUSB0", 4800)

    async def arm(self):
        while True:
            #getGPS
            line = [''] * 7
            line[6] = '0'
            while not line[0].endswith("$GPGGA") or line[6] is '0':
                line = str(self.serial.readline()).split(",")

            await self.router.incoming("Latitude", str(int(line[2][0:2]) + float(line[2][2:])/60))
            await self.router.incoming("Longitude", str(int(line[4][0:3]) + float(line[4][3:])/60))
            await asyncio.sleep(2)
