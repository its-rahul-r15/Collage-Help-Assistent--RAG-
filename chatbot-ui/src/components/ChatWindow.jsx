import React, { useEffect, useRef } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';

const ChatWindow = ({ messages, isTyping }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
      {messages.map((msg, index) => (
        <Message key={index} type={msg.type} text={msg.text} />
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={bottomRef}></div>
    </div>
  );
};

export default ChatWindow;
