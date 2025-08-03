import { AlertTriangle, Send, Users } from 'lucide-react'
import React, { useEffect, useState } from 'react'

interface Message {
  content: string;
  userType: string;
  timestamp: string;
  sender: string;
}

function CivilianApp() {
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://localhost:3001/messages?userType=civilian')
        .then(res => res.json())
        .then(data => {
          console.log(data)
          setMessages(data || [])
        })
        .catch(err => console.error('Error fetching messages:', err))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const sendMessage = async () => {
    if (message.trim() === '') return

    try {
      await fetch('http://localhost:3001/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          userType: 'civilian'
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

  return (
    <div className='min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-tr from-red-950 to-red-500'>
      <div className='flex flex-col h-[80vh] sm:w-[80vw] lg:w-[60vw] border-4 border-black rounded-3xl overflow-hidden my-8'>
        
        {/* Header - Civilian Version */}
        <div className='flex h-[10%] bg-red-700'>
          <div className='my-auto ml-4'>
            <AlertTriangle className="text-yellow-400 w-12 h-12" />
          </div>
          <div className='text-white ml-4 my-2'>
            <p className='text-3xl font-bold'>DisasterNet - EMERGENCY HELP</p>
            <p className='text-md'>Request Emergency Assistance</p>
          </div>
        </div>

        {/* Messages Section */}
        <div className='h-[80%] bg-slate-700 px-6 py-4 overflow-y-auto space-y-2'>
          {Array.isArray(messages) ? (
            messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-md ${
                  msg.userType === 'civilian' 
                    ? 'bg-orange-600 text-white ml-8' 
                    : 'bg-green-600 text-white mr-8'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-sm">
                    {msg.userType === 'civilian' ? '🆘 YOU' : '🛡️ RESCUE TEAM'}
                  </span>
                  <span className="text-xs opacity-75">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div>{msg.content}</div>
              </div>
            ))
          ) : (
            <div className="text-red-400">No messages available</div>
          )}
        </div>

        {/* Input Section */}
        <div className='h-[10%] bg-slate-800 flex items-center px-6'>
          <input
            type='text'
            placeholder='Describe your emergency situation...'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className='w-full p-2 rounded-lg bg-slate-600 text-white placeholder-gray-300'
          />
          <button onClick={sendMessage} className='ml-4 p-2 bg-red-600 rounded-lg hover:bg-red-700'>
            <Send className='text-white w-6 h-6' />
          </button>
        </div>
      </div>

      <div className="mt-6 px-4 w-full flex justify-center my-8">
        <div className="max-w-2xl w-full bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-md text-center">
          <p className="text-xl md:text-2xl font-bold mb-2 text-red-400">
            🆘 EMERGENCY COMMUNICATION
          </p>
          <p className="text-base md:text-lg text-gray-300 mb-4">
            Send distress signals to rescue teams in your area. Help is on the way!
          </p>
          <div className="bg-red-800/30 p-4 rounded-lg">
            <p className="text-sm text-yellow-300 font-medium">
              📍 Your location and messages are being transmitted to nearby rescue teams
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CivilianApp