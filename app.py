from flask import Flask, render_template
from flask_socketio import SocketIO
from threading import Thread
import time

# from sensor.sensor import Sensor
import random

# initalize the flask app, socketio server, and the emg sensor
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
# emg_sensor = Sensor(pin=17)

def emit_data():
    '''Emit data caputured by the sensor to the frontend through websockets'''
    while True: 
        try: 
            val = random.randint(1, 10)
            # muscle_activity = emg_sensor.read_muscle_data()
            socketio.emit("emg_data", val)
            time.sleep(0.02) # read at 50 Hz
        except Exception as e:
            print(f"Error reading data: {e}")
            break

@app.route('/')
def index():
    '''Render index.html and send it to the frontend, routing it to http://localhost:5000/'''
    return render_template('index.html')


# socketio endpoints
@socketio.on('connect')
def handle_connect():
    '''Handle the websocket connection of the sensor to the server'''
    print('Client connected')


@socketio.on('disconnect')
def handle_disconnect():
    '''Handle the websocket disconnection of the sensor to the server'''
    print("Client disconnected")


if __name__ == '__main__':
    # create a separate thread to capture data from the sensor and send it to the server
    data_thread = Thread(target=emit_data, daemon=True)
    data_thread.start()

    try:
        socketio.run(app, debug=True, port=5000)
    finally:
        # Stop the pigpio daemon
        # emg_sensor.close()
        pass
