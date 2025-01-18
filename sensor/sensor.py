import time
import pigpio

class Sensor:
    '''Class to handle the muscle MyoWare 2.0 muscle sensor data
    
    This class was developed using the MyoWare 2.0 muscle sensor from Adafruit
    The data is coming from the ENV pin of the sensor, meaning the signals is 
    rectified and smoothed. If you choose to use the RAW or RECT pins, you must
    recitify or smooth the signal while processing.

    The pigpio library was used because it uses hardware timed sampling rather than
    software based timing. This allows for slightly more precise timing and sampling
    intervals. The library also runs as a background process which is important becuase
    the web app and sensor are running on the same machine. 
    '''

    def __init__(self, pin):
        '''Initialize the sensor with on the given pin
        Args:
            pin {int} -- GPIO pin number used to read data from the sensor
        Kwargs:
            None
        '''

        self.pin = pin

        self.rpi = pigpio.pi()
        if not self.rpi.connected:
            raise Exception("Failed to connect to GPIO pins")
        
        self.rpi.set_mode(self.pin, pigpio.INPUT)
        

    def read_muscle_data(self):
        '''Get muscle activity data from the sensor
        Returns:
            pigpio.read {int} -- The value read from the sensor
        '''
        return self.rpi.read(self.pin)
    

    def close(self):
        '''Clean up the resources used by pigpio'''
        self.rpi.stop()


if __name__ == "__main__":
    sensor = Sensor(pin=17)

    try:    
        while True: 
            muscle_activity = sensor.read_muscle_data()
            print(f"Muscle activity: {muscle_activity}")
            time.sleep(0.02) # read at 50 Hz
    except KeyboardInterrupt:
        # just to ensure the sensor is properly disconnected
        pass
    finally:
        sensor.close()

