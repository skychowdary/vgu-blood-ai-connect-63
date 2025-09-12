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
    <div className="sticky bottom-0 z-10 border-t bg-white p-4">
      <div className="mx-auto flex max-w-[820px] items-end gap-3">
        <textarea
          ref={ta}
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={onKey}
          placeholder="Ask anything (e.g., Find O+ donors in Mechanical)…"
          className="flex-1 resize-none rounded-xl border border-gray-300 bg-white p-3 leading-6 outline-none focus:border-[#A63C3C] focus:ring-2 focus:ring-[#A63C3C]/20 disabled:opacity-50"
          rows={1}
          disabled={disabled}
        />
        <button
          onClick={submit}
          disabled={disabled || !val.trim()}
          className="rounded-xl bg-[#7B2B2B] px-4 py-3 font-semibold text-white hover:bg-[#A63C3C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          aria-label="Send message"
        >
          <Send size={16} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
      <p className="mx-auto mt-2 max-w-[820px] text-xs text-gray-500">
        Enter to send • Shift+Enter for new line
      </p>
    </div>
  );
}