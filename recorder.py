import asyncio
import serial
import geopy.distance

class Recorder():

    def __init__(self):
        self.distance = 0
        self.interval = 3
        self.serial = serial.Serial("/dev/ttyUSB0", 4800)
        self.old_position = (0, 0)
        self.tack = 0

    async def update(self):
        while True:
            #getGPS
            line = ['']
            while not line[0].endswith("$GPGGA"):
                line = str(self.serial.readline()).split(",")
            new_position = (float(line[2])/100, float(line[4])/100)

            #write position to file (gpx?)
            print(new_position)

            if 0 != self.old_position[0] and 0 != self.old_position[1]:
                #calculate distance
                self.tack = geopy.distance.vincenty(self.old_position, new_position).nm

                #update self.distance
                self.distance = self.distance + self.tack
                print("distance updated to " + str(self.distance))

            #update reference position
            self.old_position = new_position
            await asyncio.sleep(self.interval)

    def getDistanceTravelled(self):
        return float("{0:.2f}".format(round(self.distance,2)))
