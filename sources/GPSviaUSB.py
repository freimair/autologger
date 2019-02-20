import serial
import asyncio

class GPSviaUSB:
    def __init__(self, router):
        self.router = router
        self.serial = serial.Serial("/dev/ttyUSB0", 4800)

    async def arm(self):
        while True:
            #getGPS
            line = ['']
            while not line[0].endswith("$GPGGA"):
                line = str(self.serial.readline()).split(",")
            new_position = (int(line[2][0:2]) + float(line[2][2:])/60, int(line[4][0:3]) + float(line[4][3:])/60)
            await self.router.incoming([new_position, float(line[1])])
            await asyncio.sleep(2)
