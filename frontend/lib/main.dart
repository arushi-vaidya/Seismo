import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'screens/home_screen.dart';
import 'services/earthquake_detector.dart';
import 'services/mesh_network.dart';

void main() {
  runApp(EarthGuardApp());
}

class EarthGuardApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'EarthGuard',
      theme: ThemeData(
        primarySwatch: Colors.red,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: HomeScreen(),
    );
  }
}