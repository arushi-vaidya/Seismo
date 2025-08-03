# 🆘 DisasterNet - Offline Emergency Communication System

An **offline-first, peer-to-peer emergency communication system** built to enable communication in disaster-prone areas where internet connectivity is unavailable. DisasterNet uses libp2p for decentralized networking and provides separate interfaces for rescue teams and civilians.

![DisasterNet Demo](ui.png)

## 🌟 Features

- **🔌 Offline-First**: Works without internet connectivity
- **🌐 Peer-to-Peer**: Direct device-to-device communication
- **🛡️ Dual Interface**: Separate interfaces for rescue teams and civilians  
- **🔍 Auto-Discovery**: Automatic peer discovery using mDNS
- **💬 Real-time Messaging**: Instant message delivery across the network
- **📱 Web-Based UI**: Modern, responsive React frontend
- **📊 Message Logging**: Automatic backup of all communications
- **🔄 Multi-Platform**: Runs on Windows, macOS, and Linux

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Civilian UI   │    │    Team UI      │    │   Additional    │
│   (Frontend)    │    │   (Frontend)    │    │     Peers       │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │     HTTP API Server       │
                    │    (Backend - Go)         │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │    libp2p P2P Network     │
                    │   (mDNS + GossipSub)      │
                    └───────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Go 1.19+** - [Download here](https://golang.org/dl/)
- **Node.js 16+** - [Download here](https://nodejs.org/)
- **npm or yarn** - Comes with Node.js

### 1. Clone the Repository

```bash
git clone https://github.com/arushi-vaidya/Seismo
cd DisasterNet
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
go mod download
```

#### Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 3. Start the System

#### Option A: Single Command Setup 

**Terminal 1** - Start Backend:
```bash
cd cmd/disasternet
go run main.go --port 9000 --same_string emergency --room disaster-relief --nick "DisasterNet-Hub" --enable-http true
```

**Terminal 2** - Start Frontend:
```bash
cd frontend
npm run dev
```

#### Option B: Multi-Peer Setup

**Terminal 1** - Main Backend:
```bash
cd cmd/disasternet
go run main.go --port 9000 --same_string emergency --room disaster-relief --nick "NDRF-Team" --enable-http true
```

**Terminal 2** - Additional Peer:
```bash
cd cmd/disasternet
go run main.go --port 9001 --same_string emergency --room disaster-relief --nick "Fire-Department"
```

**Terminal 3** - Another Peer:
```bash
cd cmd/disasternet
go run main.go --port 9002 --same_string emergency --room disaster-relief --nick "Medical-Team"
```

**Terminal 4** - Frontend:
```bash
cd frontend
npm run dev
```

### 4. Access the Interfaces

Open your browser and navigate to:

- **🛡️ Rescue Team Interface**: [`http://localhost:5173?type=team`](http://localhost:5173?type=team)
- **🆘 Civilian Interface**: [`http://localhost:5173?type=civilian`](http://localhost:5173?type=civilian)

## 🎮 Usage Guide

### For Rescue Teams (Team Interface)

1. **Access**: Open `http://localhost:5173?type=team`
2. **Features**:
   - 🔵 Blue-themed interface with shield icon
   - View all messages from civilians and other team members
   - Send coordinated responses to emergency requests
   - Monitor all network communication

### For Civilians (Civilian Interface)

1. **Access**: Open `http://localhost:5173?type=civilian`
2. **Features**:
   - 🔴 Red-themed interface with alert icon
   - Send emergency distress signals
   - Receive responses from rescue teams
   - Simple, stress-friendly interface

### Message Flow Example

```
Civilian sends: "Building collapsed, need help at Main Street 123"
    ↓
P2P Network broadcasts to all peers
    ↓
Team receives message and responds: "Rescue team dispatched, ETA 10 minutes"
    ↓
Civilian receives confirmation
```

## ⚙️ Configuration Options

### Backend Flags

| Flag | Description | Example | Required |
|------|-------------|---------|----------|
| `--port` | P2P network port | `9000` | ✅ |
| `--same_string` | Network discovery string | `emergency` | ✅ |
| `--room` | Chat room name | `disaster-relief` | ✅ |
| `--nick` | Peer nickname | `NDRF-Team` | ✅ |
| `--enable-http` | Enable HTTP API server | `true` | ⚠️ (One peer only) |

### Example Command
```bash
go run main.go --port 9000 --same_string emergency --room disaster-relief --nick "Rescue-Team-Alpha" --enable-http true
```

## 🔧 Technical Details

### Backend (Go)

- **Framework**: libp2p-go for P2P networking
- **Discovery**: mDNS (Multicast DNS) for peer discovery
- **Messaging**: GossipSub pubsub protocol
- **API**: HTTP REST API for frontend communication
- **Storage**: File-based message logging

### Frontend (React + TypeScript)

- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **API Communication**: Fetch API with polling

### Key Technologies

- **[libp2p](https://libp2p.io/)**: Modular P2P networking stack
- **[mDNS](https://tools.ietf.org/html/rfc6763)**: Local network service discovery
- **[GossipSub](https://github.com/libp2p/specs/blob/master/pubsub/gossipsub/README.md)**: Efficient pubsub messaging
- **[React](https://reactjs.org/)**: Modern frontend framework
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework

## 📁 Project Structure

```
DisasterNet/
├── cmd/
│   ├── disasternet/
│   │   ├── main.go              # Main backend application
│   │   └── logs.txt             # Message logs (auto-generated)
│   └── node/
│       └── main.go              # Simple P2P node (testing)
├── internal/
│   └── p2p/
│       ├── host.go              # P2P host creation
│       ├── mdns.go              # Peer discovery
│       └── pubsub.go            # Chat room & messaging
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main React application
│   │   ├── main.tsx             # React entry point
│   │   └── index.css            # Styles
│   ├── package.json             # Frontend dependencies
│   └── vite.config.ts           # Vite configuration
├── go.mod                       # Go module definition
├── go.sum                       # Go dependencies
└── README.md                    # This file
```

