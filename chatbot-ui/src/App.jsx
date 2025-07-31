import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import InputBox from './components/InputBox';
import TypingIndicator from './components/TypingIndicator';

const App = () => {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! How can I help you today?' }
  ]);

  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (userText) => {
    setMessages(prev => [...prev, { type: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const res = await fetch('https://collage-help-assistent-rag.onrender.com/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userText }),
      });

      const data = await res.json();

      setMessages(prev => [...prev, { type: 'bot', text: data.answer }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { type: 'bot', text: '⚠️ Failed to fetch response. Please try again later.' }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <h2 className="text-xl p-4 font-bold bg-gray-800">🧠 My Chatbot</h2>
      <ChatWindow messages={messages} isTyping={isTyping} />
      <InputBox onSend={handleSend} />
    </div>
  );
};

export default App;