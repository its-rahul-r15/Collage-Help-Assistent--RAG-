import { useState } from 'react';

const InputBox = ({ onSend }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-800 flex gap-2">
      <input
        className="flex-1 p-2 rounded bg-gray-700 text-white focus:outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
      />
      <button className="bg-blue-500 px-4 py-2 rounded text-white" type="submit">
        Send
      </button>
    </form>
  );
};

export default InputBox;
