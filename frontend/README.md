## 🏗️ Architecture Overview

```
lib/
├── main.dart                    # App entry point
├── screens/                     # UI Screens
│   ├── home_screen.dart        # Main dashboard
│   ├── emergency_screen.dart   # Emergency mode interface
│   ├── evacuation_screen.dart  # Evacuation guidance
│   └── rescue_dashboard.dart   # Rescue coordination
├── services/                    # Core Business Logic
│   ├── earthquake_detector.dart    # Seismic detection engine
│   ├── mesh_network.dart          # Mesh networking
│   ├── rescue_coordinator.dart    # AI rescue coordination
│   ├── tsunami_predictor.dart     # Tsunami risk assessment
│   ├── drone_controller.dart      # Drone integration
│   └── voice_assistant.dart       # Voice AI assistant
├── widgets/                     # Reusable UI Components
│   ├── emergency_button.dart      # Emergency activation button
│   ├── seismic_monitor.dart       # Real-time seismic display
│   └── mesh_status.dart           # Network status indicator
└── models/                      # Data Models
    ├── earthquake_data.dart       # Earthquake event data
    ├── tsunami_alert.dart         # Tsunami warning data
    ├── victim_report.dart         # Rescue victim data
    └── resource.dart              # Emergency resource data
```
