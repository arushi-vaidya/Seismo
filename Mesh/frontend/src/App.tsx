import { AlertTriangle, Send, Shield, MapPin, Clock, Users, Phone, Zap, CheckCircle, Info, MessageSquare, Filter, User, Radio, Truck, Heart } from 'lucide-react'
import React, { useEffect, useState } from 'react'

interface Message {
  content: string;
  sender: string;
  userType: string;
  timestamp: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<string>('all')
  
  // Detect user type from URL parameter
  const urlParams = new URLSearchParams(window.location.search)
  const userType = urlParams.get('type') || 'civilian' // default to civilian

  // Both interfaces use the same backend port since P2P handles message routing
  const baseUrl = `http://localhost:3001`

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`${baseUrl}/messages`)
        .then(res => res.json())
        .then(data => {
          console.log(data)
          setMessages(data || [])
        })
        .catch(err => console.error('Error fetching messages:', err))
    }, 2000)
    return () => clearInterval(interval)
  }, [baseUrl])

  const sendMessage = async (messageText: string) => {
    if (messageText.trim() === '') return

    try {
      await fetch(`${baseUrl}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          userType: userType
        }),
      })
      setMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(message)
    }
  }

  const isTeam = userType === 'team'

  // Tab configuration for NDRF teams
  const teamTabs = [
    { id: 'all', label: 'All Messages', icon: <MessageSquare className="w-4 h-4" />, color: 'blue' },
    { id: 'civilian', label: 'All Civilians', icon: <User className="w-4 h-4" />, color: 'red' },
    { id: 'medical', label: 'Medical Team', icon: <Heart className="w-4 h-4" />, color: 'green' },
    { id: 'fire', label: 'Fire Dept', icon: <Zap className="w-4 h-4" />, color: 'orange' },
    { id: 'police', label: 'Police', icon: <Shield className="w-4 h-4" />, color: 'purple' },
    { id: 'logistics', label: 'Logistics', icon: <Truck className="w-4 h-4" />, color: 'yellow' }
  ]

  // Get unique civilian senders from messages
  const getCivilianSenders = () => {
    const civilians = messages.filter(msg => msg.userType === 'civilian')
    const uniqueSenders = [...new Set(civilians.map(msg => msg.sender))]
    return uniqueSenders.map(sender => ({
      id: `civilian_${sender}`,
      label: sender || 'Unknown',
      icon: <User className="w-4 h-4" />,
      color: 'red',
      count: civilians.filter(msg => msg.sender === sender).length
    }))
  }

  // Combined tabs: team tabs + individual civilian tabs
  const allTabs = [...teamTabs, ...getCivilianSenders()]

  // Filter messages based on active tab
  const filteredMessages = isTeam ? messages.filter(msg => {
    if (activeTab === 'all') return true
    if (activeTab === 'civilian') return msg.userType === 'civilian'
    if (activeTab.startsWith('civilian_')) {
      const senderName = activeTab.replace('civilian_', '')
      return msg.userType === 'civilian' && msg.sender === senderName
    }
    // For team types based on sender name
    if (activeTab === 'medical') return msg.sender?.toLowerCase().includes('medical') || msg.sender?.toLowerCase().includes('ambulance')
    if (activeTab === 'fire') return msg.sender?.toLowerCase().includes('fire') 
    if (activeTab === 'police') return msg.sender?.toLowerCase().includes('police')
    if (activeTab === 'logistics') return msg.sender?.toLowerCase().includes('logistics') || msg.sender?.toLowerCase().includes('supply')
    return msg.userType === 'team'
  }) : messages

  // Quick response options for NDRF teams
  const teamQuickResponses = [
    { text: "✅ Acknowledged - Team en route", icon: <CheckCircle className="w-4 h-4" /> },
    { text: "📍 Share your exact location", icon: <MapPin className="w-4 h-4" /> },
    { text: "ℹ️ Can you provide more details?", icon: <Info className="w-4 h-4" /> },
    { text: "👥 How many people need help?", icon: <Users className="w-4 h-4" /> },
    { text: "🩺 Are there any injuries?", icon: <Phone className="w-4 h-4" /> },
    { text: "⚡ Stay calm, help is coming!", icon: <Zap className="w-4 h-4" /> },
    { text: "🕒 ETA 10-15 minutes", icon: <Clock className="w-4 h-4" /> },
    { text: "📞 Call emergency services now", icon: <Phone className="w-4 h-4" /> }
  ]

  // Quick text options for civilians
  const civilianQuickTexts = [
    { text: "🆘 URGENT: Need immediate help!", icon: <AlertTriangle className="w-4 h-4" /> },
    { text: "🏠 Building collapse at my location", icon: <MapPin className="w-4 h-4" /> },
    { text: "🌊 Flood water rising rapidly", icon: <Zap className="w-4 h-4" /> },
    { text: "🔥 Fire emergency - need evacuation", icon: <Zap className="w-4 h-4" /> },
    { text: "🩹 Medical emergency - injuries", icon: <Phone className="w-4 h-4" /> },
    { text: "👥 Multiple people trapped", icon: <Users className="w-4 h-4" /> },
    { text: "🍽️ Need food and water supplies", icon: <Info className="w-4 h-4" /> },
    { text: "📍 Sharing my current location", icon: <MapPin className="w-4 h-4" /> },
    { text: "👶 Children and elderly need help", icon: <Users className="w-4 h-4" /> },
    { text: "🏥 Need medical assistance", icon: <Phone className="w-4 h-4" /> }
  ]

  const getMessageStyle = (msg: Message) => {
    if (msg.userType === 'team') {
      // Color code team messages based on sender type
      if (msg.sender?.toLowerCase().includes('medical') || msg.sender?.toLowerCase().includes('ambulance')) {
        return 'bg-gradient-to-r from-green-600 to-green-700 text-white ml-8 border-l-4 border-green-300 shadow-lg'
      }
      if (msg.sender?.toLowerCase().includes('fire')) {
        return 'bg-gradient-to-r from-orange-600 to-orange-700 text-white ml-8 border-l-4 border-orange-300 shadow-lg'
      }
      if (msg.sender?.toLowerCase().includes('police')) {
        return 'bg-gradient-to-r from-purple-600 to-purple-700 text-white ml-8 border-l-4 border-purple-300 shadow-lg'
      }
      if (msg.sender?.toLowerCase().includes('logistics') || msg.sender?.toLowerCase().includes('supply')) {
        return 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white ml-8 border-l-4 border-yellow-300 shadow-lg'
      }
      return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-8 border-l-4 border-blue-300 shadow-lg'
    } else if (msg.userType === 'civilian') {
      return 'bg-gradient-to-r from-red-600 to-red-700 text-white mr-8 border-l-4 border-red-300 shadow-lg'
    } else {
      return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white border-l-4 border-gray-300 shadow-lg'
    }
  }

  const getSenderIcon = (msg: Message) => {
    if (msg.userType === 'team') {
      if (msg.sender?.toLowerCase().includes('medical') || msg.sender?.toLowerCase().includes('ambulance')) return '🏥'
      if (msg.sender?.toLowerCase().includes('fire')) return '🚒'
      if (msg.sender?.toLowerCase().includes('police')) return '👮'
      if (msg.sender?.toLowerCase().includes('logistics') || msg.sender?.toLowerCase().includes('supply')) return '🚚'
      return '🛡️'
    } else if (msg.userType === 'civilian') {
      return '🆘'
    } else {
      return '💬'
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`min-h-screen w-full flex flex-col justify-center items-center ${
      isTeam ? 'bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900' : 'bg-gradient-to-br from-red-950 via-red-900 to-slate-900'
    }`}>
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] bg-[length:24px_24px]"></div>
      </div>
      
      <div className='relative flex flex-col h-[85vh] w-full max-w-6xl mx-4 border border-white/20 rounded-3xl overflow-hidden backdrop-blur-xl bg-white/5 shadow-2xl'>
        
        {/* Modern Header */}
        <div className={`flex items-center h-20 px-6 ${isTeam ? 'bg-gradient-to-r from-blue-800 to-blue-900' : 'bg-gradient-to-r from-red-700 to-red-800'} border-b border-white/20`}>
          <div className='flex items-center'>
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              {isTeam ? 
                <Shield className="text-yellow-400 w-8 h-8" /> : 
                <AlertTriangle className="text-yellow-400 w-8 h-8" />
              }
            </div>
            <div className='text-white ml-4'>
              <h1 className='text-2xl font-bold tracking-tight'>
                {isTeam ? 'DisasterNet - RESCUE COMMAND' : 'DisasterNet - EMERGENCY HELP'}
              </h1>
              <p className='text-sm opacity-90'>
                {isTeam ? 'Emergency Response & Coordination Center' : 'Connect with rescue teams instantly'}
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm">Live</span>
            </div>
            {isTeam && (
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                <Users className="w-4 h-4 text-white" />
                <span className="text-white text-sm">{messages.length} msgs</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation for NDRF Teams */}
        {isTeam && (
          <div className="px-6 py-3 bg-slate-800/80 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Filter Communications</span>
              </div>
              <div className="text-xs text-gray-400">
                Active: {filteredMessages.length} / {messages.length} messages
              </div>
            </div>
            
            {/* Main Team Tabs */}
            <div className="flex flex-wrap gap-2 mb-3">
              {teamTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? `bg-${tab.color}-600/30 text-${tab.color}-300 border-2 border-${tab.color}-500/50 scale-105`
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    {tab.id === 'all' ? messages.length : messages.filter(msg => {
                      if (tab.id === 'civilian') return msg.userType === 'civilian'
                      if (tab.id === 'medical') return msg.sender?.toLowerCase().includes('medical') || msg.sender?.toLowerCase().includes('ambulance')
                      if (tab.id === 'fire') return msg.sender?.toLowerCase().includes('fire')
                      if (tab.id === 'police') return msg.sender?.toLowerCase().includes('police')
                      if (tab.id === 'logistics') return msg.sender?.toLowerCase().includes('logistics') || msg.sender?.toLowerCase().includes('supply')
                      return false
                    }).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Individual Civilian Tabs */}
            {getCivilianSenders().length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-0.5 bg-red-400/50"></div>
                  <span className="text-xs font-medium text-red-400">Individual Civilians</span>
                  <div className="flex-1 h-0.5 bg-red-400/50"></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getCivilianSenders().map((civilian) => (
                    <button
                      key={civilian.id}
                      onClick={() => setActiveTab(civilian.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                        activeTab === civilian.id
                          ? 'bg-red-600/40 text-red-200 border border-red-500/50 scale-105'
                          : 'bg-red-600/10 text-red-400 border border-red-500/20 hover:bg-red-600/20 hover:text-red-300'
                      }`}
                    >
                      <User className="w-3 h-3" />
                      <span>{civilian.label}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                        activeTab === civilian.id ? 'bg-white/20' : 'bg-white/10'
                      }`}>
                        {civilian.count}
                      </span>
                      {/* Priority indicator for recent messages */}
                      {messages.filter(msg => msg.sender === civilian.label && msg.userType === 'civilian').some(msg => 
                        new Date().getTime() - new Date(msg.timestamp).getTime() < 300000 // 5 minutes
                      ) && (
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages Area */}
        <div className='flex-1 bg-gradient-to-b from-slate-800/50 to-slate-900/80 px-6 py-4 overflow-y-auto space-y-4 backdrop-blur-sm'>
          {Array.isArray(filteredMessages) && filteredMessages.length > 0 ? (
            filteredMessages.map((msg, idx) => (
              <div key={idx} className={`p-4 rounded-2xl transform transition-all duration-300 hover:scale-[1.02] ${getMessageStyle(msg)}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getSenderIcon(msg)}</span>
                    <span className="font-bold text-sm">
                      {msg.sender || 'Unknown'}
                    </span>
                    {msg.userType === 'civilian' && isTeam && (
                      <span className="px-2 py-1 bg-red-500/30 text-red-200 text-xs rounded-full border border-red-400/30">
                        EMERGENCY
                      </span>
                    )}
                  </div>
                  <span className="text-xs opacity-75 bg-black/20 px-2 py-1 rounded-full">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <div className="text-sm leading-relaxed font-medium">
                  {msg.content}
                </div>
              </div>
            ))
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl mb-4">
                  {isTeam ? (activeTab === 'civilian' ? '🆘' : activeTab === 'medical' ? '🏥' : activeTab === 'fire' ? '🚒' : activeTab === 'police' ? '👮' : activeTab === 'logistics' ? '🚚' : '🛡️') : '🆘'}
                </div>
                <h2 className="text-xl font-bold text-white">
                  {isTeam && activeTab !== 'all' ? 
                    (activeTab.startsWith('civilian_') ? 
                      `No messages from ${activeTab.replace('civilian_', '')}` :
                      `No ${allTabs.find(t => t.id === activeTab)?.label.toLowerCase()} messages`) : 
                    'No messages yet'}
                </h2>
                <p className="text-gray-400 max-w-md">
                  {isTeam ? 
                    (activeTab === 'all' ? 'Monitoring all emergency communications' : 
                     activeTab === 'civilian' ? 'Waiting for civilian emergency calls' :
                     activeTab.startsWith('civilian_') ? `Monitoring communications from ${activeTab.replace('civilian_', '')}` :
                     `No messages from ${allTabs.find(t => t.id === activeTab)?.label.toLowerCase()} yet`) : 
                    'Send a message to request emergency assistance from nearby rescue teams'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Responses for NDRF Teams */}
        {isTeam && (
          <div className="px-6 py-3 bg-slate-800/50 border-t border-white/10">
            <div className="flex items-center mb-2">
              <MessageSquare className="w-4 h-4 text-blue-400 mr-2" />
              <span className="text-sm text-blue-400 font-medium">Quick Responses</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {teamQuickResponses.map((response, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(response.text)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-sm rounded-xl border border-blue-500/30 transition-all duration-200 hover:scale-105"
                >
                  {response.icon}
                  <span>{response.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Emergency Texts for Civilians */}
        {!isTeam && (
          <div className="px-6 py-3 bg-slate-800/50 border-t border-white/10">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
              <span className="text-sm text-red-400 font-medium">Emergency Quick Texts</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {civilianQuickTexts.map((response, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(response.text)}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 text-sm rounded-xl border border-red-500/30 transition-all duration-200 hover:scale-105"
                >
                  {response.icon}
                  <span>{response.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className='px-6 py-4 bg-slate-900/80 border-t border-white/10 backdrop-blur-sm'>
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                placeholder={isTeam ? 'Type your response to the emergency...' : 'Describe your emergency situation in detail...'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={2}
                className='w-full p-4 rounded-2xl bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 border border-white/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none transition-all duration-200'
              />
            </div>
            <button 
              onClick={() => sendMessage(message)}
              disabled={!message.trim()}
              className={`p-4 rounded-2xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                isTeam ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
              } shadow-lg`}
            >
              <Send className='text-white w-6 h-6' />
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-6 px-4 w-full flex justify-center">
        <div className="max-w-4xl w-full bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className={`text-2xl font-bold mb-1 ${isTeam ? 'text-blue-400' : 'text-red-400'}`}>
                {isTeam ? '🛡️ RESCUE TEAM' : '🆘 EMERGENCY MODE'}
              </div>
              <p className="text-gray-300 text-sm">
                {isTeam ? 
                  'Monitor and respond to emergency requests' :
                  'Send emergency alerts to rescue teams'
                }
              </p>
            </div>
            <div>
              <div className="text-green-400 text-xl font-bold mb-1">
                🌐 P2P Network Active
              </div>
              <p className="text-gray-300 text-sm">
                Offline-first communication system
              </p>
            </div>
            <div>
              <div className="text-yellow-400 text-xl font-bold mb-1">
                📡 Signal: Strong
              </div>
              <p className="text-gray-300 text-sm">
                Connected to local mesh network
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App