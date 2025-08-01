// services/rescue_coordinator.dart
import 'dart:async';
import 'dart:convert';
import 'package:geolocator/geolocator.dart';
import 'package:sqflite/sqflite.dart';

class RescueCoordinator {
  static final RescueCoordinator _instance = RescueCoordinator._internal();
  factory RescueCoordinator() => _instance;
  RescueCoordinator._internal();

  Database? _database;
  Timer? _sosTimer;
  bool _isActive = false;

  Future<void> initialize() async {
    _database = await _initDatabase();
  }

  Future<Database> _initDatabase() async {
    return await openDatabase(
      'rescue_coordination.db',
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE victims (
            id TEXT PRIMARY KEY,
            latitude REAL,
            longitude REAL,
            status TEXT,
            medical_condition TEXT,
            needs TEXT,
            timestamp TEXT
          )
        ''');
        
        await db.execute('''
          CREATE TABLE resources (
            id TEXT PRIMARY KEY,
            type TEXT,
            quantity INTEGER,
            location_lat REAL,
            location_lng REAL,
            provider TEXT,
            timestamp TEXT
          )
        ''');
      },
    );
  }

  Future<void> activateEmergencyMode(Position location) async {
    _isActive = true;
    await _startSOSBroadcast(location);
    print("Emergency rescue coordination activated");
  }

  Future<void> _startSOSBroadcast(Position location) async {
    _sosTimer = Timer.periodic(Duration(seconds: 60), (timer) async {
      await _broadcastSOS(location);
    });
  }

  Future<void> _broadcastSOS(Position location) async {
    final sosReport = VictimReport(
      id: 'user_${DateTime.now().millisecondsSinceEpoch}',
      latitude: location.latitude,
      longitude: location.longitude,
      status: VictimStatus.needsHelp,
      medicalCondition: MedicalCondition.unknown,
      needs: [ResourceType.water, ResourceType.food],
      timestamp: DateTime.now(),
    );

    await _reportVictim(sosReport);
  }

  Future<void> _reportVictim(VictimReport report) async {
    await _database?.insert('victims', {
      'id': report.id,
      'latitude': report.latitude,
      'longitude': report.longitude,
      'status': report.status.toString(),
      'medical_condition': report.medicalCondition.toString(),
      'needs': jsonEncode(report.needs.map((e) => e.toString()).toList()),
      'timestamp': report.timestamp.toIso8601String(),
    });
  }

  Future<List<VictimReport>> getNearbyVictims(Position location, double radiusKm) async {
    final victims = await _database?.query('victims') ?? [];
    
    return victims.map((v) => VictimReport(
      id: v['id'] as String,
      latitude: v['latitude'] as double,
      longitude: v['longitude'] as double,
      status: VictimStatus.values.firstWhere(
        (s) => s.toString() == v['status'],
        orElse: () => VictimStatus.unknown,
      ),
      medicalCondition: MedicalCondition.values.firstWhere(
        (c) => c.toString() == v['medical_condition'],
        orElse: () => MedicalCondition.unknown,
      ),
      needs: (jsonDecode(v['needs'] as String) as List)
          .map((n) => ResourceType.values.firstWhere(
            (r) => r.toString() == n,
            orElse: () => ResourceType.other,
          ))
          .toList(),
      timestamp: DateTime.parse(v['timestamp'] as String),
    )).where((victim) {
      double distance = Geolocator.distanceBetween(
        location.latitude, location.longitude,
        victim.latitude, victim.longitude,
      ) / 1000;
      return distance <= radiusKm;
    }).toList();
  }

  Future<void> reportResource(ResourceReport resource) async {
    await _database?.insert('resources', {
      'id': resource.id,
      'type': resource.type.toString(),
      'quantity': resource.quantity,
      'location_lat': resource.latitude,
      'location_lng': resource.longitude,
      'provider': resource.provider,
      'timestamp': resource.timestamp.toIso8601String(),
    });
  }

  Future<List<ResourceAllocation>> optimizeResourceAllocation() async {
    final victims = await _database?.query('victims') ?? [];
    final resources = await _database?.query('resources') ?? [];
    
    // Simple allocation algorithm - in real implementation, use more sophisticated AI
    List<ResourceAllocation> allocations = [];
    
    for (final victim in victims) {
      final victimNeeds = jsonDecode(victim['needs'] as String) as List;
      
      for (final needStr in victimNeeds) {
        final matchingResources = resources.where(
          (r) => r['type'].toString().contains(needStr)
        ).toList();
        
        if (matchingResources.isNotEmpty) {
          final closestResource = matchingResources.first; // Simplified - should calculate actual distance
          
          allocations.add(ResourceAllocation(
            victimId: victim['id'] as String,
            resourceId: closestResource['id'] as String,
            priority: _calculatePriority(victim),
            estimatedDeliveryTime: Duration(minutes: 30),
          ));
        }
      }
    }
    
    return allocations;
  }

  int _calculatePriority(Map<String, dynamic> victim) {
    // Priority calculation based on medical condition and time
    final condition = victim['medical_condition'] as String;
    final timestamp = DateTime.parse(victim['timestamp'] as String);
    final timeSinceReport = DateTime.now().difference(timestamp).inMinutes;
    
    int basePriority = 1;
    if (condition.contains('critical')) basePriority = 5;
    else if (condition.contains('serious')) basePriority = 4;
    else if (condition.contains('injured')) basePriority = 3;
    
    // Increase priority over time
    return basePriority + (timeSinceReport ~/ 60);
  }

  void deactivate() {
    _isActive = false;
    _sosTimer?.cancel();
  }
}

enum VictimStatus { safe, needsHelp, trapped, critical, unknown }
enum MedicalCondition { none, minor, injured, serious, critical, unknown }
enum ResourceType { water, food, medicine, blankets, shelter, other }

class VictimReport {
  final String id;
  final double latitude;
  final double longitude;
  final VictimStatus status;
  final MedicalCondition medicalCondition;
  final List<ResourceType> needs;
  final DateTime timestamp;

  VictimReport({
    required this.id,
    required this.latitude,
    required this.longitude,
    required this.status,
    required this.medicalCondition,
    required this.needs,
    required this.timestamp,
  });
}

class ResourceReport {
  final String id;
  final ResourceType type;
  final int quantity;
  final double latitude;
  final double longitude;
  final String provider;
  final DateTime timestamp;

  ResourceReport({
    required this.id,
    required this.type,
    required this.quantity,
    required this.latitude,
    required this.longitude,
    required this.provider,
    required this.timestamp,
  });
}

class ResourceAllocation {
  final String victimId;
  final String resourceId;
  final int priority;
  final Duration estimatedDeliveryTime;

  ResourceAllocation({
    required this.victimId,
    required this.resourceId,
    required this.priority,
    required this.estimatedDeliveryTime,
  });
}