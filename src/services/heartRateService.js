/**
 * Heart Rate Detection Service
 *
 * Supports two modes:
 * 1. Camera-based rPPG (Remote Photoplethysmography) - Uses webcam to detect pulse from facial color changes
 * 2. Web Bluetooth API - Connects to BLE heart rate monitors for accurate readings
 *
 * References:
 * - https://developer.chrome.com/docs/capabilities/bluetooth
 * - https://github.com/prouast/heartbeat-js
 * - https://github.com/camilleanne/pulse
 */

// Heart rate zones for stress/anxiety detection
const HR_ZONES = {
  RESTING: { min: 50, max: 80, label: 'Calm', color: '#34D399' },
  NORMAL: { min: 80, max: 100, label: 'Normal', color: '#4A90E2' },
  ELEVATED: { min: 100, max: 120, label: 'Elevated', color: '#FBBF24' },
  HIGH: { min: 120, max: 150, label: 'Anxious', color: '#F97316' },
  VERY_HIGH: { min: 150, max: 220, label: 'Stressed', color: '#EF4444' }
};

// Bluetooth GATT Service and Characteristic UUIDs for Heart Rate
const HEART_RATE_SERVICE = 0x180D;
const HEART_RATE_MEASUREMENT = 0x2A37;

class HeartRateService {
  constructor() {
    this.mode = null; // 'camera' or 'bluetooth'
    this.isActive = false;
    this.currentBPM = null;
    this.bpmHistory = [];
    this.callbacks = {
      onHeartRate: null,
      onZoneChange: null,
      onError: null,
      onConnectionChange: null
    };

    // Bluetooth specific
    this.bluetoothDevice = null;
    this.bluetoothCharacteristic = null;

    // Camera/rPPG specific
    this.videoElement = null;
    this.canvasElement = null;
    this.canvasContext = null;
    this.rppgInterval = null;
    this.greenChannelBuffer = [];
    this.timestamps = [];
    this.bufferSize = 256; // ~8.5 seconds at 30fps
    this.lastZone = null;

    // Session tracking for analytics
    this.sessionData = {
      startTime: null,
      readings: [],
      averageBPM: null,
      maxBPM: null,
      minBPM: null,
      timeInZones: {},
      stressEvents: []
    };
  }

  // =========================================================================
  // PUBLIC API
  // =========================================================================

  /**
   * Check if Web Bluetooth is supported
   */
  isBluetoothSupported() {
    return 'bluetooth' in navigator;
  }

  /**
   * Check if camera access is possible
   */
  async isCameraSupported() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch {
      return false;
    }
  }

  /**
   * Get current heart rate zone based on BPM
   */
  getHeartRateZone(bpm) {
    if (!bpm) return null;

    for (const [key, zone] of Object.entries(HR_ZONES)) {
      if (bpm >= zone.min && bpm < zone.max) {
        return { key, ...zone };
      }
    }
    return HR_ZONES.VERY_HIGH;
  }

  /**
   * Start heart rate monitoring via Bluetooth
   */
  async startBluetoothMonitoring() {
    if (!this.isBluetoothSupported()) {
      this.callbacks.onError?.('Web Bluetooth is not supported in this browser');
      return false;
    }

    try {
      console.log('💓 Requesting Bluetooth heart rate device...');
      this.callbacks.onConnectionChange?.('connecting');

      // Request device with heart rate service
      this.bluetoothDevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: [HEART_RATE_SERVICE] }],
        optionalServices: [HEART_RATE_SERVICE]
      });

      console.log('💓 Device selected:', this.bluetoothDevice.name);

      // Set up disconnect listener
      this.bluetoothDevice.addEventListener('gattserverdisconnected', () => {
        console.log('💓 Bluetooth device disconnected');
        this.isActive = false;
        this.mode = null;
        this.callbacks.onConnectionChange?.('disconnected');
      });

      // Connect to GATT server
      const server = await this.bluetoothDevice.gatt.connect();
      console.log('💓 Connected to GATT server');

      // Get heart rate service
      const service = await server.getPrimaryService(HEART_RATE_SERVICE);
      console.log('💓 Got heart rate service');

      // Get heart rate measurement characteristic
      this.bluetoothCharacteristic = await service.getCharacteristic(HEART_RATE_MEASUREMENT);
      console.log('💓 Got heart rate characteristic');

      // Start notifications
      await this.bluetoothCharacteristic.startNotifications();
      this.bluetoothCharacteristic.addEventListener('characteristicvaluechanged',
        this._handleBluetoothHeartRate.bind(this));

      this.mode = 'bluetooth';
      this.isActive = true;
      this._initSession();
      this.callbacks.onConnectionChange?.('connected');

      console.log('💓 Bluetooth heart rate monitoring started');
      return true;

    } catch (error) {
      console.error('💓 Bluetooth error:', error);
      this.callbacks.onError?.(error.message || 'Failed to connect to heart rate monitor');
      this.callbacks.onConnectionChange?.('error');
      return false;
    }
  }

  /**
   * Start heart rate monitoring via camera (rPPG)
   * @param {HTMLVideoElement} videoElement - Video element with webcam stream
   */
  async startCameraMonitoring(videoElement) {
    if (!videoElement || !videoElement.srcObject) {
      this.callbacks.onError?.('No video stream available');
      return false;
    }

    try {
      console.log('💓 Starting camera-based heart rate detection (rPPG)...');
      this.callbacks.onConnectionChange?.('connecting');

      this.videoElement = videoElement;

      // Create canvas for image processing
      this.canvasElement = document.createElement('canvas');
      this.canvasElement.width = 100; // Small for performance
      this.canvasElement.height = 100;
      this.canvasContext = this.canvasElement.getContext('2d', { willReadFrequently: true });

      // Reset buffers
      this.greenChannelBuffer = [];
      this.timestamps = [];

      // Start processing frames
      this.rppgInterval = setInterval(() => {
        this._processVideoFrame();
      }, 33); // ~30fps

      this.mode = 'camera';
      this.isActive = true;
      this._initSession();
      this.callbacks.onConnectionChange?.('connected');

      console.log('💓 Camera heart rate monitoring started');
      return true;

    } catch (error) {
      console.error('💓 Camera monitoring error:', error);
      this.callbacks.onError?.(error.message || 'Failed to start camera monitoring');
      this.callbacks.onConnectionChange?.('error');
      return false;
    }
  }

  /**
   * Stop heart rate monitoring
   */
  async stop() {
    console.log('💓 Stopping heart rate monitoring...');

    if (this.mode === 'bluetooth' && this.bluetoothCharacteristic) {
      try {
        await this.bluetoothCharacteristic.stopNotifications();
        if (this.bluetoothDevice?.gatt?.connected) {
          this.bluetoothDevice.gatt.disconnect();
        }
      } catch (error) {
        console.warn('💓 Bluetooth disconnect error:', error);
      }
      this.bluetoothDevice = null;
      this.bluetoothCharacteristic = null;
    }

    if (this.mode === 'camera' && this.rppgInterval) {
      clearInterval(this.rppgInterval);
      this.rppgInterval = null;
      this.canvasElement = null;
      this.canvasContext = null;
      this.videoElement = null;
    }

    this.isActive = false;
    this.mode = null;
    this.callbacks.onConnectionChange?.('disconnected');

    // Return session summary
    return this._getSessionSummary();
  }

  /**
   * Set callback functions
   */
  setCallbacks({ onHeartRate, onZoneChange, onError, onConnectionChange }) {
    if (onHeartRate) this.callbacks.onHeartRate = onHeartRate;
    if (onZoneChange) this.callbacks.onZoneChange = onZoneChange;
    if (onError) this.callbacks.onError = onError;
    if (onConnectionChange) this.callbacks.onConnectionChange = onConnectionChange;
  }

  /**
   * Get current session data
   */
  getSessionData() {
    return { ...this.sessionData };
  }

  // =========================================================================
  // BLUETOOTH HANDLING
  // =========================================================================

  _handleBluetoothHeartRate(event) {
    const value = event.target.value;
    const flags = value.getUint8(0);

    // Bit 0 indicates if heart rate is in 8-bit or 16-bit format
    let heartRate;
    if (flags & 0x01) {
      heartRate = value.getUint16(1, true);
    } else {
      heartRate = value.getUint8(1);
    }

    console.log('💓 Bluetooth BPM:', heartRate);
    this._processHeartRate(heartRate);
  }

  // =========================================================================
  // CAMERA/rPPG HANDLING
  // =========================================================================

  _processVideoFrame() {
    if (!this.videoElement || !this.canvasContext) return;
    if (this.videoElement.paused || this.videoElement.ended) return;

    try {
      // Draw current frame to canvas
      this.canvasContext.drawImage(
        this.videoElement,
        0, 0,
        this.canvasElement.width,
        this.canvasElement.height
      );

      // Get image data from face region (center area)
      const faceX = Math.floor(this.canvasElement.width * 0.3);
      const faceY = Math.floor(this.canvasElement.height * 0.2);
      const faceW = Math.floor(this.canvasElement.width * 0.4);
      const faceH = Math.floor(this.canvasElement.height * 0.4);

      const imageData = this.canvasContext.getImageData(faceX, faceY, faceW, faceH);
      const pixels = imageData.data;

      // Calculate average green channel value
      // Green channel is most sensitive to blood volume changes
      let greenSum = 0;
      let pixelCount = 0;

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        // Only use pixels that look like skin (simple heuristic)
        if (r > 60 && g > 40 && b > 20 && r > g && r > b) {
          greenSum += g;
          pixelCount++;
        }
      }

      if (pixelCount > 0) {
        const avgGreen = greenSum / pixelCount;
        this.greenChannelBuffer.push(avgGreen);
        this.timestamps.push(Date.now());

        // Keep buffer at fixed size
        if (this.greenChannelBuffer.length > this.bufferSize) {
          this.greenChannelBuffer.shift();
          this.timestamps.shift();
        }

        // Calculate BPM when we have enough data
        if (this.greenChannelBuffer.length >= this.bufferSize * 0.75) {
          const bpm = this._calculateBPMFromSignal();
          if (bpm && bpm >= 40 && bpm <= 200) {
            this._processHeartRate(Math.round(bpm));
          }
        }
      }

    } catch (error) {
      console.warn('💓 Frame processing error:', error);
    }
  }

  _calculateBPMFromSignal() {
    if (this.greenChannelBuffer.length < 64) return null;

    // Simple peak detection algorithm
    const signal = [...this.greenChannelBuffer];

    // Detrend signal (remove slow drift)
    const windowSize = 30;
    const detrended = [];
    for (let i = 0; i < signal.length; i++) {
      const start = Math.max(0, i - windowSize);
      const end = Math.min(signal.length, i + windowSize);
      const localMean = signal.slice(start, end).reduce((a, b) => a + b, 0) / (end - start);
      detrended.push(signal[i] - localMean);
    }

    // Find zero crossings (simplified peak detection)
    const crossings = [];
    for (let i = 1; i < detrended.length; i++) {
      if (detrended[i - 1] < 0 && detrended[i] >= 0) {
        crossings.push(i);
      }
    }

    if (crossings.length < 2) return null;

    // Calculate average interval between crossings
    const intervals = [];
    for (let i = 1; i < crossings.length; i++) {
      const timeDiff = this.timestamps[crossings[i]] - this.timestamps[crossings[i - 1]];
      intervals.push(timeDiff);
    }

    // Filter out outliers
    const sortedIntervals = [...intervals].sort((a, b) => a - b);
    const medianInterval = sortedIntervals[Math.floor(sortedIntervals.length / 2)];

    // Convert interval to BPM
    const bpm = 60000 / medianInterval;

    return bpm;
  }

  // =========================================================================
  // COMMON PROCESSING
  // =========================================================================

  _initSession() {
    this.sessionData = {
      startTime: Date.now(),
      readings: [],
      averageBPM: null,
      maxBPM: null,
      minBPM: null,
      timeInZones: {
        RESTING: 0,
        NORMAL: 0,
        ELEVATED: 0,
        HIGH: 0,
        VERY_HIGH: 0
      },
      stressEvents: []
    };
    this.bpmHistory = [];
    this.lastZone = null;
  }

  _processHeartRate(bpm) {
    if (!bpm || bpm < 40 || bpm > 220) return;

    this.currentBPM = bpm;
    this.bpmHistory.push({ bpm, timestamp: Date.now() });

    // Keep history manageable
    if (this.bpmHistory.length > 1000) {
      this.bpmHistory.shift();
    }

    // Update session data
    this.sessionData.readings.push({ bpm, timestamp: Date.now() });

    // Get zone
    const zone = this.getHeartRateZone(bpm);

    // Track time in zones (approximate 1 second per reading)
    if (zone) {
      this.sessionData.timeInZones[zone.key] = (this.sessionData.timeInZones[zone.key] || 0) + 1;
    }

    // Detect stress events (sudden increases)
    if (this.bpmHistory.length >= 5) {
      const recent = this.bpmHistory.slice(-5).map(r => r.bpm);
      const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const older = this.bpmHistory.slice(-10, -5);
      if (older.length >= 5) {
        const olderAvg = older.map(r => r.bpm).reduce((a, b) => a + b, 0) / older.length;
        if (avg - olderAvg > 15) {
          this.sessionData.stressEvents.push({
            timestamp: Date.now(),
            increase: avg - olderAvg,
            from: olderAvg,
            to: avg
          });
        }
      }
    }

    // Notify callback
    this.callbacks.onHeartRate?.(bpm, zone);

    // Check for zone change
    if (zone && zone.key !== this.lastZone) {
      this.callbacks.onZoneChange?.(zone, this.lastZone);
      this.lastZone = zone.key;
    }
  }

  _getSessionSummary() {
    if (this.sessionData.readings.length === 0) {
      return null;
    }

    const readings = this.sessionData.readings.map(r => r.bpm);

    return {
      ...this.sessionData,
      duration: Date.now() - this.sessionData.startTime,
      averageBPM: Math.round(readings.reduce((a, b) => a + b, 0) / readings.length),
      maxBPM: Math.max(...readings),
      minBPM: Math.min(...readings),
      totalReadings: readings.length,
      mode: this.mode
    };
  }
}

// Export singleton instance
const heartRateService = new HeartRateService();
export default heartRateService;
export { HR_ZONES };
