import { AlertTriangle, Send, Shield } from 'lucide-react'
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

  const sendMessage = async () => {
    if (message.trim() === '') return

    try {
      await fetch(`${baseUrl}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          userType: userType
        }),
      })
      setMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  const isTeam = userType === 'team'

  const getMessageStyle = (msg: Message) => {
    if (msg.userType === 'team') {
      return 'bg-blue-600 text-white ml-8 border-l-4 border-blue-300'
    } else if (msg.userType === 'civilian') {
      return 'bg-red-600 text-white mr-8 border-l-4 border-red-300'
    } else {
      return 'bg-gray-600 text-white border-l-4 border-gray-300'
    }
  }

  const getSenderIcon = (msg: Message) => {
    if (msg.userType === 'team') {
      return '🛡️'
    } else if (msg.userType === 'civilian') {
      return '🆘'
    } else {
      return '💬'
    }
  }

  return (
    <div className={`min-h-screen w-full flex flex-col justify-center items-center ${
      isTeam ? 'bg-gradient-to-tr from-blue-950 to-blue-600' : 'bg-gradient-to-tr from-red-950 to-red-500'
    }`}>
      <div className='flex flex-col h-[80vh] sm:w-[80vw] lg:w-[60vw] border-4 border-black rounded-3xl overflow-hidden my-8'>
        
        <div className={`flex h-[10%] ${isTeam ? 'bg-blue-800' : 'bg-red-700'}`}>
          <div className='my-auto ml-4'>
            {isTeam ? 
              <Shield className="text-yellow-400 w-12 h-12" /> : 
              <AlertTriangle className="text-yellow-400 w-12 h-12" />
            }
          </div>
          <div className='text-white ml-4 my-2'>
            <p className='text-3xl font-bold'>
              {isTeam ? 'DisasterNet - RESCUE TEAM' : 'DisasterNet - EMERGENCY HELP'}
            </p>
            <p className='text-md'>
              {isTeam ? 'Emergency Response Command Center' : 'Request Emergency Assistance'}
            </p>
          </div>
        </div>

        <div className='h-[80%] bg-slate-700 px-6 py-4 overflow-y-auto space-y-3'>
          {Array.isArray(messages) && messages.length > 0 ? (
            messages.map((msg, idx) => (
              <div key={idx} className={`p-4 rounded-lg ${getMessageStyle(msg)}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-sm flex items-center gap-2">
                    <span className="text-lg">{getSenderIcon(msg)}</span>
                    {msg.sender || 'Unknown'}
                  </span>
                  <span className="text-xs opacity-75">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm leading-relaxed">
                  {msg.content}
                </div>
                {msg.userType === 'civilian' && isTeam && (
                  <div className="mt-2 text-xs bg-red-800/50 px-2 py-1 rounded">
                    🚨 EMERGENCY REQUEST
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 mt-8">
              <div className="text-4xl mb-4">
                {isTeam ? '🛡️' : '🆘'}
              </div>
              <p>No messages yet...</p>
              <p className="text-sm mt-2">
                {isTeam ? 
                  'Waiting for emergency calls from civilians' : 
                  'Send a message to request emergency assistance'
                }
              </p>
            </div>
          )}
        </div>

        <div className='h-[10%] bg-slate-800 flex items-center px-6'>
          <input
            type='text'
            placeholder={isTeam ? 'Team response message...' : 'Describe your emergency situation...'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className='w-full p-3 rounded-lg bg-slate-600 text-white placeholder-gray-300 border border-slate-500 focus:border-blue-400 focus:outline-none'
          />
          <button 
            onClick={sendMessage} 
            className={`ml-4 p-3 rounded-lg transition-colors ${
              isTeam ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <Send className='text-white w-6 h-6' />
          </button>
        </div>
      </div>

      <div className="mt-6 px-4 w-full flex justify-center my-8">
        <div className="max-w-2xl w-full bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-md text-center">
          <p className={`text-xl md:text-2xl font-bold mb-2 ${isTeam ? 'text-blue-400' : 'text-red-400'}`}>
            {isTeam ? '🛡️ RESCUE TEAM INTERFACE' : '🆘 EMERGENCY COMMUNICATION'}
          </p>
          <p className="text-base md:text-lg text-gray-300 mb-4">
            {isTeam ? 
              'Monitor and respond to civilian emergency requests' :
              'Send emergency alerts to rescue teams in your area'
            }
          </p>
          <div className="text-sm text-gray-400">
            Connected to P2P Network | Active as: {isTeam ? 'Rescue Team' : 'Civilian'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App