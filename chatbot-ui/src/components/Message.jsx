const Message = ({ type, text }) => {
  const isUser = type === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs px-4 py-2 rounded-lg text-sm 
        ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'}`}>
        {text}
      </div>
    </div>
  );
};

export default Message;
