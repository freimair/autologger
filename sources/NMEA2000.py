import can
from collections import namedtuple
from datetime import datetime, timedelta
import math

Data = namedtuple("Data", ["name", "value"])


class NMEA2000:
    def __init__(self, router):
        self.PGNDecoders = {
            126992: self.parse126992,  # system date/time
            127245: self.parse127245,  # rudder
            127250: self.parse127250,  # vessel heading
            127251: self.parse127251,  # rate of turn
            127257: self.parse127257,  # attitude
            128259: self.parse128259,  # boat speed
            128267: self.parse128267,  # depth
            128275: self.parse128275,  # distance log
            129025: self.parse129025,  # lat/lon rapid
            129026: self.parse129026,  # CoG/SoG
            130306: self.parse130306,  # Wind speed
            130310: self.parse130310,  # outside environmental parameters
            130312: self.parse130312,  # temperature
        }

        self.router = router
        self.bus = can.interface.Bus(bustype='socketcan', channel='can0', bitrate=250000)

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
        # source = data[1] & 0xF
        days_since1970 = int.from_bytes(data[2:4], byteorder="little", signed=False)
        time_since_midnight = int.from_bytes(data[4:8], byteorder="little", signed=True) * 0.0001
        result = (datetime(1970, 1, 1, 0, 0, 0) + timedelta(days=days_since1970) + timedelta(seconds=time_since_midnight)).isoformat()
        return [Data("DateTime", result)]

    # rudder
    def parse127245(self, data):
        #  Instance=N2kMsg.GetByte(Index);
        #  RudderDirectionOrder=(tN2kRudderDirectionOrder)(N2kMsg.GetByte(Index)&0x7);
        #  AngleOrder=N2kMsg.Get2ByteDouble(0.0001,Index);
        #  RudderPosition=N2kMsg.Get2ByteDouble(0.0001,Index);
        # angle = int.from_bytes(data[2:4], byteorder="little", signed=True) * 0.0001
        # angle = int(angle / (2 * numpy.pi) * 360)
        position = int.from_bytes(data[4:6], byteorder="little", signed=True) * 0.0001
        position = int(position / (2 * math.pi) * 360)
        # return str(angle) + '°/' + str(position)  + '°'
        return [Data("Rudderangle", str(position))]

    # vessel heading
    def parse127250(self, data):
        #  SID=N2kMsg.GetByte(Index);
        #  Heading=N2kMsg.Get2ByteUDouble(0.0001,Index);
        #  Deviation=N2kMsg.Get2ByteDouble(0.0001,Index);
        #  Variation=N2kMsg.Get2ByteDouble(0.0001,Index);
        heading = int.from_bytes(data[1:3], byteorder="little", signed=False) * 0.0001
        heading = int(heading / (2 * math.pi) * 360)
        # deviation = int.from_bytes(data[3:5], byteorder="little", signed=True) * 0.0001
        # deviation = int(deviation / (2 * numpy.pi) * 360)
        # variation = int.from_bytes(data[5:7], byteorder="little", signed=True) * 0.0001
        # variation = int(variation / (2 * numpy.pi) * 360)
        # return str(heading) + '°/' + str(deviation) + "/" + str(variation)
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
        yaw = int(yaw / (2 * math.pi) * 360)
        pitch = int.from_bytes(data[3:5], byteorder="little", signed=True) * 0.0001
        pitch = int(pitch / (2 * math.pi) * 360)
        roll = int.from_bytes(data[5:7], byteorder="little", signed=True) * 0.0001
        roll = int(roll / (2 * math.pi) * 360)
        return [Data("Attitude", str(yaw) + "°/" + str(pitch) + "°/" + str(roll) + "°")]

    # boat speed
    def parse128259(self, data):
        #  SID=N2kMsg.GetByte(Index);
        #  WaterReferenced=N2kMsg.Get2ByteUDouble(0.01,Index);
        #  GroundReferenced=N2kMsg.Get2ByteUDouble(0.01,Index);
        #  SWRT=(tN2kSpeedWaterReferenceType)(N2kMsg.GetByte(Index)&0x0F);
        through_water = int.from_bytes(data[1:3], byteorder="little", signed=False) * 0.01
        through_water = '{:02.1f}'.format(through_water * 1.94384)
        over_ground = int.from_bytes(data[3:5], byteorder="little", signed=False) * 0.01
        over_ground = '{:02.1f}'.format(over_ground * 1.94384)
        return [Data("SpeedThroughWater", str(through_water)), Data("SoG", str(over_ground))]

    # depth
    def parse128267(self, data):
        #  SID=N2kMsg.GetByte(Index);
        #  DepthBelowTransducer=N2kMsg.Get4ByteUDouble(0.01,Index);
        #  Offset=N2kMsg.Get2ByteDouble(0.001,Index);
        #  Range=N2kMsg.Get1ByteUDouble(10,Index);
        depth = int.from_bytes(data[1:5], byteorder="little", signed=False) * 0.01
        offset = int.from_bytes(data[5:7], byteorder="little", signed=True) * 0.001
        # range = data[7] * 10
        return [Data("Depth", str(depth)), Data("DepthOffset", str(offset))]

    # distance log
    # is FastPacket message. i.e. multi-part!
    distanceLogAggregator = dict()

    def parse128275(self, data):
        #    DaysSince1970=N2kMsg.Get2ByteUInt(Index);
        #    SecondsSinceMidnight=N2kMsg.Get4ByteDouble(0.0001,Index);
        #    Log=N2kMsg.Get4ByteUDouble(1,Index);
        #    TripLog=N2kMsg.Get4ByteUDouble(1,Index);

        frame_counter = data[0] & 0b11111
        sequence_counter = data[0] & 0b11100000

        if frame_counter == 0:
            self.distanceLogAggregator.update({sequence_counter: [data]})
        else:
            self.distanceLogAggregator[sequence_counter].append(data)

        if frame_counter > 1:
            complete_frame = self.distanceLogAggregator[sequence_counter][1][1:] + self.distanceLogAggregator[sequence_counter][2][1:]

            log = int.from_bytes(complete_frame[0:4], byteorder="little", signed=False) / 1852
            # trip_log = int.from_bytes(complete_frame[4:8], byteorder="little", signed=False) / 1852
            del self.distanceLogAggregator[sequence_counter]

            return [Data("Log", '{:02.2f}'.format(log))]
        return []

    # lat/lon rapid
    def parse129025(self, data):
        #  Latitude=N2kMsg.Get4ByteDouble(1e-7, Index);
        #  Longitude=N2kMsg.Get4ByteDouble(1e-7, Index);
        lat = int.from_bytes(data[0:4], byteorder="little", signed=True) * 1e-7
        lon = int.from_bytes(data[4:], byteorder="little", signed=True) * 1e-7
        return [Data("Latitude", '{:02.7f}'.format(lat)), Data("Longitude", '{:02.7f}'.format(lon))]

    # CoG/SoG
    def parse129026(self, data):
        #  SID=N2kMsg.GetByte(Index);
        #  b=N2kMsg.GetByte(Index); ref=(tN2kHeadingReference)( b & 0x03 );
        #  COG=N2kMsg.Get2ByteUDouble(0.0001,Index);
        #  SOG=N2kMsg.Get2ByteUDouble(0.01,Index);
        cog = int.from_bytes(data[2:4], byteorder="little", signed=False) * 0.0001
        cog = int(cog / (2 * math.pi) * 360)
        sog = int.from_bytes(data[4:6], byteorder="little", signed=False) * 0.01
        sog = '{:02.1f}'.format(sog * 1.94384)
        return [Data("CoG", str(cog)), Data("SoG", str(sog))]

    # wind speed
    def parse130306(self, data):
        #  SID=N2kMsg.GetByte(Index);
        #  WindSpeed=N2kMsg.Get2ByteUDouble(0.01,Index);
        #  WindAngle=N2kMsg.Get2ByteUDouble(0.0001,Index);
        #  WindReference=(tN2kWindReference)(N2kMsg.GetByte(Index)&0x07);
        angle = int.from_bytes(data[3:5], byteorder="little", signed=False) * 0.0001
        angle = int(angle / (2 * math.pi) * 360)
        speed = int.from_bytes(data[1:3], byteorder="little", signed=False) * 0.01
        speed = '{:02.1f}'.format(speed * 1.94384)
        return [Data("Windspeed", str(speed)), Data("WindAngle", str(angle))]

    # outside environmental parameters
    def parse130310(self, data):
        #  SID=N2kMsg.GetByte(Index);
        #  WaterTemperature=N2kMsg.Get2ByteUDouble(0.01,Index);
        #  OutsideAmbientAirTemperature=N2kMsg.Get2ByteUDouble(0.01,Index);
        #  AtmosphericPressure=N2kMsg.Get2ByteUDouble(100,Index);
        water_temp = int.from_bytes(data[1:3], byteorder="little", signed=False) * 0.01
        air_temp = int.from_bytes(data[3:5], byteorder="little", signed=False) * 0.01
        atmospheric_pressure = int.from_bytes(data[5:7], byteorder="little", signed=False) * 100
        return [Data("OutsideEnvironmentalParameters", str(water_temp) + "/" + str(air_temp) + "/" + str(atmospheric_pressure))]

    # temperature
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
