import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

function ChatApp() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Halo rek! NgalamBot siap membantu disini' },
  ]);
  const [input, setInput] = useState('');
  const [loadingDots, setLoadingDots] = useState(''); // State for loading dots animation
  const [isWaiting, setIsWaiting] = useState(false); // State to track waiting status

  // Reference to the container that holds the messages
  const messagesEndRef = useRef(null);

  // Function to parse and sanitize Markdown content
  const parseMarkdown = (content) => {
    const htmlContent = marked.parse(content); // Parse Markdown to HTML
    return { __html: DOMPurify.sanitize(htmlContent) }; // Sanitize the HTML
  };

  // Scroll to bottom of chat whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Effect to handle loading dots animation
  useEffect(() => {
    if (isWaiting) {
      const interval = setInterval(() => {
        setLoadingDots((prev) => (prev.length < 3 ? prev + '.' : '')); // Append dots up to 3
      }, 500); // Update every 0.5 seconds
      return () => clearInterval(interval);
    } else {
      setLoadingDots(''); // Reset dots when no longer waiting
    }
  }, [isWaiting]);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { role: 'user', content: input };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
  
      // Add an assistant message with initial "Sek yo" content
      const assistantMessage = { role: 'assistant', content: 'Sek yo' };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsWaiting(true); // Set waiting state to true to start loading dots animation
  
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/chat_stream`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: input }),
          signal: AbortSignal.timeout(60000), // 60 second timeout
        });
  
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';
  
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;
  
          // Update the last message (assistant) incrementally with streamed content
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = accumulatedContent;
            return newMessages;
          });

          setIsWaiting(false); // Stop waiting once the response starts streaming
        }
      } catch (error) {
        console.error(error);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Sorry, there was an error processing your request.',
          },
        ]);
        setIsWaiting(false); // Ensure loading state is turned off on error
      }
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto py-6 space-y-4 px-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-sm rounded-lg p-4 text-sm ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 shadow-md'
                  }`}
                >
                  {message.role === 'user' ? (
                    message.content
                  ) : (
                    <div 
                      dangerouslySetInnerHTML={parseMarkdown(
                        // Show "Sek yo..." with dots if still waiting, otherwise show content
                        isWaiting && index === messages.length - 1
                          ? `Sek yo${loadingDots}`
                          : message.content
                      )}
                      className="prose prose-sm max-w-none" // Tailwind prose styling
                    />
                  )}
                </div>
              </div>
            ))}
            {/* Empty div used as a reference to scroll into view */}
            <div ref={messagesEndRef} />
          </div>
          <div className="py-4 px-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-4 py-2 text-sm"
              />
              <button
                onClick={handleSend}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Send
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ChatApp;
