# Muscle Monitoring Web Application

## **Overview**

This project implements a real-time muscle-monitoring system using a MyoWare 2.0 Muscle Sensor (EMG) interfaced with a Raspberry Pi 4B. The system is designed to measure muscle activity and plot the data on a localhost Python-Flask web application. The system leverages the spidev library to interface with the muscle sensor using the raspberry pi. This data is continously sent in real-time to the frontend using WebSocket communication, where it is visualized using Chart.Js.

## **Built With**

- **Programming Languages:**: Python, JavaScript/HTML/CSS
- **Operating System**: Linux (Raspbian)
- **Sensor**: MyoWare 2.0 Muscle Sensor (https://www.sparkfun.com/myoware-2-0-muscle-sensor.html?gad_source=1)
- **Device**: Raspberry Pi 4B

## **Getting Started**

Follow the steps below to install and setup the EMG system. The system uses a MyoWare 2.0 Muscle Sensor, however, in theory any sensor could be used.

### Usage

1. Clone the repo

```sh
git clone https://github.com/lmitchell33/Web-EMG.git && cd Web-EMG
```

2. Create a virutal environment (required if using Raspberry Pi)

```sh
python3 -m venv venv
```

3. Start the virtual environment

```sh
source venv/bin/activate
```

4. Install Python libraries

```sh
pip install -r requirements.txt
```

5. Wire the application

```
add a schematic here
```

6. Start the application

```sh
python3 app.py
```

## **Collaborators**

- Lucas Mitchell
