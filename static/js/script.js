class ChartManager {
    constructor(maxDataPoints) {
        this.maxDataPoints = maxDataPoints;
        this.canvas = document.getElementById('emgChart').getContext('2d');
        
        // Treat these two arrays as a deque where we can only add to the right side
        // and remove from the left side, when the deque is full
        this.emgData = [];
        this.labels = [];

        this.peakValue = 0;
        this.sum = 0;
        this.totalPoints = 0;
        this.chart = this._createChart();
    }

    // create the chart using the Chart.js library
    _createChart() {
        return new Chart(this.canvas, {
            type: 'line',
            data: {
                labels: this.labels,
                datasets: [{
                    label: 'EMG Signal',
                    data: this.emgData,
                    borderColor: '#4299e1', // blue
                    borderWidth: 1,
                    fill: false,
                    tension: 0.4,
                    spanGaps: true  // Connect lines across null values
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amplitude (% total)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
                        },
                        ticks: {
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 10
                        }
                    }
                },
                animation: {
                    duration: 0,
                    easing: 'linear'
                }
            }
        });
    }

    updateChart(newValue) {
        // this is a pretty basic deque implementation that will shift values 
        // over to the left when the deque is full and add the new data point to the right (end)
        // I know its probably not the most efficient/optimal way of implementing the deque, but I am
        // not expecting to have the array store more than 100 data points so it is probably negligble
        if (this.emgData.length < this.maxDataPoints) {
            // dequeue oldest
            this.emgData[this.totalPoints] = newValue;
            this.labels[this.totalPoints] = this.totalPoints;
        } else {
            // Shift all data one position to the left
            for (let i = 0; i < this.maxDataPoints - 1; i++) {
                this.emgData[i] = this.emgData[i + 1];    // move next value to current position
                this.labels[i] = this.labels[i + 1];      // same for label
            }
    
            // Add the new value at the end
            this.emgData[this.maxDataPoints - 1] = newValue;
            this.labels[this.maxDataPoints - 1] = this.totalPoints;
        }

        this.totalPoints++;

        this.updatePeakValue(newValue);
        this.updateAverageValue(newValue);

        // push the updates to the chart
        this.chart.update('quiet');
    }

    updatePeakValue(value) {
        this.peakValue = Math.max(this.peakValue, value);
        document.getElementById('peakValue').textContent = this.peakValue.toFixed(2);
    }

    updateAverageValue(value) {
        this.sum += value;
        const average = this.sum / this.totalPoints;
        document.getElementById('averageValue').textContent = average.toFixed(2);
    }
}


function createSocket(url) {
    const socket = io(url, {
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
    });

    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('disconnect', (reason) => {
        console.log('Disconnected:', reason);
    });

    return socket;
}

document.addEventListener('DOMContentLoaded', () => {
    const maxDataPoints = 60;
    const socketUrl = "http://localhost:5000";

    const chartManager = new ChartManager(maxDataPoints);
    const socket = createSocket(socketUrl);

    // update the chart when new emg data is received
    socket.on('emg_data', (data) => {
        chartManager.updateChart(data);
    });

    // Cleanup WebSocket
    window.addEventListener('beforeunload', () => {
        socket.disconnect();
    });

    // Dark mode toggle logic
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // If the button is pressed, load in the dark mode state and apply it to the page/body
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    if (darkModeEnabled) {
        body.classList.add('dark-mode');
        darkModeToggle.textContent = 'Light Mode';
    }

    // Listener to toggle the dark mode
    darkModeToggle.addEventListener('click', () => {
        const isDarkMode = body.classList.toggle('dark-mode');
        darkModeToggle.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
        localStorage.setItem('darkMode', isDarkMode);
    });
});
