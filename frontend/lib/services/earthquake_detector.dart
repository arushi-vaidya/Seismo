// services/earthquake_detector.dart
import 'dart:async';
import 'dart:math';
import 'package:sensors_plus/sensors_plus.dart';

class EarthquakeDetector {
  static final EarthquakeDetector _instance = EarthquakeDetector._internal();
  factory EarthquakeDetector() => _instance;
  EarthquakeDetector._internal();

  StreamSubscription<AccelerometerEvent>? _accelerometerSubscription;
  List<AccelerometerEvent> _readings = [];
  bool _isMonitoring = false;
  
  // Detection parameters
  static const double P_WAVE_THRESHOLD = 0.5;
  static const double S_WAVE_THRESHOLD = 2.0;
  static const int SAMPLE_WINDOW = 50; // Reduced for demo

  Stream<EarthquakeEvent> get earthquakeStream => _earthquakeController.stream;
  final StreamController<EarthquakeEvent> _earthquakeController = 
      StreamController<EarthquakeEvent>.broadcast();

  void startMonitoring() {
    if (_isMonitoring) return;
    
    _isMonitoring = true;
    print('🌍 Starting earthquake monitoring...');
    
    _accelerometerSubscription = accelerometerEvents.listen(_processReading);
  }

  void _processReading(AccelerometerEvent event) {
    _readings.add(event);
    
    if (_readings.length > SAMPLE_WINDOW) {
      _readings.removeAt(0);
    }
    
    if (_readings.length == SAMPLE_WINDOW) {
      _analyzeForEarthquake();
    }
  }

  void _analyzeForEarthquake() {
    // Calculate magnitude of acceleration
    double totalMagnitude = 0;
    for (var reading in _readings) {
      double magnitude = sqrt(pow(reading.x, 2) + pow(reading.y, 2) + pow(reading.z, 2));
      totalMagnitude += magnitude;
    }
    double avgMagnitude = totalMagnitude / _readings.length;
    
    // Remove gravity (approximately 9.8)
    avgMagnitude = (avgMagnitude - 9.8).abs();
    
    // Detect P-wave (small initial shake)
    if (avgMagnitude > P_WAVE_THRESHOLD && avgMagnitude < S_WAVE_THRESHOLD) {
      _triggerPWaveDetection(avgMagnitude);
    }
    
    // Detect S-wave (major shaking)
    if (avgMagnitude > S_WAVE_THRESHOLD) {
      _triggerEarthquake(avgMagnitude);
    }
  }

  void _triggerPWaveDetection(double magnitude) {
    print('📊 P-Wave detected: $magnitude');
    _earthquakeController.add(EarthquakeEvent(
      type: EarthquakeEventType.pWave,
      magnitude: _estimateMagnitude(magnitude),
      timestamp: DateTime.now(),
    ));
  }

  void _triggerEarthquake(double magnitude) {
    print('🚨 Earthquake detected: $magnitude');
    _earthquakeController.add(EarthquakeEvent(
      type: EarthquakeEventType.earthquake,
      magnitude: _estimateMagnitude(magnitude),
      timestamp: DateTime.now(),
    ));
  }

  double _estimateMagnitude(double accelerometerMagnitude) {
    // Simple magnitude estimation based on acceleration
    return (accelerometerMagnitude * 1.5 + 2.0).clamp(1.0, 9.0);
  }

  void stopMonitoring() {
    _isMonitoring = false;
    _accelerometerSubscription?.cancel();
    print('🌍 Earthquake monitoring stopped');
  }

  void dispose() {
    stopMonitoring();
    _earthquakeController.close();
  }
}

enum EarthquakeEventType { pWave, earthquake }

class EarthquakeEvent {
  final EarthquakeEventType type;
  final double magnitude;
  final DateTime timestamp;
  
  EarthquakeEvent({
    required this.type,
    required this.magnitude,
    required this.timestamp,
  });
}