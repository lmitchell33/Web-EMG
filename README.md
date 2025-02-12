# Muscle Monitoring Web Application

## **Overview**

This project implements a real-time muscle-monitoring system using a MyoWare 2.0 Muscle Sensor (EMG) interfaced with a Raspberry Pi 4B. The system is designed to measure muscle activity and plot the data on a localhost Python-Flask web application. The system leverages the pigpio library to access a Raspberry Pi's GPIO pins and to collect data. This data is continously sent in real-time to the frontend using WebSocket communication, where it is visualized using Chart.Js.

## **Built With**

- **Programming Languages:**: Python, JavaScript/HTML/CSS
- **Operating System**: Linux (Raspbian)
- **Sensor**: MyoWare 2.0 Muscle Sensor (found at: https://www.sparkfun.com/myoware-2-0-muscle-sensor.html?gad_source=1)
- **Device**: Raspberry Pi 4B

## **Getting Started**

Follow the steps below to install and setup the EMG system. The system uses a MyoWare 2.0 Muscle Sensor, however, in theory any sensor could be used.

### Installation

1. Clone the repo

```sh
git clone https://github.com/lmitchell33/Web-EMG.git && cd Web-EMG
```

2. Create a virutal environment to hold python libraries (only if using Raspberry Pi)

```sh
python3 -m venv .
```

3. Start the virtual environment

```sh
source bin/activeate
```

4. Install Python libraries

```sh
pip install -r requirements.txt
```

## Usage

1. Connect the sensor to the raspberry pi

Show an schematic of the connections (and possibly an image of ur connections)

2. Connect EMG snap leads to the sensor

Show an image of the snap leads connected to the sensor

3. Connect the leads to a body part.

Show an image of the sensor/leads connected to the body part

4. Start the pigpio daemon

```sh
sudo pigpiod
```

5. Start the web application

```sh
python3 app.py
```

6. Visit the web application (localhost:5000)

Show an image of the localhost web application and its URL

7. Enjoy the show

Lol enjoy the show

## **Collaborators**

- Lucas Mitchell
