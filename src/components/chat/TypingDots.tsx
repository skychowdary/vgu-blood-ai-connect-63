export default function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.2s]"></span>
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.1s]"></span>
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>
    </span>
  );
}