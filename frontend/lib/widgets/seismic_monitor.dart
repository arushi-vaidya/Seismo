// widgets/seismic_monitor.dart
import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:math';
import '../services/earthquake_detector.dart';

class SeismicMonitor extends StatefulWidget {
  @override
  _SeismicMonitorState createState() => _SeismicMonitorState();
}

class _SeismicMonitorState extends State<SeismicMonitor> {
  List<double> _readings = [];
  double _currentMagnitude = 0.0;
  StreamSubscription<EarthquakeEvent>? _subscription;
  Timer? _updateTimer;

  @override
  void initState() {
    super.initState();
    _startMonitoring();
  }

  void _startMonitoring() {
    _subscription = EarthquakeDetector().earthquakeStream.listen((event) {
      setState(() {
        _currentMagnitude = event.magnitude;
      });
    });

    // Simulate readings for visualization
    _updateTimer = Timer.periodic(Duration(milliseconds: 100), (timer) {
      setState(() {
        _readings.add(_generateMockReading());
        if (_readings.length > 100) {
          _readings.removeAt(0);
        }
      });
    });
  }

  double _generateMockReading() {
    // Generate realistic seismic noise with occasional spikes
    return (Random().nextDouble() - 0.5) * 2 + 
           (_currentMagnitude > 2 ? _currentMagnitude * Random().nextDouble() : 0);
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Seismic Activity Monitor',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 16),
            Container(
              height: 100,
              child: CustomPaint(
                painter: SeismicWaveformPainter(_readings),
                size: Size.infinite,
              ),
            ),
            SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Current Activity:'),
                Text(
                  _getActivityLevel(),
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: _getActivityColor(),
                  ),
                ),
              ],
            ),
            if (_currentMagnitude > 0)
              Text('Estimated Magnitude: ${_currentMagnitude.toStringAsFixed(1)}'),
          ],
        ),
      ),
    );
  }

  String _getActivityLevel() {
    if (_currentMagnitude < 2) return 'Normal';
    if (_currentMagnitude < 4) return 'Minor';
    if (_currentMagnitude < 6) return 'Moderate';
    if (_currentMagnitude < 8) return 'Strong';
    return 'Major';
  }

  Color _getActivityColor() {
    if (_currentMagnitude < 2) return Colors.green;
    if (_currentMagnitude < 4) return Colors.yellow[700]!;
    if (_currentMagnitude < 6) return Colors.orange;
    return Colors.red;
  }

  @override
  void dispose() {
    _subscription?.cancel();
    _updateTimer?.cancel();
    super.dispose();
  }
}

class SeismicWaveformPainter extends CustomPainter {
  final List<double> readings;

  SeismicWaveformPainter(this.readings);

  @override
  void paint(Canvas canvas, Size size) {
    if (readings.isEmpty) return;

    final paint = Paint()
      ..color = Colors.blue
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;

    final path = Path();
    final centerY = size.height / 2;
    final stepX = size.width / readings.length;

    for (int i = 0; i < readings.length; i++) {
      final x = i * stepX;
      final y = centerY + readings[i] * 20; // Scale the reading

      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    canvas.drawPath(path, paint);

    // Draw center line
    final centerLinePaint = Paint()
      ..color = Colors.grey[400]!
      ..strokeWidth = 0.5;
    canvas.drawLine(
      Offset(0, centerY),
      Offset(size.width, centerY),
      centerLinePaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}