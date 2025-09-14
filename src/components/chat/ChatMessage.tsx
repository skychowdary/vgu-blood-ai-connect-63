import { useState } from "react";
import React from "react";
import { linkifyPhones, waLink } from "../../lib/phone";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[85%] sm:max-w-[780px] rounded-2xl px-3 sm:px-4 py-3 sm:py-4 shadow-sm transition-all duration-200 hover:shadow-md",
          isUser
            ? "bg-[#7B2B2B] text-white rounded-br-sm"
            : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
        ].join(" ")}
      >
        {/* Content with Markdown and phone linkification for assistant */}
        <div className={`prose prose-sm max-w-none ${isUser ? 'text-white prose-invert' : 'prose-gray'}`}>
          {isUser ? (
            <span className="whitespace-pre-wrap">{m.content}</span>
          ) : (
            <div>
              {/* Process content to make phone numbers clickable */}
              {(() => {
                const phoneRegex = /(\+?\d{10,15})/g;
                const parts = m.content.split(phoneRegex);
                
                if (parts.length === 1) {
                  // No phone numbers found, render as normal markdown
                  return (
                    <ReactMarkdown
                      children={m.content}
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Custom link renderer for regular links
                        a: ({ node, ...props }) => {
                          const href = props.href || '';
                          return <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline" />;
                        },
                        // Custom list item renderer to detect phone numbers
                        li: ({ node, ...props }) => {
                          const text = props.children?.toString() || '';
                          const phoneRegex = /(\+?\d{10,15})/g;
                          const parts = text.split(phoneRegex);
                          
                          if (parts.length === 1) {
                            return <li {...props}>{text}</li>;
                          }
                          
                          return (
                            <li {...props}>
                              {parts.map((part, index) => {
                                // Create a new regex for each test to avoid lastIndex issues
                                const isPhone = /^\+?\d{10,15}$/.test(part);
                                if (isPhone) {
                                  const cleanNum = part.replace(/[^\d]/g, '');
                                  return (
                                    <button
                                      key={index}
                                      onClick={() => window.open(`https://wa.me/${cleanNum}`, '_blank')}
                                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 hover:scale-105 shadow-sm mr-1 mb-1"
                                      title="Open in WhatsApp"
                                    >
                                      <span>📱</span>
                                      <span>{part}</span>
                                    </button>
                                  );
                                }
                                return part;
                              })}
                            </li>
                          );
                        },
                        // Custom table renderer
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-4">
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg" {...props} />
                          </div>
                        ),
                        thead: ({ node, ...props }) => (
                          <thead className="bg-gray-50" {...props} />
                        ),
                        th: ({ node, ...props }) => (
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />
                        ),
                        td: ({ node, ...props }) => (
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 border-t border-gray-200" {...props} />
                        ),
                        // Custom code block renderer
                        code: ({ node, className, ...props }) => (
                          !className?.includes('language-') ? (
                            <code className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-800 text-sm font-mono" {...props} />
                          ) : (
                            <div className="relative">
                              <pre className="p-4 bg-gray-50 rounded-lg overflow-x-auto text-sm font-mono">
                                <code {...props} />
                              </pre>
                              <button
                                onClick={() => {
                                  const code = props.children?.[0] || '';
                                  navigator.clipboard.writeText(code.toString());
                                }}
                                className="absolute top-2 right-2 p-1.5 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                                title="Copy code"
                              >
                                📋
                              </button>
                            </div>
                          )
                        ),
                        // Custom list renderers
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc list-inside space-y-1" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal list-inside space-y-1" {...props} />
                        ),
                        // Custom blockquote renderer
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="border-l-4 border-gray-200 pl-4 italic" {...props} />
                        ),
                      }}
                    />
                  );
                } else {
                  // Phone numbers found, process them
                  return (
                    <div>
                      {parts.map((part, index) => {
                        // Create a new regex for each test to avoid lastIndex issues
                        const isPhone = /^\+?\d{10,15}$/.test(part);
                        if (isPhone) {
                          const cleanNum = part.replace(/[^\d]/g, '');
                          return (
                            <button
                              key={index}
                              onClick={() => window.open(`https://wa.me/${cleanNum}`, '_blank')}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 hover:scale-105 shadow-sm mr-1 mb-1"
                              title="Open in WhatsApp"
                            >
                              <span>📱</span>
                              <span>{part}</span>
                            </button>
                          );
                        }
                        return (
                          <ReactMarkdown
                            key={index}
                            children={part}
                            remarkPlugins={[remarkGfm]}
                            components={{
                              // Custom link renderer for regular links
                              a: ({ node, ...props }) => {
                                const href = props.href || '';
                                return <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline" />;
                              },
                              // Custom table renderer
                              table: ({ node, ...props }) => (
                                <div className="overflow-x-auto my-4">
                                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg" {...props} />
                                </div>
                              ),
                              thead: ({ node, ...props }) => (
                                <thead className="bg-gray-50" {...props} />
                              ),
                              th: ({ node, ...props }) => (
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />
                              ),
                              td: ({ node, ...props }) => (
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 border-t border-gray-200" {...props} />
                              ),
                              // Custom code block renderer
                              code: ({ node, className, ...props }) => (
                                !className?.includes('language-') ? (
                                  <code className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-800 text-sm font-mono" {...props} />
                                ) : (
                                  <div className="relative">
                                    <pre className="p-4 bg-gray-50 rounded-lg overflow-x-auto text-sm font-mono">
                                      <code {...props} />
                                    </pre>
                                    <button
                                      onClick={() => {
                                        const code = props.children?.[0] || '';
                                        navigator.clipboard.writeText(code.toString());
                                      }}
                                      className="absolute top-2 right-2 p-1.5 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                                      title="Copy code"
                                    >
                                      📋
                                    </button>
                                  </div>
                                )
                              ),
                              // Custom list renderers
                              ul: ({ node, ...props }) => (
                                <ul className="list-disc list-inside space-y-1" {...props} />
                              ),
                              ol: ({ node, ...props }) => (
                                <ol className="list-decimal list-inside space-y-1" {...props} />
                              ),
                              // Custom blockquote renderer
                              blockquote: ({ node, ...props }) => (
                                <blockquote className="border-l-4 border-gray-200 pl-4 italic" {...props} />
                              ),
                            }}
                          />
                        );
                      })}
                    </div>
                  );
                }
              })()}
            </div>
          )}
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
              <div className="relative mt-2">
                <pre className="p-4 bg-gray-50 rounded-lg overflow-x-auto text-sm font-mono border border-gray-200">
                  <code className="text-gray-800">{m.sql}</code>
              </pre>
                <button
                  onClick={() => navigator.clipboard.writeText(m.sql || '')}
                  className="absolute top-2 right-2 p-1.5 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                  title="Copy SQL"
                >
                  📋
                </button>
              </div>
            )}
          </div>
        )}

        {/* Optional rows table */}
        {m.rows && m.rows.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-700">
                Results ({m.rows.length})
              </div>
              {m.rows.length > 10 && (
                <div className="text-xs text-gray-500">
                  Showing first 10 of {m.rows.length} results
                </div>
              )}
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    {Object.keys(m.rows[0]).map(k => (
                      <th key={k} className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                        {k.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {m.rows.slice(0, 10).map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors duration-150">
                      {Object.keys(m.rows![0]).map(k => (
                        <td key={k} className="px-3 py-2.5 text-sm text-gray-900 whitespace-nowrap">
                          {typeof r[k] === "string" ? (
                            <div className="flex items-center">
                              {k === "availability" ? (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  r[k] === "true" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {r[k] === "true" ? "Available" : "Unavailable"}
                                </span>
                              ) : k === "blood_group" ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {r[k]}
                                </span>
                              ) : k === "phone_e164" || k === "PHONE" || /phone|contact|mobile|whatsapp/i.test(k) ? (
                                <div className="flex items-center">
                                  <button
                                    onClick={() => {
                                      const cleanNum = String(r[k]).replace(/[^\d]/g, '');
                                      window.open(`https://wa.me/${cleanNum}`, '_blank');
                                    }}
                                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 hover:scale-105 shadow-sm"
                                    title="Open in WhatsApp"
                                  >
                                    <span>📱</span>
                                    <span>{r[k]}</span>
                                  </button>
                                </div>
                              ) : /^\+?\d{10,15}$/.test(String(r[k])) ? (
                                <div className="flex items-center">
                                  <button
                                    onClick={() => {
                                      const cleanNum = String(r[k]).replace(/[^\d]/g, '');
                                      window.open(`https://wa.me/${cleanNum}`, '_blank');
                                    }}
                                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 hover:scale-105 shadow-sm"
                                    title="Open in WhatsApp"
                                  >
                                    <span>📱</span>
                                    <span>{r[k]}</span>
                                  </button>
                                </div>
                              ) : (
                                (() => {
                                  const text = String(r[k]);
                                  const phoneRegex = /(\+?\d{10,15})/g;
                                  const parts = text.split(phoneRegex);
                                  
                                  if (parts.length === 1) {
                                    return <span>{text}</span>;
                                  }
                                  
                                  return (
                                    <span>
                                      {parts.map((part, index) => {
                                        // Create a new regex for each test to avoid lastIndex issues
                                        const isPhone = /^\+?\d{10,15}$/.test(part);
                                        if (isPhone) {
                                          const cleanNum = part.replace(/[^\d]/g, '');
                                          return (
                                            <button
                                              key={index}
                                              onClick={() => window.open(`https://wa.me/${cleanNum}`, '_blank')}
                                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 hover:scale-105 shadow-sm mr-1"
                                              title="Open in WhatsApp"
                                            >
                                              <span>📱</span>
                                              <span>{part}</span>
                                            </button>
                                          );
                                        }
                                        return part;
                                      })}
                                    </span>
                                  );
                                })()
                              )}
                            </div>
                          ) : (
                            String(r[k])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions row - Enhanced for mobile */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <button 
            onClick={() => onCopy(m.content)} 
            className="rounded-lg border border-gray-300 px-2 sm:px-3 py-1.5 hover:bg-gray-50 transition-colors touch-target"
            aria-label="Copy message"
          >
            <span className="hidden sm:inline">📋 Copy</span>
            <span className="sm:hidden">📋</span>
          </button>
          {!isUser && (
            <>
              <button 
                onClick={() => onRegenerate(m)} 
                className="rounded-lg border border-gray-300 px-2 sm:px-3 py-1.5 hover:bg-gray-50 transition-colors touch-target"
                aria-label="Regenerate response"
              >
                <span className="hidden sm:inline">🔄 Regenerate</span>
                <span className="sm:hidden">🔄</span>
              </button>
              <div className="flex gap-1">
              <button 
                onClick={() => onFeedback(m, "up")} 
                  className="rounded-lg border border-gray-300 px-2 py-1.5 hover:bg-gray-50 transition-colors touch-target"
                aria-label="Thumbs up"
              >
                👍
              </button>
              <button 
                onClick={() => onFeedback(m, "down")} 
                  className="rounded-lg border border-gray-300 px-2 py-1.5 hover:bg-gray-50 transition-colors touch-target"
                aria-label="Thumbs down"
              >
                👎
              </button>
              </div>
            </>
          )}
          {m.ts && (
            <span className="ml-auto text-gray-500 text-xs sm:text-sm">
              {m.ts}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}