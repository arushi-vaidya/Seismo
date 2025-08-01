// services/mesh_network.dart
import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:geolocator/geolocator.dart';

class MeshNetwork {
  static final MeshNetwork _instance = MeshNetwork._internal();
  factory MeshNetwork() => _instance;
  MeshNetwork._internal();

  bool _isActive = false;
  final List<MeshNode> _connectedNodes = [];
  ServerSocket? _server;
  final List<Socket> _clients = [];
  
  Stream<MeshMessage> get messageStream => _messageController.stream;
  final StreamController<MeshMessage> _messageController = 
      StreamController<MeshMessage>.broadcast();

  Future<void> activateEmergencyMesh() async {
    if (_isActive) return;
    
    _isActive = true;
    await _startMeshServer();
    await _discoverNearbyNodes();
    print("Emergency mesh network activated");
  }

  Future<void> _startMeshServer() async {
    try {
      _server = await ServerSocket.bind(InternetAddress.anyIPv4, 8080);
      _server!.listen(_handleNewConnection);
    } catch (e) {
      print("Failed to start mesh server: $e");
    }
  }

  void _handleNewConnection(Socket client) {
    _clients.add(client);
    client.listen(
      (data) => _handleMessage(utf8.decode(data)),
      onDone: () => _clients.remove(client),
    );
  }

  void _handleMessage(String data) {
    try {
      final message = MeshMessage.fromJson(jsonDecode(data));
      _messageController.add(message);
      
      // Relay message to other nodes
      _relayMessage(message);
    } catch (e) {
      print("Error handling mesh message: $e");
    }
  }

  void _relayMessage(MeshMessage message) {
    final data = utf8.encode(jsonEncode(message.toJson()));
    for (final client in _clients) {
      try {
        client.add(data);
      } catch (e) {
        print("Failed to relay message: $e");
      }
    }
  }

  Future<void> sendEmergencyBroadcast(String message, Position location) async {
    final meshMessage = MeshMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      type: MeshMessageType.emergency,
      content: message,
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: DateTime.now(),
    );
    
    _relayMessage(meshMessage);
  }

  Future<void> _discoverNearbyNodes() async {
    // Mock node discovery
    await Future.delayed(Duration(seconds: 2));
    _connectedNodes.add(MeshNode(id: "node1", distance: 100));
    _connectedNodes.add(MeshNode(id: "node2", distance: 250));
  }

  void deactivate() {
    _isActive = false;
    _server?.close();
    for (final client in _clients) {
      client.close();
    }
    _clients.clear();
    _connectedNodes.clear();
  }
}

class MeshNode {
  final String id;
  final double distance;
  
  MeshNode({required this.id, required this.distance});
}

enum MeshMessageType { emergency, status, resource, evacuation }

class MeshMessage {
  final String id;
  final MeshMessageType type;
  final String content;
  final double latitude;
  final double longitude;
  final DateTime timestamp;
  
  MeshMessage({
    required this.id,
    required this.type,
    required this.content,
    required this.latitude,
    required this.longitude,
    required this.timestamp,
  });
  
  Map<String, dynamic> toJson() => {
    'id': id,
    'type': type.index,
    'content': content,
    'latitude': latitude,
    'longitude': longitude,
    'timestamp': timestamp.toIso8601String(),
  };
  
  factory MeshMessage.fromJson(Map<String, dynamic> json) => MeshMessage(
    id: json['id'],
    type: MeshMessageType.values[json['type']],
    content: json['content'],
    latitude: json['latitude'],
    longitude: json['longitude'],
    timestamp: DateTime.parse(json['timestamp']),
  );
}