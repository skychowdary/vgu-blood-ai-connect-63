import { useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
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
      content: "Hi! I'm your AI blood donor assistant powered by **GPT-OSS-20B**, a 100% open-source model. I'm here to help you find blood donors and manage emergency requests.\n\n**What I can do:**\n• Find donors by blood group and branch\n• Show emergency blood requests\n• Provide contact information with WhatsApp links\n• Answer questions about the donor database\n\n**Your data is secure** - all conversations are encrypted and processed locally. Ask me anything!", 
      ts: new Date().toLocaleTimeString()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced auto-scroll with user scroll detection
  const scrollToBottom = useCallback((force = false) => {
    if (scroller.current && (!isUserScrolling || force)) {
      scroller.current.scrollTo({ 
        top: scroller.current.scrollHeight, 
        behavior: force ? "instant" : "smooth" 
      });
    }
  }, [isUserScrolling]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [items, loading, scrollToBottom]);

  // Detect user scrolling
  const handleScroll = useCallback(() => {
    if (!scroller.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scroller.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setIsUserScrolling(!isNearBottom);
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Reset user scrolling state after 2 seconds of no scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 2000);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

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
      // Prepare request body with session_id if available
      const requestBody: { message: string; session_id?: string } = { message: text };
      if (sessionId) {
        requestBody.session_id = sessionId;
        console.log('🔄 Using existing session_id:', sessionId);
      } else {
        console.log('🆕 Starting new session - no session_id yet');
      }

      const res = await fetch(cfg.aiChatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      
      // Store session_id from response if provided
      if (data?.session_id && data.session_id !== sessionId) {
        setSessionId(data.session_id);
        console.log('💾 Stored new session_id:', data.session_id);
      }

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
        // Note: ask() will automatically use the current sessionId
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
    <div className="flex flex-col bg-[#F9F9F9] h-full">
      {/* Messages Container with enhanced responsive design */}
      <div 
        ref={scroller} 
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6 chat-container chat-scroll"
        style={{ maxHeight: 'calc(100vh - 140px)' }}
      >
        <div className="mx-auto w-full max-w-4xl space-y-3 sm:space-y-4">
          {/* AI Model and Security Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Powered by GPT-OSS-20B</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-600">100% Open Source</span>
                {sessionId && (
                  <>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-green-600 font-medium">Session Active</span>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <span>🔒</span>
                <span>Secure & Private</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Your conversations are encrypted and never shared. All data processing happens locally on our secure servers.
              {sessionId && " • Conversation context is maintained across messages."}
            </p>
          </div>
          {items.map((m, index) => (
            <div 
              key={m.id}
              className={`animate-in slide-in-from-bottom-2 duration-300 ${
                index === items.length - 1 ? 'animate-in slide-in-from-bottom-4 duration-500' : ''
              }`}
            >
              <ChatMessage 
                m={m} 
                onCopy={copy} 
                onRegenerate={regen} 
                onFeedback={feedback} 
              />
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
              <div className="max-w-[85%] sm:max-w-[780px] rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-3 text-gray-800 shadow-sm">
                <TypingDots />
              </div>
            </div>
          )}
          
          {/* Enhanced spacer for better scrolling */}
          <div className="h-16 sm:h-20 lg:h-24" />
        </div>
      </div>
      
      {/* Scroll to bottom button - only show when user has scrolled up */}
      {isUserScrolling && (
        <div className="absolute bottom-20 right-4 sm:right-6 lg:right-8 z-20">
          <button
            onClick={() => scrollToBottom(true)}
            className="scroll-to-bottom-btn rounded-full bg-[#7B2B2B] p-3 text-white shadow-lg hover:bg-[#A63C3C] transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#7B2B2B] focus:ring-offset-2"
            aria-label="Scroll to bottom"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      )}
      
      <ChatInput onSend={ask} disabled={loading} />
    </div>
  );
}