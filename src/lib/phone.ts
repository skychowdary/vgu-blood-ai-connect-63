import React from 'react';

// Phone detection for E.164 (with or without +) and common Indian formats
const RE_E164 = /\+?\d{10,15}/g;
// Optional: prefer Indian mobile pattern if needed
const RE_INDIA = /(\+?91)?[6-9]\d{9}/g;

export function extractPhones(text: string): string[] {
  const set = new Set<string>();
  for (const re of [RE_INDIA, RE_E164]) {
    const m = text.match(re) || [];
    m.forEach(n => set.add(cleanNumber(n)));
  }
  return [...set];
}

export function cleanNumber(n: string) {
  return n.replace(/[^\d]/g, "");
}

export function waLink(n: string, msg?: string) {
  const base = `https://wa.me/${cleanNumber(n)}`;
  return msg ? `${base}?text=${encodeURIComponent(msg)}` : base;
}

/** Replace phone substrings with <a> elements (React-safe). */
export function linkifyPhones(text: string, getHref: (num: string) => string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let last = 0;
  const re = /(\+?\d{10,15})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const [raw] = m;
    const start = m.index;
    const end = start + raw.length;
    if (start > last) parts.push(text.slice(last, start));
    const cleaned = cleanNumber(raw);
    parts.push(
      React.createElement('a', {
        key: `${start}-${end}`,
        href: getHref(cleaned),
        target: "_blank",
        rel: "noopener noreferrer",
        className: "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-white bg-green-600 hover:bg-green-700 transition-colors",
        title: "Open in WhatsApp"
      }, 
      React.createElement('span', {}, '📱'),
      raw
      )
    );
    last = end;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}