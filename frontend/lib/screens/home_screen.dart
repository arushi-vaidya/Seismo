// screens/home_screen.dart
import 'package:flutter/material.dart';
import '../services/earthquake_detector.dart';
import '../services/mesh_network.dart';
import '../services/rescue_coordinator.dart';
import '../widgets/seismic_monitor.dart';
import '../widgets/emergency_button.dart';
import 'emergency_screen.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isMonitoring = true;
  bool _meshActive = false;
  int _connectedNodes = 0;

  @override
  void initState() {
    super.initState();
    _initializeServices();
    _listenForEarthquakes();
  }

  void _initializeServices() {
    EarthquakeDetector().startMonitoring();
    RescueCoordinator().initialize();
  }

  void _listenForEarthquakes() {
    EarthquakeDetector().earthquakeStream.listen((event) {
      if (event.type == EarthquakeEventType.earthquake && event.magnitude > 5.0) {
        _activateEmergencyMode();
      }
    });
  }

  void _activateEmergencyMode() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => EmergencyScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('EarthGuard'),
        backgroundColor: Colors.red[800],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildStatusCard(),
            SizedBox(height: 16),
            SeismicMonitor(),
            SizedBox(height: 16),
            _buildNetworkStatus(),
            SizedBox(height: 24),
            EmergencyButton(
              onPressed: _activateEmergencyMode,
            ),
            SizedBox(height: 16),
            _buildQuickActions(),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusCard() {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'System Status',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Row(
              children: [
                Icon(
                  _isMonitoring ? Icons.check_circle : Icons.error,
                  color: _isMonitoring ? Colors.green : Colors.red,
                ),
                SizedBox(width: 8),
                Text('Earthquake Detection: ${_isMonitoring ? "Active" : "Inactive"}'),
              ],
            ),
            SizedBox(height: 4),
            Row(
              children: [
                Icon(
                  _meshActive ? Icons.wifi : Icons.wifi_off,
                  color: _meshActive ? Colors.green : Colors.grey,
                ),
                SizedBox(width: 8),
                Text('Mesh Network: ${_meshActive ? "Connected" : "Standby"}'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNetworkStatus() {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Network Status',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Text('Connected Nodes: $_connectedNodes'),
            Text('Coverage Radius: ${_meshActive ? "2.5 km" : "0 km"}'),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Quick Actions',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () {},
                icon: Icon(Icons.report),
                label: Text('Report Status'),
              ),
            ),
            SizedBox(width: 8),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () {},
                icon: Icon(Icons.healing),
                label: Text('First Aid'),
              ),
            ),
          ],
        ),
        SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () {},
                icon: Icon(Icons.route),
                label: Text('Evacuation'),
              ),
            ),
            SizedBox(width: 8),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () {},
                icon: Icon(Icons.volunteer_activism),
                label: Text('Resources'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}