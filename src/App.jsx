import { useState } from 'react'

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I assist you today?' },
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { role: 'user', content: input }])
      setInput('')
      // Here you would typically call your RAG function to get a response
      // For this example, we'll just simulate a response after a short delay
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: 'This is a simulated RAG response.' }])
      }, 1000)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">RAG Chat</h1>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto py-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-sm rounded-lg p-3 ${
                    message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-900'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          <div className="py-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <button
                onClick={handleSend}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
               
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}