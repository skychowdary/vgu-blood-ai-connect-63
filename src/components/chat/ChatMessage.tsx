import { useState } from "react";
import { linkifyPhones, waLink } from "../../lib/phone";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sql?: string;
  rows?: any[];
  ts?: string;
};

export default function ChatMessage({ 
  m, 
  onCopy, 
  onRegenerate, 
  onFeedback 
}: {
  m: Msg;
  onCopy: (text: string) => void;
  onRegenerate: (m: Msg) => void;
  onFeedback: (m: Msg, v: "up" | "down") => void;
}) {
  const [showSql, setShowSql] = useState(false);
  const isUser = m.role === "user";

  return (
    <div className={`w-full my-2 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[780px] rounded-xl px-4 py-3 shadow-sm",
          isUser
            ? "bg-[#7B2B2B] text-white"
            : "bg-white border border-gray-200 text-gray-900"
        ].join(" ")}
      >
        {/* Content with phone linkification for assistant */}
        <div className="prose prose-sm max-w-none whitespace-pre-wrap">
          {isUser
            ? <span>{m.content}</span>
            : <div>{linkifyPhones(m.content, (num) => waLink(num))}</div>}
        </div>

        {/* Optional SQL toggle */}
        {m.sql && (
          <div className="mt-3">
            <button
              onClick={() => setShowSql(!showSql)}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <span>📊</span>
              {showSql ? 'Hide SQL' : 'View SQL'}
            </button>
            {showSql && (
              <pre className="mt-2 overflow-auto rounded-md bg-gray-50 p-3 text-xs text-gray-800 border">
                <code>{m.sql}</code>
              </pre>
            )}
          </div>
        )}

        {/* Optional rows table */}
        {m.rows && m.rows.length > 0 && (
          <div className="mt-3">
            <div className="text-sm text-gray-600 mb-2">Results ({m.rows.length})</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200 rounded-lg">
                <thead className="text-left text-gray-600 bg-gray-50">
                  <tr>
                    {Object.keys(m.rows[0]).map(k => (
                      <th key={k} className="px-3 py-2 font-medium border-b">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {m.rows.slice(0, 10).map((r, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      {Object.keys(m.rows![0]).map(k => (
                        <td key={k} className="px-3 py-2">
                          {typeof r[k] === "string"
                            ? <div>{linkifyPhones(String(r[k]), (num) => waLink(num))}</div>
                            : String(r[k])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {m.rows.length > 10 && (
                <p className="text-xs text-gray-500 mt-2">
                  Showing first 10 of {m.rows.length} results
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions row */}
        <div className="mt-3 flex items-center gap-2 text-xs">
          <button 
            onClick={() => onCopy(m.content)} 
            className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50 transition-colors"
            aria-label="Copy message"
          >
            📋 Copy
          </button>
          {!isUser && (
            <>
              <button 
                onClick={() => onRegenerate(m)} 
                className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50 transition-colors"
                aria-label="Regenerate response"
              >
                🔄 Regenerate
              </button>
              <button 
                onClick={() => onFeedback(m, "up")} 
                className="rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-50 transition-colors"
                aria-label="Thumbs up"
              >
                👍
              </button>
              <button 
                onClick={() => onFeedback(m, "down")} 
                className="rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-50 transition-colors"
                aria-label="Thumbs down"
              >
                👎
              </button>
            </>
          )}
          {m.ts && <span className="ml-auto text-gray-500">{m.ts}</span>}
        </div>
      </div>
    </div>
  );
}