# 🌍 EarthGuard: Complete Earthquake Response System

> **Comprehensive disaster response platform with predictive detection, emergency mesh networking, and AI-powered rescue coordination**

EarthGuard transforms smartphones into a revolutionary earthquake prediction, detection, and recovery network. By combining seismic detection, mesh networking, AI-powered rescue coordination, and real-time resource management, EarthGuard creates a complete ecosystem for earthquake preparedness and response.

**Core Innovation:** The world's first smartphone-based earthquake early warning system that automatically activates emergency mesh networking and AI rescue coordination when critical events are detected.

---

## 🎯 Problem Statement

### Current Gaps in Earthquake Response
- **No Early Warning:** Most regions lack earthquake early warning systems
- **Communication Blackout:** Cell towers fail, isolating survivors
- **Slow Response:** Emergency services take hours to assess damage and locate victims
- **Resource Misallocation:** No real-time visibility into survivor needs and available resources
- **Coordination Chaos:** Multiple agencies working with incomplete information

### Target Impact
- ⚡ **10-60 seconds** advance warning for earthquake detection
- 📡 **Zero-infrastructure** communication during disasters
- 🤖 **AI-powered** victim location and needs assessment
- 🚁 **Real-time** resource coordination between survivors and responders

---

## 🔧 Core Features

### 🌊 EarthquakeAI: Smartphone Seismic Network
- **Accelerometer Monitoring:** Continuous background sampling at 100Hz
- **P-Wave Detection:** ML model trained on seismic signatures
- **Collaborative Verification:** Cross-validation with nearby devices
- **False Positive Filtering:** Advanced algorithms to distinguish earthquakes from daily activities
- **Magnitude Estimation:** Crowd-sourced data for accurate assessments
- **Epicenter Triangulation:** Multiple device readings for precise location

### 📡 SignalMesh: Zero-Infrastructure Communication
**Auto-Activation Triggers:**
- Earthquake Magnitude ≥ 5.0
- Tsunami risk detected
- Cell tower failure
- Manual activation
- Regional cascade activation

**Advanced Features:**
- Adaptive protocols (Bluetooth, Wi-Fi Direct, emergency radio)
- Offline GPS integration
- Evacuation corridor optimization
- Cross-hazard messaging coordination

### 🌊 TsunamiGuard: Intelligent Wave Prediction & Evacuation
- **Seismic Trigger Analysis:** Evaluates earthquake parameters for tsunami potential
- **Ocean Proximity Detection:** GPS-based coastal zone identification
- **Real-time Wave Modeling:** Physics-based simulation of wave propagation
- **Evacuation Zone Mapping:** Dynamic safe zone calculations
- **Multi-language Broadcasts:** Automated translations for tourist areas
- **Crowd Density Management:** Real-time redistribution to prevent bottlenecks

### 🤖 RescueAI: Intelligent Emergency Response
**Victim Detection & Triage:**
- Automated SOS broadcasting every 60 seconds
- AI-powered medical severity assessment
- Trapped person detection via sensor analysis
- Resource needs prediction

**Smart Resource Matching:**
- Supply-demand mapping in real-time
- Optimal allocation algorithms
- Volunteer coordination with skill matching
- Emergency services integration

**Predictive Analytics:**
- Casualty estimation based on seismic parameters
- Infrastructure damage assessment
- Evacuation route optimization
- Recovery timeline prediction

---

## 🏗️ Architecture

```
EarthGuard/
├── backend/           # Flask/Python API server
│   ├── app.py        # Main server application
│   ├── models/       # ML models for earthquake/tsunami prediction
│   ├── services/     # Core business logic services
│   └── data/         # Static data files
├── frontend/         # Flutter mobile application
│   ├── lib/
│   │   ├── screens/  # UI screens
│   │   ├── services/ # Core detection & networking services
│   │   └── widgets/  # Reusable UI components
│   └── platforms/    # Platform-specific configurations
└── database/         # Database schema and sample data
```

---

## 🚀 Quick Start

### Prerequisites
- **Flutter SDK** (>=3.0.0)
- **Python 3.8+**
- **Android Studio** / VS Code
- **Git**

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/earthguard.git
cd earthguard
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
python app.py
```
Server will start on `http://localhost:8080`

### 3. Frontend Setup
On another terminal:
```bash
cd frontend
flutter pub get
flutter run
```

---


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
