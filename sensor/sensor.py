import time
from spidev import SpiDev

class Sensor:
    '''Class to handle the muscle MyoWare 2.0 muscle sensor data
    
    This class was developed using the MyoWare 2.0 muscle sensor from Adafruit
    The data is coming from the ENV pin of the sensor, meaning the signals is 
    rectified and smoothed. If you choose to use the RAW or RECT pins, you must
    recitify or smooth the signal while processing. This class was also implemented
    under the assumption that the ADC being used is the 10-bit MCP3008 chip

    source code for the spidev library: github.com/doceme/py-spidev
    '''

    def __init__(self, channel=0, bus=0, device=0, speed=1000000):
        '''Initialize the sensor with on the given pin
        Args:
            channel {int}: the analog input channel on the ADC (MCP3008 in this case) to read from, default is 0.
            bus {int}: The SPI bus number, default is 0
            device {int}: The SPI device (CS line), default is 0 (CE0 which is GPIO 8)
            speed {int}: SPI clock speed in Hz
            vref {float}: The reference votlage the ADC is uing 
        '''

        self._channel = channel
        self._spi = SpiDev()
        self._spi.open(bus, device) # maps to /dev/spidevbus.device
        self._spi.max_speed_hz = speed


    def _read_raw_data(self):
        '''Get muscle activity data from the sensor'''
        r = self._spi.xfer2([1, (8 + self._channel) << 4, 0])
        data = ((r[1] & 3) << 8) + r[2]
        return data

    
    def read_muscle_activity(self):
        '''Returns the normalized raw data from the EMG sensor to a value between 0 and 1'''
        # assuming we are using a 10-bit (1023) ADC
        return self._read_raw_data() / 1023


    def close(self):
        '''Clean up the resources used by pigpio'''
        self._spi.close()


if __name__ == "__main__":
    sensor = Sensor(channel=0, bus=0, device=0, speed=1000000)

    try:
        while True: 
            muscle_activity = sensor.read_muscle_activity()
            print(f"Muscle activity: {muscle_activity}")
            time.sleep(0.02) 
    finally:
        sensor.close()
