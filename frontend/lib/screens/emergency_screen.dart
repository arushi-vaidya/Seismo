// screens/emergency_screen.dart
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

class EmergencyScreen extends StatefulWidget {
  @override
  _EmergencyScreenState createState() => _EmergencyScreenState();
}

class _EmergencyScreenState extends State<EmergencyScreen> {
  Position? _currentLocation;
  bool _emergencyActivated = false;
  List<String> _recentMessages = [];

  @override
  void initState() {
    super.initState();
    _activateEmergencyServices();
  }

  Future<void> _activateEmergencyServices() async {
    try {
      // Get current location
      _currentLocation = await Geolocator.getCurrentPosition();
      
      setState(() {
        _emergencyActivated = true;
        _recentMessages.add('Emergency mode activated');
        _recentMessages.add('Location acquired: ${_currentLocation!.latitude.toStringAsFixed(4)}, ${_currentLocation!.longitude.toStringAsFixed(4)}');
      });
      
    } catch (e) {
      setState(() {
        _recentMessages.add('Error getting location: $e');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('EMERGENCY MODE'),
        backgroundColor: Colors.red[900],
        foregroundColor: Colors.white,
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildEmergencyStatus(),
            SizedBox(height: 16),
            _buildLocationInfo(),
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
            Text('Stay calm and follow safety procedures'),
          ],
        ),
      ),
    );
  }

  Widget _buildLocationInfo() {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Your Location',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            if (_currentLocation != null) ...[
              Text('Latitude: ${_currentLocation!.latitude.toStringAsFixed(6)}'),
              Text('Longitude: ${_currentLocation!.longitude.toStringAsFixed(6)}'),
              Text('Accuracy: ${_currentLocation!.accuracy.toStringAsFixed(1)}m'),
            ] else ...[
              Row(
                children: [
                  CircularProgressIndicator(strokeWidth: 2),
                  SizedBox(width: 12),
                  Text('Getting location...'),
                ],
              ),
            ],
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
                icon: Icon(Icons.sos, color: Colors.white),
                label: Text('Send SOS', style: TextStyle(color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  padding: EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
            SizedBox(width: 8),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _reportStatus,
                icon: Icon(Icons.health_and_safety, color: Colors.white),
                label: Text('I\'m Safe', style: TextStyle(color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  padding: EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _findShelter,
                icon: Icon(Icons.home, color: Colors.white),
                label: Text('Find Shelter', style: TextStyle(color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange,
                  padding: EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
            SizedBox(width: 8),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _requestHelp,
                icon: Icon(Icons.medical_services, color: Colors.white),
                label: Text('Need Help', style: TextStyle(color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  padding: EdgeInsets.symmetric(vertical: 12),
                ),
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
              'Emergency Log',
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
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${DateTime.now().toString().substring(11, 19)}',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: Colors.grey[600],
                                ),
                              ),
                              SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _recentMessages[index],
                                  style: TextStyle(fontSize: 12),
                                ),
                              ),
                            ],
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

  void _sendSOSMessage() {
    setState(() {
      _recentMessages.insert(0, 'SOS: Emergency help requested at current location');
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('SOS message logged - In real app, this would contact emergency services'),
        backgroundColor: Colors.red,
      ),
    );
  }

  void _reportStatus() {
    setState(() {
      _recentMessages.insert(0, 'Status: Reported as safe and uninjured');
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Safety status reported'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _findShelter() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Nearby Shelters'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: Icon(Icons.school),
              title: Text('Community Center'),
              subtitle: Text('0.5 km away'),
            ),
            ListTile(
              leading: Icon(Icons.local_hospital),
              title: Text('Emergency Shelter'),
              subtitle: Text('1.2 km away'),
            ),
            ListTile(
              leading: Icon(Icons.business),
              title: Text('Government Building'),
              subtitle: Text('2.1 km away'),
            ),
          ],
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

  void _requestHelp() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Request Help'),
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
            ListTile(
              leading: Icon(Icons.engineering),
              title: Text('Rescue'),
              onTap: () => _requestResource('Rescue'),
            ),
          ],
        ),
      ),
    );
  }

  void _requestResource(String resource) {
    Navigator.pop(context);
    setState(() {
      _recentMessages.insert(0, 'Resource Request: Need $resource urgently');
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$resource request logged'),
        backgroundColor: Colors.blue,
      ),
    );
  }
}