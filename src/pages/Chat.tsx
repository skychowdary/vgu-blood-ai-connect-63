import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ChatHeader from "../components/chat/ChatHeader";
import ChatMessage from "../components/chat/ChatMessage";
import ChatInput from "../components/chat/ChatInput";
import TypingDots from "../components/chat/TypingDots";
import { cfg } from "../lib/config";

type Msg = { 
  id: string; 
  role: "user" | "assistant"; 
  content: string; 
  sql?: string; 
  rows?: any[]; 
  ts?: string 
};

export default function Chat() {
  const { toast } = useToast();
  const [items, setItems] = useState<Msg[]>([
    { 
      id: "welcome", 
      role: "assistant", 
      content: "Hi! I'm your AI blood donor assistant. Ask me things like:\n\n• \"Find O+ donors in Mechanical branch\"\n• \"Show emergency requests from today\"\n• \"List all B- donors with phone numbers\"\n\nI'll query the database and make phone numbers clickable for WhatsApp!", 
      ts: new Date().toLocaleTimeString()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // auto-scroll to bottom
  useEffect(() => {
    if (scroller.current) {
      scroller.current.scrollTo({ 
        top: scroller.current.scrollHeight, 
        behavior: "smooth" 
      });
    }
  }, [items, loading]);

  async function ask(text: string) {
    const now = new Date().toLocaleTimeString();
    const user: Msg = { 
      id: crypto.randomUUID(), 
      role: "user", 
      content: text, 
      ts: now 
    };
    
    setItems(prev => [...prev, user]);
    setLoading(true);
    
    try {
      const res = await fetch(cfg.aiChatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const ai: Msg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data?.answer ?? "I couldn't parse a response from the server.",
        sql: data?.sql,
        rows: data?.rows,
        ts: new Date().toLocaleTimeString()
      };
      setItems(prev => [...prev, ai]);
      
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Unknown error occurred";
      setItems(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Sorry, there was an error: ${errorMsg}\n\nPlease check that VITE_AI_CHAT_ENDPOINT is configured correctly.`,
        ts: new Date().toLocaleTimeString()
      }]);
      
      toast({
        title: "Chat Error",
        description: "Failed to get AI response. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string) { 
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied to clipboard" });
    }).catch(() => {
      toast({ title: "Failed to copy", variant: "destructive" });
    });
  }

  function regen(m: Msg) { 
    if (m.role === "assistant") {
      // Find the last user message to regenerate response
      const lastUser = [...items].reverse().find(x => x.role === "user");
      if (lastUser) {
        // Remove the assistant message we're regenerating
        setItems(prev => prev.filter(item => item.id !== m.id));
        ask(lastUser.content);
      }
    }
  }

  function feedback(_m: Msg, _v: "up" | "down") { 
    // Optional: send to analytics
    toast({ 
      title: _v === "up" ? "Thanks for the feedback!" : "We'll work on improving this response",
      duration: 2000 
    });
  }

  return (
    <div className="flex h-full min-h-screen flex-col bg-[#F9F9F9]">
      <ChatHeader />
      <div 
        ref={scroller} 
        className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-y-auto px-4 py-6"
      >
        {items.map(m => (
          <ChatMessage 
            key={m.id} 
            m={m} 
            onCopy={copy} 
            onRegenerate={regen} 
            onFeedback={feedback} 
          />
        ))}
        
        {loading && (
          <div className="my-2 flex justify-start">
            <div className="max-w-[780px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}
        
        {/* Spacer for better scrolling */}
        <div className="h-24" />
      </div>
      
      <ChatInput onSend={ask} disabled={loading} />
    </div>
  );
}