// screens/emergency_screen.dart
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../services/mesh_network.dart';
import '../services/rescue_coordinator.dart';
import '../services/tsunami_predictor.dart';

class EmergencyScreen extends StatefulWidget {
  @override
  _EmergencyScreenState createState() => _EmergencyScreenState();
}

class _EmergencyScreenState extends State<EmergencyScreen> {
  Position? _currentLocation;
  TsunamiRisk? _tsunamiRisk;
  bool _meshActivated = false;
  List<String> _recentMessages = [];

  @override
  void initState() {
    super.initState();
    _activateEmergencyServices();
  }

  Future<void> _activateEmergencyServices() async {
    // Get current location
    _currentLocation = await Geolocator.getCurrentPosition();
    
    // Activate mesh network
    await MeshNetwork().activateEmergencyMesh();
    setState(() {
      _meshActivated = true;
    });
    
    // Activate rescue coordination
    if (_currentLocation != null) {
      await RescueCoordinator().activateEmergencyMode(_currentLocation!);
    }
    
    // Check tsunami risk
    await _assessTsunamiRisk();
    
    // Listen for mesh messages
    _listenForMessages();
  }

  Future<void> _assessTsunamiRisk() async {
    if (_currentLocation == null) return;
    
    // Mock earthquake data - in real implementation, get from detector
    final tsunamiRisk = await TsunamiPredictor().assessTsunamiRisk(
      7.5, // magnitude
      15.0, // depth
      Position(latitude: _currentLocation!.latitude + 0.1, longitude: _currentLocation!.longitude + 0.1, timestamp: DateTime.now(), accuracy: 0, altitude: 0, heading: 0, speed: 0, speedAccuracy: 0), // epicenter
      _currentLocation!,
    );
    
    setState(() {
      _tsunamiRisk = tsunamiRisk;
    });
  }

  void _listenForMessages() {
    MeshNetwork().messageStream.listen((message) {
      setState(() {
        _recentMessages.insert(0, '${message.type.toString()}: ${message.content}');
        if (_recentMessages.length > 10) {
          _recentMessages.removeLast();
        }
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('EMERGENCY MODE'),
        backgroundColor: Colors.red[900],
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildEmergencyStatus(),
            SizedBox(height: 16),
            if (_tsunamiRisk != null && _tsunamiRisk!.level != TsunamiRiskLevel.none)
              _buildTsunamiWarning(),
            SizedBox(height: 16),
            _buildMeshStatus(),
            SizedBox(height: 16),
            _buildQuickActions(),
            SizedBox(height: 16),
            _buildMessageFeed(),
          ],
        ),
      ),
    );
  }

  Widget _buildEmergencyStatus() {
    return Card(
      color: Colors.red[50],
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(Icons.warning, size: 48, color: Colors.red),
            SizedBox(height: 8),
            Text(
              'EARTHQUAKE DETECTED',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.red[800],
              ),
            ),
            SizedBox(height: 8),
            Text('Emergency services have been activated'),
            Text('Your location is being broadcast for rescue'),
          ],
        ),
      ),
    );
  }

  Widget _buildTsunamiWarning() {
    return Card(
      color: Colors.orange[50],
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.waves, color: Colors.orange[800]),
                SizedBox(width: 8),
                Text(
                  'TSUNAMI RISK: ${_tsunamiRisk!.level.toString().toUpperCase()}',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.orange[800],
                  ),
                ),
              ],
            ),
            if (_tsunamiRisk!.estimatedArrivalTime != null) ...[
              SizedBox(height: 8),
              Text(
                'Estimated arrival: ${_tsunamiRisk!.estimatedArrivalTime!.toLocal().toString().substring(11, 16)}',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ],
            if (_tsunamiRisk!.recommendedActions != null) ...[
              SizedBox(height: 8),
              Text('Recommended actions:', style: TextStyle(fontWeight: FontWeight.bold)),
              ..._tsunamiRisk!.recommendedActions!.map((action) => 
                Padding(
                  padding: EdgeInsets.only(left: 16, top: 4),
                  child: Text('• $action'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildMeshStatus() {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Emergency Network',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Row(
              children: [
                Icon(
                  _meshActivated ? Icons.wifi : Icons.wifi_off,
                  color: _meshActivated ? Colors.green : Colors.red,
                ),
                SizedBox(width: 8),
                Text(_meshActivated ? 'Mesh Network Active' : 'Activating...'),
              ],
            ),
            Text('Connected devices: ${_meshActivated ? "3" : "0"}'),
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
          'Emergency Actions',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _sendSOSMessage,
                icon: Icon(Icons.sos),
                label: Text('Send SOS'),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              ),
            ),
            SizedBox(width: 8),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _reportStatus,
                icon: Icon(Icons.health_and_safety),
                label: Text('I\'m Safe'),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
              ),
            ),
          ],
        ),
        SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _findEvacuation,
                icon: Icon(Icons.directions_run),
                label: Text('Evacuate'),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
              ),
            ),
            SizedBox(width: 8),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _requestResources,
                icon: Icon(Icons.medical_services),
                label: Text('Need Help'),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildMessageFeed() {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Emergency Messages',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Container(
              height: 200,
              child: _recentMessages.isEmpty
                  ? Center(child: Text('No messages yet'))
                  : ListView.builder(
                      itemCount: _recentMessages.length,
                      itemBuilder: (context, index) {
                        return Padding(
                          padding: EdgeInsets.symmetric(vertical: 4),
                          child: Text(
                            _recentMessages[index],
                            style: TextStyle(fontSize: 12),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  void _sendSOSMessage() async {
    if (_currentLocation != null) {
      await MeshNetwork().sendEmergencyBroadcast(
        'SOS: Need immediate help at this location',
        _currentLocation!,
      );
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('SOS message sent to emergency network')),
      );
    }
  }

  void _reportStatus() async {
    if (_currentLocation != null) {
      await MeshNetwork().sendEmergencyBroadcast(
        'Status: I am safe and uninjured',
        _currentLocation!,
      );
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Safety status reported')),
      );
    }
  }

  void _findEvacuation() {
    if (_tsunamiRisk?.evacuationZones != null) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Evacuation Zones'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: _tsunamiRisk!.evacuationZones!.map((zone) =>
              ListTile(
                title: Text(zone.name),
                subtitle: Text('${zone.distanceKm.toStringAsFixed(1)} km away'),
                trailing: Text('${zone.elevation}m'),
              ),
            ).toList(),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Close'),
            ),
          ],
        ),
      );
    }
  }

  void _requestResources() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Request Resources'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: Icon(Icons.local_drink),
              title: Text('Water'),
              onTap: () => _requestResource('Water'),
            ),
            ListTile(
              leading: Icon(Icons.restaurant),
              title: Text('Food'),
              onTap: () => _requestResource('Food'),
            ),
            ListTile(
              leading: Icon(Icons.medical_services),
              title: Text('Medical Aid'),
              onTap: () => _requestResource('Medical Aid'),
            ),
          ],
        ),
      ),
    );
  }

  void _requestResource(String resource) async {
    Navigator.pop(context);
    if (_currentLocation != null) {
      await MeshNetwork().sendEmergencyBroadcast(
        'Resource Request: Need $resource urgently',
        _currentLocation!,
      );
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('$resource request sent')),
      );
    }
  }
}