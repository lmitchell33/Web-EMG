from flask import Flask, render_template
from flask_socketio import SocketIO
from threading import Thread
import time

# from sensor.sensor import Sensor
import random

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
# emg_sensor = Sensor(channel=0, bus=0, device=0, speed=1000000)

def emit_data():
    '''Emit data caputured by the sensor to the frontend through websockets'''
    while True: 
        try: 
            # muscle_activity = emg_sensor.read_muscle_activity()
            muscle_activity = random.uniform(0.0, 1.0)
            socketio.emit("emg_data", muscle_activity)
            time.sleep(0.08)
        except Exception as e:
            print(f"Error reading data: {e}")
            break

@app.route('/')
def index():
    return render_template('index.html')


# socketio endpoints
@socketio.on('connect')
def handle_connect():
    '''Handle the websocket connection from sensor to server'''
    print('Client connected')


@socketio.on('disconnect')
def handle_disconnect():
    '''Handle the websocket disconnection from sensor to server'''
    print("Client disconnected")


if __name__ == '__main__':
    # create a separate thread to capture data from the sensor and send it to the server,
    # I didn't want to block the server and I didn't to want it request based
    data_thread = Thread(target=emit_data, daemon=True)
    data_thread.start()

    try:
        socketio.run(app, debug=True, port=5000)
    finally:
        # emg_sensor.close()
        pass
