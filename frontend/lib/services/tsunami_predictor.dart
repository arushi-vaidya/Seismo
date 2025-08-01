// services/tsunami_predictor.dart
import 'dart:math';
import 'package:geolocator/geolocator.dart';

class TsunamiPredictor {
  static final TsunamiPredictor _instance = TsunamiPredictor._internal();
  factory TsunamiPredictor() => _instance;
  TsunamiPredictor._internal();

  // Tsunami risk thresholds
  static const double MIN_TSUNAMI_MAGNITUDE = 7.0;
  static const double MAX_DEPTH_KM = 70.0;
  static const double COASTAL_RISK_RADIUS_KM = 1000.0;

  Future<TsunamiRisk> assessTsunamiRisk(
    double magnitude,
    double depth,
    Position epicenter,
    Position currentLocation,
  ) async {
    // Check basic tsunami conditions
    if (magnitude < MIN_TSUNAMI_MAGNITUDE || depth > MAX_DEPTH_KM) {
      return TsunamiRisk(level: TsunamiRiskLevel.none);
    }

    // Calculate distance to epicenter
    double distanceKm = Geolocator.distanceBetween(
      epicenter.latitude, epicenter.longitude,
      currentLocation.latitude, currentLocation.longitude,
    ) / 1000;

    // Assess risk level based on magnitude and distance
    TsunamiRiskLevel riskLevel = _calculateRiskLevel(magnitude, distanceKm);
    
    if (riskLevel == TsunamiRiskLevel.none) {
      return TsunamiRisk(level: riskLevel);
    }

    // Calculate wave arrival time
    int arrivalTimeMinutes = _calculateWaveArrivalTime(distanceKm, depth);
    
    // Find evacuation zones
    List<EvacuationZone> evacuationZones = await _findEvacuationZones(currentLocation);

    return TsunamiRisk(
      level: riskLevel,
      estimatedArrivalTime: DateTime.now().add(Duration(minutes: arrivalTimeMinutes)),
      evacuationZones: evacuationZones,
      recommendedActions: _getRecommendedActions(riskLevel, arrivalTimeMinutes),
    );
  }

  TsunamiRiskLevel _calculateRiskLevel(double magnitude, double distanceKm) {
    if (distanceKm > COASTAL_RISK_RADIUS_KM) return TsunamiRiskLevel.none;
    
    if (magnitude >= 9.0 && distanceKm < 100) return TsunamiRiskLevel.extreme;
    if (magnitude >= 8.5 && distanceKm < 200) return TsunamiRiskLevel.high;
    if (magnitude >= 8.0 && distanceKm < 300) return TsunamiRiskLevel.moderate;
    if (magnitude >= 7.5 && distanceKm < 500) return TsunamiRiskLevel.low;
    
    return TsunamiRiskLevel.none;
  }

  int _calculateWaveArrivalTime(double distanceKm, double depthKm) {
    // Simplified tsunami wave speed calculation
    // Speed ≈ √(g × depth) where g = 9.8 m/s²
    double speedKmPerMin = sqrt(9.8 * depthKm * 1000) * 0.06; // Convert to km/min
    return (distanceKm / speedKmPerMin).round();
  }

  Future<List<EvacuationZone>> _findEvacuationZones(Position location) async {
    // Mock evacuation zones - in real implementation, use elevation data
    return [
      EvacuationZone(
        name: "Highland Community Center",
        latitude: location.latitude + 0.01,
        longitude: location.longitude + 0.01,
        elevation: 50,
        capacity: 500,
        distanceKm: 2.5,
      ),
      EvacuationZone(
        name: "University Campus",
        latitude: location.latitude + 0.02,
        longitude: location.longitude - 0.01,
        elevation: 75,
        capacity: 1000,
        distanceKm: 4.2,
      ),
    ];
  }

  List<String> _getRecommendedActions(TsunamiRiskLevel level, int arrivalTimeMinutes) {
    switch (level) {
      case TsunamiRiskLevel.extreme:
        return [
          "EVACUATE IMMEDIATELY to high ground",
          "Do NOT wait for official warnings",
          "Move at least 100 feet above sea level",
          "Stay away from coast for at least 8 hours",
        ];
      case TsunamiRiskLevel.high:
        return [
          "Move to high ground immediately",
          "Follow evacuation routes",
          "Take emergency supplies if time permits",
          "Help others evacuate",
        ];
      case TsunamiRiskLevel.moderate:
        return [
          "Prepare to evacuate",
          "Monitor official warnings",
          "Move away from coast if instructed",
          "Have evacuation bag ready",
        ];
      case TsunamiRiskLevel.low:
        return [
          "Stay alert for updates",
          "Know your evacuation route",
          "Be prepared to move to higher ground",
        ];
      default:
        return [];
    }
  }
}

enum TsunamiRiskLevel { none, low, moderate, high, extreme }

class TsunamiRisk {
  final TsunamiRiskLevel level;
  final DateTime? estimatedArrivalTime;
  final List<EvacuationZone>? evacuationZones;
  final List<String>? recommendedActions;

  TsunamiRisk({
    required this.level,
    this.estimatedArrivalTime,
    this.evacuationZones,
    this.recommendedActions,
  });
}

class EvacuationZone {
  final String name;
  final double latitude;
  final double longitude;
  final double elevation;
  final int capacity;
  final double distanceKm;

  EvacuationZone({
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.elevation,
    required this.capacity,
    required this.distanceKm,
  });
}