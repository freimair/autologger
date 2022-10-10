from RF24 import RF24, rf24_datarate_e
import OPi.GPIO as GPIO
import asyncio


class Weatherstation:
    compensationData1 = None
    compensationData2 = None

    def __init__(self, router):
        self.router = router
        self.radio = RF24(7, 10)

    async def arm(self):
        # setup interrupt
        GPIO.setmode(GPIO.SUNXI)
        GPIO.setup("PA12", GPIO.IN)

        # setup radio
        self.radio.begin()
        self.radio.setChannel(2)
        self.radio.setDataRate(rf24_datarate_e.RF24_2MBPS)
        self.radio.enableDynamicPayloads()
        self.radio.enableDynamicAck()
        self.radio.enableAckPayload()
        self.radio.printDetails()

        self.radio.powerUp()
        self.radio.openReadingPipe(0, 0xe7e7e7e7e7)
        self.radio.startListening()

        self.loop = asyncio.get_running_loop()

        GPIO.add_event_detect("PA12", GPIO.FALLING, callback=self.my_callback, bouncetime=200)

    def my_callback(self, channel):
        measurement = None

        self.radio.whatHappened() # resets the IRQ pin to HIGH
        while not self.radio.available():
            time.sleep(1/100)

        size = self.radio.getDynamicPayloadSize()
        result = self.radio.read(size)
        if size == 8:
            measurement = result
        elif size == 26:
            self.compensationData1 = result
        elif size == 7:
            self.compensationData2 = result
        else:
            print("got something we do not know what it is...")

        if self.compensationData2 is None and self.compensationData1 is None:
            # ask for compensation data
            self.radio.writeAckPayload(0,b'c')
        elif measurement is not None:
            # float in Python is double precision
            comp_T1 = float(int.from_bytes(self.compensationData1[0:2], byteorder='little'))
            comp_T2 = float(int.from_bytes(self.compensationData1[2:4], byteorder='little', signed=True))
            comp_T3 = float(int.from_bytes(self.compensationData1[4:6], byteorder='little', signed=True))
            UT = float(int.from_bytes(measurement[3:6], byteorder='big') >> 4)
            var1 = (UT / 16384.0 - comp_T1 / 1024.0) * comp_T2
            var2 = ((UT / 131072.0 - comp_T1 / 8192.0) * (UT / 131072.0 - comp_T1 / 8192.0)) * comp_T3
            tfine = var1 + var2
            temp = (var1 + var2) / 5120.0
            self.loop.call_soon_threadsafe(asyncio.create_task, self.router.incoming("AirTemperature", '{:02.1f}'.format(temp)))

            UP = float(int.from_bytes(measurement[0:3], byteorder='big') >> 4)
            comp_P1 = float(int.from_bytes(self.compensationData1[6:8], byteorder='little'))
            comp_P2 = float(int.from_bytes(self.compensationData1[8:10], byteorder='little', signed=True))
            comp_P3 = float(int.from_bytes(self.compensationData1[10:12], byteorder='little', signed=True))
            comp_P4 = float(int.from_bytes(self.compensationData1[12:14], byteorder='little', signed=True))
            comp_P5 = float(int.from_bytes(self.compensationData1[14:16], byteorder='little', signed=True))
            comp_P6 = float(int.from_bytes(self.compensationData1[16:18], byteorder='little', signed=True))
            comp_P7 = float(int.from_bytes(self.compensationData1[18:20], byteorder='little', signed=True))
            comp_P8 = float(int.from_bytes(self.compensationData1[20:22], byteorder='little', signed=True))
            comp_P9 = float(int.from_bytes(self.compensationData1[22:24], byteorder='little', signed=True))
            var1 = tfine/2.0 - 64000.0
            var2 = var1 * var1 * comp_P6 / 32768.0
            var2 = var2 + var1 * comp_P5 * 2.0
            var2 = var2/4.0 + comp_P4 * 65536.0
            var1 = (comp_P3 * var1 * var1 / 524288.0 + comp_P2 * var1) / 524288.0
            var1 = (1.0 + var1 / 32768.0) * comp_P1
            if var1 != 0.0:
                p = 1048576.0 - UP
                p = (p - (var2 / 4096.0)) * 6250.0 / var1
                var1 = comp_P9 * p * p / 2147483648.0
                var2 = p * comp_P8 / 32768.0
                p = p + (var1 + var2 + comp_P7) / 16.0
            self.loop.call_soon_threadsafe(asyncio.create_task, self.router.incoming("AirPressure", '{:02.1f}'.format(p)))

            UH = float(int.from_bytes(measurement[6:8], byteorder='big'))
            comp_H1 = float(self.compensationData1[25])
            comp_H2 = float(int.from_bytes(self.compensationData2[0:2], byteorder='little', signed=True))
            comp_H3 = float(self.compensationData2[2])
            comp_H4 = float((self.compensationData2[3] << 4) | (self.compensationData2[4] & 0x0F))
            comp_H5 = float((self.compensationData2[5] << 4) | (self.compensationData2[4] >> 4 & 0x0F))
            comp_H6 = float(self.compensationData2[6])
            var1 = tfine - 76800.0
            var1 = (UH - (comp_H4 * 64.0 + comp_H5 / 16384.0 * var1)) * (comp_H2 / 65536.0 * (1.0 + comp_H6 / 67108864.0 * var1 * (1.0 + comp_H3 / 67108864.0 * var1)))
            h = var1 * (1.0 - comp_H1 * var1 / 524288.0)
            if h > 100:
                h = 100.0
            elif h < 0:
                h = 0.0
            self.loop.call_soon_threadsafe(asyncio.create_task, self.router.incoming("Humidity", '{:02.1f}'.format(h)))
