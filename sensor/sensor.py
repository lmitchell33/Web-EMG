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
    intervals while also providing less processing overhead. 
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

        # Ensure the daemon is running
        if not self.rpi.connected:
            raise Exception("Failed to connect to GPIO pins")
        
        # set the pin to only intake voltage 
        self.rpi.set_mode(self.pin, pigpio.INPUT)
        

    def read_muscle_data(self):
        '''Get muscle activity data from the sensor
        Returns:
            pigpio.read {int} -- The value read from the sensor
        '''
        return self.rpi.read(self.pin) * 1024
    

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
        print("Closing sensor and stopping the pigpio daemon...")
    finally:
        sensor.close()

