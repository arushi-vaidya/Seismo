import { AlertTriangle, Send, Shield, MapPin, Clock, Users, Phone, Zap, CheckCircle, Info, MessageSquare, Filter, User, Radio, Truck, Heart, Navigation, Share, Copy, Loader, XCircle, Menu, X, Signal, Battery, Wifi, Globe, Mic, MicOff, Camera, Settings, Search, Bell, ChevronDown, ArrowUp, ArrowDown, Activity, Satellite } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'

interface Message {
  content: string;
  sender: string;
  userType: string;
  timestamp: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address?: string;
}

// Enhanced Location Sharing Component
const LocationSharing: React.FC<{
  onSendLocation: (message: string) => void;
  userType: 'team' | 'civilian';
  isCompact?: boolean;
}> = ({ onSendLocation, userType, isCompact = false }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isWatching, setIsWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setErrorMessage('Geolocation not supported');
      return;
    }

    setLocationStatus('loading');
    setErrorMessage('');

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };
        
        setLocation(locationData);
        setLocationStatus('success');
      },
      (error) => {
        setLocationStatus('error');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage('Location access denied');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage('Location unavailable');
            break;
          case error.TIMEOUT:
            setErrorMessage('Location timeout');
            break;
          default:
            setErrorMessage('Location error');
            break;
        }
      },
      options
    );
  };

  const formatLocationMessage = (loc: LocationData, type: 'quick' | 'detailed' | 'emergency'): string => {
    const accuracy = loc.accuracy < 100 ? 'High' : loc.accuracy < 500 ? 'Medium' : 'Low';
    
    if (type === 'quick') {
      return `📍 My location: ${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)} (±${Math.round(loc.accuracy)}m)`;
    }
    
    if (type === 'emergency') {
      return `🚨 EMERGENCY LOCATION 🚨\n📍 ${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}\n🎯 Accuracy: ±${Math.round(loc.accuracy)}m (${accuracy})\n⏰ ${new Date(loc.timestamp).toLocaleString()}\n🗺️ Google Maps: https://maps.google.com/?q=${loc.latitude},${loc.longitude}\n⚠️ NEED IMMEDIATE ASSISTANCE HERE`;
    }
    
    return `📍 DETAILED LOCATION\nCoordinates: ${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}\nAccuracy: ±${Math.round(loc.accuracy)}m (${accuracy})\nTime: ${new Date(loc.timestamp).toLocaleString()}\nGoogle Maps: https://maps.google.com/?q=${loc.latitude},${loc.longitude}`;
  };

  const sendLocation = (type: 'quick' | 'detailed' | 'emergency') => {
    if (!location) return;
    const message = formatLocationMessage(location, type);
    onSendLocation(message);
  };

  if (isCompact) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={getCurrentLocation}
          disabled={locationStatus === 'loading'}
          className={`group relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
            userType === 'team'
              ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-200 border border-blue-400/30 hover:border-blue-400/50'
              : 'bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 text-red-200 border border-red-400/30 hover:border-red-400/50'
          } hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {locationStatus === 'loading' ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform" />
          )}
          <span>GPS</span>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        
        {location && (
          <button
            onClick={() => sendLocation('quick')}
            className={`group relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              userType === 'team'
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-200 border border-green-400/30 hover:border-green-400/50'
                : 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 text-orange-200 border border-orange-400/30 hover:border-orange-400/50'
            } hover:scale-105 hover:shadow-lg`}
          >
            <Share className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Share</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`relative p-4 rounded-2xl border backdrop-blur-xl ${
        locationStatus === 'success' ? 'border-green-400/50 bg-green-500/10' :
        locationStatus === 'error' ? 'border-red-400/50 bg-red-500/10' :
        locationStatus === 'loading' ? 'border-yellow-400/50 bg-yellow-500/10' :
        'border-gray-400/30 bg-gray-500/10'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {locationStatus === 'loading' && <Loader className="w-5 h-5 animate-spin text-yellow-400" />}
            {locationStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
            {locationStatus === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
            {locationStatus === 'idle' && <MapPin className="w-5 h-5 text-gray-400" />}
            
            <span className="text-base font-semibold text-white">
              {locationStatus === 'loading' && 'Acquiring GPS Signal...'}
              {locationStatus === 'success' && 'Location Acquired'}
              {locationStatus === 'error' && 'Location Error'}
              {locationStatus === 'idle' && 'GPS Location Services'}
            </span>
          </div>
        </div>

        {location && (
          <div className="bg-black/20 rounded-xl p-3 font-mono text-sm">
            <div className="text-white font-bold text-base mb-1">
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </div>
            <div className="text-gray-300 text-xs">
              Accuracy: ±{Math.round(location.accuracy)}m • {new Date(location.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-3 p-3 bg-red-500/20 border border-red-400/30 rounded-xl">
            <p className="text-red-300 text-sm font-medium">{errorMessage}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={getCurrentLocation}
          disabled={locationStatus === 'loading'}
          className="group relative flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-400/30 hover:border-blue-400/50 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Navigation className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
          <span className="font-medium">Get GPS</span>
        </button>

        {location && (
          <button
            onClick={() => sendLocation('emergency')}
            className="group relative flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border border-red-400/30 hover:border-red-400/50 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <AlertTriangle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">EMERGENCY</span>
          </button>
        )}
      </div>
    </div>
  );
};

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<string>('all')
  const [showLocationPanel, setShowLocationPanel] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected')
  const [showNotifications, setShowNotifications] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Detect user type from URL parameter
  const urlParams = new URLSearchParams(window.location.search)
  const userType = urlParams.get('type') || 'civilian'

  const baseUrl = `http://localhost:3001`

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`${baseUrl}/messages`)
        .then(res => {
          if (!res.ok) throw new Error('Network error')
          return res.json()
        })
        .then(data => {
          setMessages(data || [])
          setConnectionStatus('connected')
        })
        .catch(err => {
          console.error('Error fetching messages:', err)
          setConnectionStatus('disconnected')
        })
    }, 2000)
    return () => clearInterval(interval)
  }, [baseUrl])

  const sendMessage = async (messageText: string) => {
    if (messageText.trim() === '') return

    try {
      setConnectionStatus('connecting')
      await fetch(`${baseUrl}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          userType: userType
        }),
      })
      setMessage('')
      setConnectionStatus('connected')
    } catch (err) {
      console.error('Error sending message:', err)
      setConnectionStatus('disconnected')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(message)
    }
  }

  const isTeam = userType === 'team'

  // Enhanced tab configuration
  const teamTabs = [
    { id: 'all', label: 'All Comms', icon: <MessageSquare className="w-4 h-4" />, color: 'blue', count: messages.length },
    { id: 'civilian', label: 'Civilians', icon: <User className="w-4 h-4" />, color: 'red', count: messages.filter(m => m.userType === 'civilian').length },
    { id: 'medical', label: 'Medical', icon: <Heart className="w-4 h-4" />, color: 'green', count: messages.filter(m => m.sender?.toLowerCase().includes('medical')).length },
    { id: 'fire', label: 'Fire Dept', icon: <Zap className="w-4 h-4" />, color: 'orange', count: messages.filter(m => m.sender?.toLowerCase().includes('fire')).length },
  ]

  // Filter messages based on active tab
  const filteredMessages = isTeam ? messages.filter(msg => {
    if (activeTab === 'all') return true
    if (activeTab === 'civilian') return msg.userType === 'civilian'
    if (activeTab === 'medical') return msg.sender?.toLowerCase().includes('medical')
    if (activeTab === 'fire') return msg.sender?.toLowerCase().includes('fire')
    return msg.userType === 'team'
  }) : messages

  // Enhanced quick responses
  const teamQuickResponses = [
    { text: "✅ Acknowledged - Team en route", icon: <CheckCircle className="w-4 h-4" />, color: 'green' },
    { text: "📍 Share your exact location", icon: <MapPin className="w-4 h-4" />, color: 'blue' },
    { text: "👥 How many people need help?", icon: <Users className="w-4 h-4" />, color: 'yellow' },
    { text: "🩺 Are there any injuries?", icon: <Heart className="w-4 h-4" />, color: 'red' },
    { text: "⚡ Stay calm, help is coming!", icon: <Zap className="w-4 h-4" />, color: 'orange' },
    { text: "🕒 ETA 10-15 minutes", icon: <Clock className="w-4 h-4" />, color: 'purple' },
  ]

  const civilianQuickTexts = [
    { text: "🆘 URGENT: Need immediate help!", icon: <AlertTriangle className="w-4 h-4" />, color: 'red' },
    { text: "🏠 Building collapse at my location", icon: <MapPin className="w-4 h-4" />, color: 'orange' },
    { text: "🌊 Flood water rising rapidly", icon: <Zap className="w-4 h-4" />, color: 'blue' },
    { text: "🔥 Fire emergency - need evacuation", icon: <Zap className="w-4 h-4" />, color: 'red' },
    { text: "🩹 Medical emergency - injuries", icon: <Heart className="w-4 h-4" />, color: 'pink' },
    { text: "👥 Multiple people trapped", icon: <Users className="w-4 h-4" />, color: 'yellow' },
  ]

  const getMessageStyle = (msg: Message) => {
    const baseStyle = "group relative p-4 rounded-2xl max-w-[85%] backdrop-blur-sm border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
    
    if (msg.userType === 'team') {
      if (msg.sender?.toLowerCase().includes('medical')) {
        return `${baseStyle} bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-400/30 text-white ml-8 hover:border-green-400/50`
      }
      if (msg.sender?.toLowerCase().includes('fire')) {
        return `${baseStyle} bg-gradient-to-br from-orange-500/20 to-red-600/20 border-orange-400/30 text-white ml-8 hover:border-orange-400/50`
      }
      return `${baseStyle} bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border-blue-400/30 text-white ml-8 hover:border-blue-400/50`
    } else if (msg.userType === 'civilian') {
      return `${baseStyle} bg-gradient-to-br from-red-500/20 to-pink-600/20 border-red-400/30 text-white mr-8 hover:border-red-400/50`
    }
    return `${baseStyle} bg-gradient-to-br from-gray-500/20 to-slate-600/20 border-gray-400/30 text-white hover:border-gray-400/50`
  }

  const getSenderIcon = (msg: Message) => {
    if (msg.userType === 'team') {
      if (msg.sender?.toLowerCase().includes('medical')) return '🏥'
      if (msg.sender?.toLowerCase().includes('fire')) return '🚒'
      if (msg.sender?.toLowerCase().includes('police')) return '👮'
      return '🛡️'
    }
    return '🆘'
  }

  return (
    <div className={`min-h-screen w-full relative overflow-hidden ${
      isTeam 
        ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900' 
        : 'bg-gradient-to-br from-slate-900 via-red-950 to-rose-900'
    }`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(120,119,198,0.1),_transparent_50%),radial-gradient(circle_at_80%_20%,_rgba(255,119,198,0.1),_transparent_50%),radial-gradient(circle_at_40%_40%,_rgba(120,200,255,0.1),_transparent_50%)]"></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 h-screen flex flex-col">
        
        {/* Enhanced Header */}
        <header className={`relative backdrop-blur-xl border-b border-white/10 ${
          isTeam 
            ? 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50' 
            : 'bg-gradient-to-r from-red-900/50 to-rose-900/50'
        }`}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              
              {/* Left Section - Logo and Title */}
              <div className="flex items-center space-x-4">
                <div className={`relative p-3 rounded-2xl backdrop-blur-sm border ${
                  isTeam 
                    ? 'bg-blue-500/20 border-blue-400/30' 
                    : 'bg-red-500/20 border-red-400/30'
                }`}>
                  {isTeam ? 
                    <Shield className="w-8 h-8 text-blue-300" /> : 
                    <AlertTriangle className="w-8 h-8 text-red-300" />
                  }
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 to-white/10"></div>
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {isTeam ? 'Rescue Command' : 'Emergency Alert'}
                  </h1>
                  <p className="text-sm text-gray-300">
                    {isTeam ? 'Emergency Response Center' : 'Connect with rescue teams'}
                  </p>
                </div>
              </div>

              {/* Center Section - Status Indicators */}
              <div className="hidden md:flex items-center space-x-4">
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl backdrop-blur-sm ${
                  connectionStatus === 'connected' ? 'bg-green-500/20 border border-green-400/30' :
                  connectionStatus === 'connecting' ? 'bg-yellow-500/20 border border-yellow-400/30' :
                  'bg-red-500/20 border border-red-400/30'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                    connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                    'bg-red-400'
                  }`}></div>
                  <span className="text-white text-sm font-medium capitalize">{connectionStatus}</span>
                </div>
                
                <div className="flex items-center space-x-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <Signal className="w-4 h-4 text-green-400" />
                  <span className="text-white text-sm">Strong</span>
                </div>
              </div>

              {/* Right Section - Controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowLocationPanel(!showLocationPanel)}
                  className={`group relative flex items-center space-x-2 px-4 py-2 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                    showLocationPanel 
                      ? 'bg-white/20 text-white border border-white/30' 
                      : 'bg-white/10 text-gray-300 hover:bg-white/15 border border-white/20'
                  }`}
                >
                  <Satellite className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline font-medium">GPS</span>
                </button>

                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105"
                >
                  <Bell className="w-4 h-4 text-white" />
                  {messages.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white/20"></div>
                  )}
                </button>

                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300"
                >
                  {isMenuOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>
          </div>

          {/* Location Panel */}
          {showLocationPanel && (
            <div className="border-t border-white/10 px-6 py-4 bg-black/20 backdrop-blur-xl">
              <LocationSharing onSendLocation={sendMessage} userType={userType} />
            </div>
          )}

          {/* Team Tabs */}
          {isTeam && (
            <div className="border-t border-white/10 px-6 py-3 bg-black/10">
              <div className="flex items-center space-x-2 mb-3">
                <Filter className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Communication Filters</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {teamTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${
                      activeTab === tab.id
                        ? `bg-${tab.color}-500/30 text-${tab.color}-200 border border-${tab.color}-400/50 shadow-lg`
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <div className="group-hover:scale-110 transition-transform">
                      {tab.icon}
                    </div>
                    <span>{tab.label}</span>
                    <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                      activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
                    }`}>
                      {tab.count}
                    </div>
                    {activeTab === tab.id && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 to-white/10"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* Messages Area */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.userType === 'team' ? 'justify-start' : 'justify-end'}`}>
                  <div className={getMessageStyle(msg)}>
                    {/* Message Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getSenderIcon(msg)}</span>
                        <div>
                          <span className="font-bold text-sm">{msg.sender || 'Unknown'}</span>
                          {msg.userType === 'civilian' && isTeam && (
                            <div className="inline-block ml-2 px-2 py-1 bg-red-500/40 text-red-200 text-xs rounded-full border border-red-400/30 font-medium animate-pulse">
                              EMERGENCY
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-xs opacity-75 bg-black/30 px-3 py-1 rounded-full font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    {/* Message Content */}
                    <div className="text-sm leading-relaxed font-medium whitespace-pre-wrap">
                      {msg.content}
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-6 max-w-md">
                  <div className="text-8xl mb-6 animate-bounce">
                    {isTeam ? '🛡️' : '🆘'}
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {isTeam && activeTab !== 'all' ? 
                      `No ${teamTabs.find(t => t.id === activeTab)?.label.toLowerCase()} messages` : 
                      isTeam ? 'Monitoring All Channels' : 'Ready to Send Emergency Alert'}
                  </h2>
                  <p className="text-gray-400 leading-relaxed">
                    {isTeam ? 
                      (activeTab === 'all' ? 'All emergency communications will appear here' : 
                       `Waiting for ${teamTabs.find(t => t.id === activeTab)?.label.toLowerCase()} communications`) : 
                      'Send a message to request emergency assistance from nearby rescue teams'}
                  </p>
                  
                  {!isTeam && (
                    <div className="flex items-center justify-center space-x-2 text-orange-400">
                      <Activity className="w-4 h-4 animate-pulse" />
                      <span className="text-sm font-medium">Rescue teams are standing by</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions Bar */}
          {(isTeam ? teamQuickResponses : civilianQuickTexts).length > 0 && (
            <div className="px-6 py-4 border-t border-white/10 bg-black/20 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <MessageSquare className={`w-4 h-4 ${isTeam ? 'text-blue-400' : 'text-red-400'}`} />
                  <span className={`text-sm font-medium ${isTeam ? 'text-blue-400' : 'text-red-400'}`}>
                    Quick {isTeam ? 'Responses' : 'Emergency Alerts'}
                  </span>
                </div>
                <LocationSharing onSendLocation={sendMessage} userType={userType} isCompact={true} />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {(isTeam ? teamQuickResponses : civilianQuickTexts).map((response, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(response.text)}
                    className={`group relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm border ${
                      isTeam 
                        ? `bg-${response.color}-500/20 hover:bg-${response.color}-500/30 text-${response.color}-200 border-${response.color}-400/30 hover:border-${response.color}-400/50`
                        : `bg-${response.color}-500/20 hover:bg-${response.color}-500/30 text-${response.color}-200 border-${response.color}-400/30 hover:border-${response.color}-400/50`
                    }`}
                  >
                    <div className="group-hover:scale-110 transition-transform">
                      {response.icon}
                    </div>
                    <span>{response.text}</span>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="px-6 py-4 border-t border-white/10 bg-black/30 backdrop-blur-xl">
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <textarea
                  placeholder={isTeam ? 'Type your response to the emergency...' : 'Describe your emergency situation in detail...'}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows={2}
                  className={`w-full p-4 pr-12 rounded-2xl backdrop-blur-sm text-white placeholder-gray-400 border transition-all duration-300 focus:outline-none focus:ring-2 resize-none ${
                    isTeam 
                      ? 'bg-blue-500/10 border-blue-400/30 focus:border-blue-400/50 focus:ring-blue-400/30'
                      : 'bg-red-500/10 border-red-400/30 focus:border-red-400/50 focus:ring-red-400/30'
                  }`}
                />
                
                {/* Character counter */}
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {message.length}/500
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => sendMessage(message)}
                  disabled={!message.trim() || connectionStatus === 'connecting'}
                  className={`group relative p-4 rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                    isTeam 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-blue-500/25'
                      : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25'
                  }`}
                >
                  {connectionStatus === 'connecting' ? (
                    <Loader className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Send className="w-6 h-6 text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  )}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
                
                {/* Voice input button (placeholder) */}
                <button className="p-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105">
                  <Mic className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Enhanced Status Footer */}
        <footer className="border-t border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className={`text-xl font-bold ${isTeam ? 'text-blue-400' : 'text-red-400'}`}>
                  {isTeam ? '🛡️ RESCUE' : '🆘 EMERGENCY'}
                </div>
                <p className="text-xs text-gray-400">
                  {isTeam ? 'Command Center' : 'Alert System'}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="text-green-400 text-lg font-bold flex items-center justify-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <span>P2P Active</span>
                </div>
                <p className="text-xs text-gray-400">Mesh Network</p>
              </div>
              
              <div className="space-y-1">
                <div className="text-yellow-400 text-lg font-bold flex items-center justify-center space-x-1">
                  <Signal className="w-4 h-4" />
                  <span>Strong</span>
                </div>
                <p className="text-xs text-gray-400">Signal Quality</p>
              </div>
              
              <div className="space-y-1">
                <div className="text-purple-400 text-lg font-bold flex items-center justify-center space-x-1">
                  <Satellite className="w-4 h-4 animate-pulse" />
                  <span>GPS Ready</span>
                </div>
                <p className="text-xs text-gray-400">Location Services</p>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-80 h-full bg-slate-900/95 backdrop-blur-xl border-l border-white/10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Menu</h3>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              
              {/* Mobile menu content */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-sm font-medium text-white mb-2">Connection Status</h4>
                  <div className={`flex items-center space-x-2 ${
                    connectionStatus === 'connected' ? 'text-green-400' :
                    connectionStatus === 'connecting' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                      connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                      'bg-red-400'
                    }`}></div>
                    <span className="text-sm font-medium capitalize">{connectionStatus}</span>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-sm font-medium text-white mb-2">Network Info</h4>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex justify-between">
                      <span>Messages:</span>
                      <span className="text-white font-medium">{messages.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mode:</span>
                      <span className="text-white font-medium">{isTeam ? 'Rescue Team' : 'Civilian'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  )
}

export default App