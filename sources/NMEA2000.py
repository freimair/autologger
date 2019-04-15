import can
from can.interface import Bus
from collections import namedtuple

Data = namedtuple("Data", ["name", "value"])

class NMEA2000:
    def __init__(self, router):
        self.PGNDecoders = {
            126992: self.parse126992, # system date/time
            127245: self.parse127245, # rudder
            127250: self.parse127250, # vessel heading
            127251: self.parse127251, # rate of turn
            127257: self.parse127257, # attitude
            128259: self.parse128259, # boat speed
            128267: self.parse128267, # depth
            129025: self.parse129025, # lat/lon rapid
            129026: self.parse129026, # CoG/SoG
            130306: self.parse130306, # Wind speed
            130310: self.parse130310, # outside environmental parameters
            130312: self.parse130312, # temperature
        }

        self.router = router
        self.bus = Bus(bustype='socketcan', channel='can0', bitrate=250000)

    async def arm(self):
        while True:
            message = self.bus.recv()

            # decode PGN
            pgn = message.arbitration_id >> 8 & 0x1FFFF
            if (pgn >> 8) & 0x0FF < 0xF0:
                pgn = pgn & 0xFFFF00

            # decode values
            values = self.PGNDecoders.get(pgn, lambda data: "not implemented yet")(message.data)

            for current in values:
                await self.router.incoming(current.name, current.value)

    # system date time
    def parse126992(self, data):
    #  SID=N2kMsg.GetByte(Index);
    #  TimeSource=(tN2kTimeSource)(N2kMsg.GetByte(Index) & 0x0f);
    #  SystemDate=N2kMsg.Get2ByteUInt(Index);
    #  SystemTime=N2kMsg.Get4ByteDouble(0.0001,Index);
        source = data[1] & 0xF
        daysSince1970 = int.from_bytes(data[2:4], byteorder="little", signed=False)
        timeSinceMidnight = int.from_bytes(data[4:8], byteorder="little", signed=True) * 0.0001
        result = (datetime(1970,1,1,0,0,0) + timedelta(days=daysSince1970) + timedelta(seconds=timeSinceMidnight)).isoformat()
        return [Data("DateTime", result)]

    # rudder
    def parse127245(self, data):
    #  Instance=N2kMsg.GetByte(Index);
    #  RudderDirectionOrder=(tN2kRudderDirectionOrder)(N2kMsg.GetByte(Index)&0x7);
    #  AngleOrder=N2kMsg.Get2ByteDouble(0.0001,Index);
    #  RudderPosition=N2kMsg.Get2ByteDouble(0.0001,Index);
        angle = int.from_bytes(data[2:4], byteorder="little", signed=True) * 0.0001
        angle = int(angle / (2 * numpy.pi) * 360)
        position = int.from_bytes(data[4:6], byteorder="little", signed=True) * 0.0001
        position = int(position / (2 * numpy.pi) * 360)
        #return str(angle) + '°/' + str(position)  + '°'
        return [Data("Rudderangle", str(position))]

    # vessel heading
    def parse127250(self, data):
    #  SID=N2kMsg.GetByte(Index);
    #  Heading=N2kMsg.Get2ByteUDouble(0.0001,Index);
    #  Deviation=N2kMsg.Get2ByteDouble(0.0001,Index);
    #  Variation=N2kMsg.Get2ByteDouble(0.0001,Index);
        heading = int.from_bytes(data[1:3], byteorder="little", signed=False) * 0.0001
        heading = int(heading / (2 * numpy.pi) * 360)
        deviation = int.from_bytes(data[3:5], byteorder="little", signed=True) * 0.0001
        deviation = int(deviation / (2 * numpy.pi) * 360)
        variation = int.from_bytes(data[5:7], byteorder="little", signed=True) * 0.0001
        variation = int(variation / (2 * numpy.pi) * 360)
        #return str(heading) + '°/' + str(deviation) + "/" + str(variation)
        return [Data("Heading", str(heading))]

    # rate of turn
    def parse127251(self, data):
    #  RateOfTurn=N2kMsg.Get4ByteDouble(((1e-3/32.0) * 0.0001),Index);
        rate = int.from_bytes(data[0:4], byteorder="little", signed=True) * (1e-3/32.0) * 0.0001
        return [Data("RateOfTurn", str(rate))]

    # attitude
    def parse127257(self, data):
    #  SID=N2kMsg.GetByte(Index);
    #  Yaw=N2kMsg.Get2ByteDouble(0.0001,Index);
    #  Pitch=N2kMsg.Get2ByteDouble(0.0001,Index);
    #  Roll=N2kMsg.Get2ByteDouble(0.0001,Index);
        yaw = int.from_bytes(data[1:3], byteorder="little", signed=True) * 0.0001
        yaw = int(yaw / (2 * numpy.pi) * 360)
        pitch = int.from_bytes(data[3:5], byteorder="little", signed=True) * 0.0001
        pitch = int(pitch / (2 * numpy.pi) * 360)
        roll = int.from_bytes(data[5:7], byteorder="little", signed=True) * 0.0001
        roll = int(roll / (2 * numpy.pi) * 360)
        return [Data("Attitude", str(yaw) + "°/" + str(pitch) + "°/" + str(roll) + "°")]

    # boat speed
    def parse128259(self, data):
    #  SID=N2kMsg.GetByte(Index);
    #  WaterReferenced=N2kMsg.Get2ByteUDouble(0.01,Index);
    #  GroundReferenced=N2kMsg.Get2ByteUDouble(0.01,Index);
    #  SWRT=(tN2kSpeedWaterReferenceType)(N2kMsg.GetByte(Index)&0x0F);
        throughWater = int.from_bytes(data[1:3], byteorder="little", signed=False) * 0.01
        throughWater = '{:02.1f}'.format(throughWater * 1.94384)
        overGround = int.from_bytes(data[3:5], byteorder="little", signed=False) * 0.01
        overGround = '{:02.1f}'.format(overGround * 1.94384)
        return [Data("SpeedThroughWater", str(throughWater)), Data("SoG", str(overGround))]

    # depth
    def parse128267(self, data):
    #  SID=N2kMsg.GetByte(Index);
    #  DepthBelowTransducer=N2kMsg.Get4ByteUDouble(0.01,Index);
    #  Offset=N2kMsg.Get2ByteDouble(0.001,Index);
    #  Range=N2kMsg.Get1ByteUDouble(10,Index);
        depth = int.from_bytes(data[1:5], byteorder="little", signed=False) * 0.01
        offset = int.from_bytes(data[5:7], byteorder="little", signed=True) * 0.001
        Range = data[7] * 10
        return [Data("Depth", str(depth)), Data("DepthOffset", str(offset))]

    # lat/lon rapid
    def parse129025(self, data):
    #	Latitude=N2kMsg.Get4ByteDouble(1e-7, Index);
    #	Longitude=N2kMsg.Get4ByteDouble(1e-7, Index);
        lat = int.from_bytes(data[0:4], byteorder="little", signed=True) * 1e-7
        lon = int.from_bytes(data[4:], byteorder="little", signed=True) * 1e-7
        return [Data("Latitude", '{:02.7f}'.format(lat)), Data("Longitude", '{:02.7f}'.format(lon))]

    # CoG/SoG
    def parse129026(self, data):
    #  SID=N2kMsg.GetByte(Index);
    #  b=N2kMsg.GetByte(Index); ref=(tN2kHeadingReference)( b & 0x03 );
    #  COG=N2kMsg.Get2ByteUDouble(0.0001,Index);
    #  SOG=N2kMsg.Get2ByteUDouble(0.01,Index);
        CoG = int.from_bytes(data[2:4], byteorder="little", signed=False) * 0.0001
        CoG = int(CoG / (2 * numpy.pi) * 360)
        SoG = int.from_bytes(data[4:6], byteorder="little", signed=False) * 0.01
        SoG = '{:02.1f}'.format(SoG * 1.94384)
        return [Data("CoG", str(CoG)), Data("SoG", str(SoG))]

    # wind speed
    def parse130306(self, data):
    #  SID=N2kMsg.GetByte(Index);
    #  WindSpeed=N2kMsg.Get2ByteUDouble(0.01,Index);
    #  WindAngle=N2kMsg.Get2ByteUDouble(0.0001,Index);
    #  WindReference=(tN2kWindReference)(N2kMsg.GetByte(Index)&0x07);
        angle = int.from_bytes(data[3:5], byteorder="little", signed=False) * 0.0001
        angle = int(angle / (2 * numpy.pi) * 360)
        speed = int.from_bytes(data[1:3], byteorder="little", signed=False) * 0.01
        speed = '{:02.1f}'.format(speed * 1.94384)
        return [Data("Windspeed", str(speed)), Data("WindAngle", str(angle))]

    # outside environmental parameters
    def parse130310(self, data):
    #  SID=N2kMsg.GetByte(Index);
    #  WaterTemperature=N2kMsg.Get2ByteUDouble(0.01,Index);
    #  OutsideAmbientAirTemperature=N2kMsg.Get2ByteUDouble(0.01,Index);
    #  AtmosphericPressure=N2kMsg.Get2ByteUDouble(100,Index);
        waterTemp = int.from_bytes(data[1:3], byteorder="little", signed=False) * 0.01
        airTemp = int.from_bytes(data[3:5], byteorder="little", signed=False) * 0.01
        atmosphericPressure = int.from_bytes(data[5:7], byteorder="little", signed=False) * 100
        return [Data("OutsideEnvironmentalParameters", str(waterTemp) + "/" + str(airTemp) + "/" + str(atmosphericPressure))]

    # temperatur
    def parse130312(self, data):
    #  SID=N2kMsg.GetByte(Index);
    #  TempInstance=N2kMsg.GetByte(Index);
    #  TempSource=(tN2kTempSource)(N2kMsg.GetByte(Index));
    #  ActualTemperature=N2kMsg.Get2ByteUDouble(0.01,Index);
    #  SetTemperature=N2kMsg.Get2ByteUDouble(0.01,Index);
        instance = data[1]
        source = data[2]
        temp = int.from_bytes(data[3:5], byteorder="little", signed=False) * 0.01
        settemp = int.from_bytes(data[5:7], byteorder="little", signed=False) * 0.01
        return [Data("Temperature", str(instance) + "/" + str(source) + "/" + str(temp) + "/" + str(settemp))]
