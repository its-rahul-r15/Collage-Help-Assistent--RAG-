const TypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-700 text-white text-sm px-4 py-2 rounded-lg inline-flex gap-1 animate-pulse">
        <span>Typing</span>
        <span className="animate-bounce delay-100">.</span>
        <span className="animate-bounce delay-200">.</span>
        <span className="animate-bounce delay-300">.</span>
      </div>
    </div>
  );
};

export default TypingIndicator;
