import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

export default function ChatInput({ 
  onSend, 
  disabled 
}: { 
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [val, setVal] = useState("");
  const ta = useRef<HTMLTextAreaElement>(null);

  // auto-resize
  useEffect(() => {
    if (!ta.current) return;
    ta.current.style.height = "0px";
    ta.current.style.height = Math.min(200, ta.current.scrollHeight) + "px";
  }, [val]);

  function submit() {
    const text = val.trim();
    if (!text || disabled) return;
    onSend(text);
    setVal("");
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); 
      submit();
    }
  }

  return (
    <div className="sticky bottom-0 z-10 border-t bg-white/95 backdrop-blur-sm p-3 sm:p-4 flex-shrink-0">
      <div className="mx-auto flex max-w-[820px] items-center gap-2 sm:gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={ta}
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask anything about blood donors (e.g., Find O+ donors in Mechanical branch)…"
            className="w-full resize-none rounded-xl border border-gray-300 bg-white p-3 sm:p-4 leading-6 outline-none focus:border-[#A63C3C] focus:ring-2 focus:ring-[#A63C3C]/20 disabled:opacity-50 text-sm sm:text-base min-h-[44px] max-h-[120px]"
            rows={1}
            disabled={disabled}
          />
        </div>
        <button
          onClick={submit}
          disabled={disabled || !val.trim()}
          className="rounded-xl bg-[#7B2B2B] px-3 py-3 sm:px-4 sm:py-3 font-semibold text-white hover:bg-[#A63C3C] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 h-[44px] sm:h-auto hover:scale-105 active:scale-95 flex-shrink-0"
          aria-label="Send message"
        >
          <Send size={16} className="sm:mr-1" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
}