# backend/app.py
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
import sqlite3
import json
from datetime import datetime
import math

app = Flask(__name__)
app.config['SECRET_KEY'] = 'earthguard_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*")

# Database initialization
def init_db():
    conn = sqlite3.connect('earthguard.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS earthquake_events (
            id INTEGER PRIMARY KEY,
            magnitude REAL,
            latitude REAL,
            longitude REAL,
            depth REAL,
            timestamp TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mesh_messages (
            id INTEGER PRIMARY KEY,
            message_id TEXT,
            type TEXT,
            content TEXT,
            latitude REAL,
            longitude REAL,
            timestamp TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rescue_reports (
            id INTEGER PRIMARY KEY,
            victim_id TEXT,
            status TEXT,
            needs TEXT,
            latitude REAL,
            longitude REAL,
            timestamp TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

@app.route('/')
def home():
    return jsonify({
        'message': 'EarthGuard Backend Server',
        'status': 'running',
        'version': '1.0.0'
    })

@app.route('/api/earthquake/report', methods=['POST'])
def report_earthquake():
    data = request.json
    
    conn = sqlite3.connect('earthguard.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO earthquake_events 
        (magnitude, latitude, longitude, depth, timestamp)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        data['magnitude'],
        data['latitude'],
        data['longitude'],
        data.get('depth', 10),
        datetime.now().isoformat()
    ))
    conn.commit()
    conn.close()
    
    # Broadcast to all connected clients
    socketio.emit('earthquake_alert', data)
    
    print(f"📊 Earthquake reported: Magnitude {data['magnitude']}")
    return jsonify({'status': 'success'})

@app.route('/api/mesh/message', methods=['POST'])
def mesh_message():
    data = request.json
    
    conn = sqlite3.connect('earthguard.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO mesh_messages 
        (message_id, type, content, latitude, longitude, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        data['id'],
        data['type'],
        data['content'],
        data['latitude'],
        data['longitude'],
        datetime.now().isoformat()
    ))
    conn.commit()
    conn.close()
    
    # Broadcast to mesh network
    socketio.emit('mesh_message', data)
    
    print(f"📡 Mesh message: {data['type']} - {data['content'][:50]}...")
    return jsonify({'status': 'success'})

@app.route('/api/rescue/report', methods=['POST'])
def rescue_report():
    data = request.json
    
    conn = sqlite3.connect('earthguard.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO rescue_reports 
        (victim_id, status, needs, latitude, longitude, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        data['victim_id'],
        data['status'],
        json.dumps(data['needs']),
        data['latitude'],
        data['longitude'],
        datetime.now().isoformat()
    ))
    conn.commit()
    conn.close()
    
    # Broadcast to rescue coordinators
    socketio.emit('rescue_report', data)
    
    print(f"🚨 Rescue report: {data['status']} at ({data['latitude']}, {data['longitude']})")
    return jsonify({'status': 'success'})

@app.route('/api/tsunami/assess', methods=['POST'])
def assess_tsunami():
    data = request.json
    magnitude = data['magnitude']
    depth = data['depth']
    distance_km = data['distance_km']
    
    # Tsunami risk assessment logic
    risk_level = 'none'
    arrival_time = None
    
    if magnitude >= 7.0 and depth <= 70 and distance_km <= 1000:
        if magnitude >= 9.0 and distance_km < 100:
            risk_level = 'extreme'
        elif magnitude >= 8.5 and distance_km < 200:
            risk_level = 'high'
        elif magnitude >= 8.0 and distance_km < 300:
            risk_level = 'moderate'
        elif magnitude >= 7.5 and distance_km < 500:
            risk_level = 'low'
        
        if risk_level != 'none':
            # Calculate wave arrival time (simplified)
            wave_speed_kmph = math.sqrt(9.8 * depth * 1000) * 3.6
            arrival_time = distance_km / wave_speed_kmph * 60  # minutes
    
    response = {
        'risk_level': risk_level,
        'arrival_time_minutes': arrival_time,
        'evacuation_zones': [
            {
                'name': 'Highland Community Center',
                'latitude': data['latitude'] + 0.01,
                'longitude': data['longitude'] + 0.01,
                'elevation': 50,
                'distance_km': 2.5
            }
        ] if risk_level != 'none' else []
    }
    
    print(f"🌊 Tsunami assessment: {risk_level} risk for magnitude {magnitude}")
    return jsonify(response)

# WebSocket events
@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('connected', {'data': 'Connected to EarthGuard server'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('join_mesh')
def handle_join_mesh(data):
    emit('mesh_joined', {'node_id': data['node_id']})

if __name__ == '__main__':
    print("🌍 Starting EarthGuard Backend Server...")
    print("=" * 50)
    
    init_db()
    
    # Changed port from 5000 to 8080 to avoid macOS AirPlay conflict
    PORT = 8080
    print(f"🚀 Server starting on http://localhost:{PORT}")
    print("📊 Available endpoints:")
    print("  GET  /              - Server info")
    print("  POST /api/earthquake/report  - Report earthquake")
    print("  POST /api/mesh/message       - Send mesh message")
    print("  POST /api/rescue/report      - Submit rescue report")
    print("  POST /api/tsunami/assess     - Assess tsunami risk")
    print("")
    print("Press Ctrl+C to stop the server")
    print("=" * 50)
    
    try:
        socketio.run(app, debug=True, host='0.0.0.0', port=PORT)
    except KeyboardInterrupt:
        print("\n👋 Server stopped gracefully")