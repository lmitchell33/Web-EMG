/** 
 * Class representing the chart
 * This class is responsible for rendering and updating the EMG signal chart
 * @requires Chart.js - https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.0/chart.min.js
 */
class ChartManager {
    /**
     * Create a chart.
     * Initializes the chart, sets up the data structure, and prepares for rendering.
     * @param {number} maxDataPoints - The maximum number of data points to display on the chart
     */
    constructor(maxDataPoints) {
        /** @type {number} */
        this.maxDataPoints = maxDataPoints;

        /** @type {CanvasRenderingContext2D} */
        this.ctx = document.getElementById('emgChart').getContext('2d');
        
        /** @type {Array} - Array for holding the emg data. Initializes as null */
        this.emgData = Array(maxDataPoints).fill(null);
        
        /** @type {Array} - Array for holding the labels to the data points */
        this.labels = Array(maxDataPoints).fill('');
        
        /** @type {number} - The total number of data points received */
        this.totalPoints = 0;  // Track total points received
        
        /** @type {Chart} - The chart displayed for the data*/
        this.chart = this.initializeChart();
    }

    /**
     * Initalize a chart using the values from the constructor
     * @returns {Chart} - The initialized chart from Chart.js
     */
    initializeChart() {
        return new Chart(this.ctx, {
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
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amplitude (mV)'
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

    /**
     * Updates the chart based on the new value provided
     * @param {number} newValue - The new value to add to the chart 
     */
    updateChart(newValue) {
        // This ensures that the datapoints start on the left side of the chart.
        // Then, after filling the chart, it will start shifting the data to the left
        // and adding points to the right side of the chart
        if (this.totalPoints < this.maxDataPoints) {
            this.emgData[this.totalPoints] = newValue;
            this.labels[this.totalPoints] = this.totalPoints;
            this.totalPoints++;
        } 
        else {
            // Once full, shift all data and labels to the left by one index
            for (let i = 0; i < this.maxDataPoints - 1; i++) {
                this.emgData[i] = this.emgData[i + 1];  // Shift data left
                this.labels[i] = this.labels[i + 1];    // Shift labels left
            }

            // Add the new value at the end (right side)
            this.emgData[this.maxDataPoints - 1] = newValue;
            this.labels[this.maxDataPoints - 1] = this.totalPoints;
        }

        // Increment the total data points counter
        this.totalPoints++;

        // Update the chart
        this.chart.update('quiet');
    }
}

/** 
 * Class to process the incoming WebSocket data
 * This class processes each incoming EMG data point, calculating the peak and average values
 */
class DataProcessor {
    /**
     * Processes incoming data and updates the peak and average values
     */
    constructor() {
        /** @type {number} - Holds the running sum of all data points sent */
        this.sum = 0;
        
        /** @type {number} - Holds the number of all data points sent. This is required because this class does not have access to all the emg data */
        this.count = 0;
        
        /** @type {number} - Holds the highest data point sent */
        this.peak = 0;
    }

    /**
     * Updates the speak and average values based on the new value
     * @param {number} value - The value to process
     * @returns {number} - The value that was processed
     */
    processNewValue(value) {
        this.updatePeakValue(value);
        this.updateAverageValue(value);
        return value;
    }

    /**
     * Updates the peak value by comparing the old peak to the new value
     * @param {number} value - The new value to to add to the chart 
     */
    updatePeakValue(value) {
        this.peak = Math.max(this.peak, value);
        document.getElementById('peakValue').textContent = this.peak.toFixed(2);
    }

    /**
     * Updates the average value by adding to the sum, incrementing count, and calculating the average
     * @param {number} value - The new value to add to the chart 
     */
    updateAverageValue(value) {
        this.sum += value;
        this.count++;
        const average = this.sum / this.count;
        document.getElementById('averageValue').textContent = average.toFixed(2);
    }
}

/**
 * WebSocket Manager Class
 * Manages the WebSocket connection and handles incoming data updates
 * @requires Socket.IO - https://cdn.socket.io/4.7.2/socket.io.min.js
 */
class WebSocketManager {
    /**
     * Initializes the WebSocket manager and connects to the WebSocket server
     * @param {ChartManager} chartManager - Instance of the ChartManager to update the chart
     * @param {DataProcessor} dataProcessor - Instance of the DataProcessor to process incoming data
     * @param {string} sockerUrl - The URL of the WebSocket server.
     */
    constructor(chartManager, dataProcessor, socketUrl) {
        /** @type {Socket|null} - Socket used to connect to server */
        this.socket = null;
        
        /** @type {ChartManager} - Chart to be displayed on the webpage */
        this.chartManager = chartManager;
        
        /** @type {DataProcessor} - DataProcessor instance used to manage the data */
        this.dataProcessor = dataProcessor;
        
        /** @type {string} */
        this.socketUrl = socketUrl;

        /** @type {function} */
        this.connect();
    }

    /**
     * Connects to the WebSocket server and sets up event handlers for connection, data, and errors
     */
    connect() {
        // Initialize Socket.IO with automatic reconnection
        this.socket = io(this.socketUrl, {
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000
        });

        // setup the event handler found below
        this.setupEventHandlers();
    }

    /**
     * Sets up event handlers for WebSocket events.
     */
    setupEventHandlers() {
        // Connection events
        
        // Connect handling
        this.socket.on('connect', () => {
            this.updateConnectionStatus(true);
            console.log('Connected to server');
        });

        // Disconnect handling 
        this.socket.on('disconnect', (reason) => {
            this.updateConnectionStatus(false);
            console.log('Disconnected:', reason);
        });

        // Error handling
        this.socket.on('connect_error', (error) => {
            console.error('Connection Error:', error);
            this.updateConnectionStatus(false);
        });

        // Data handling, updates the chart with new, processed, data
        this.socket.on('emg_data', (data) => {
            const value = parseFloat(data);
            const processedValue = this.dataProcessor.processNewValue(value);
            this.chartManager.updateChart(processedValue);
        });
    }

    /**
     * Updates the connection status displayed on the page.
     * @param {boolean} connected - True if connected, false if disconnected.
     */
    updateConnectionStatus(connected) {
        // Updates the box found at the top of the screen to show connected or disconnected.
        const connectionBox = document.getElementById('connectionStatus');
        connectionBox.className = connected ? 'connected' : 'disconnected'; // updates the class name (for css styling)
        connectionBox.textContent = connected ? 'Connected' : 'Disconnected'; // updates the text
    }

    /**
     * Disconnects the WebSocket connection.
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

/** 
 * Initialize everything when the DOM is loaded 
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize chart, data processor, and WebSocket manager
    const maxDataPoints = 100;
    const socketUrl = "http://localhost:5000";

    const chartManager = new ChartManager(maxDataPoints);
    const dataProcessor = new DataProcessor();
    const websocketManager = new WebSocketManager(chartManager, dataProcessor, socketUrl);

    // Cleanup WebSocket on page unload
    window.addEventListener('beforeunload', () => {
        websocketManager.disconnect();
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