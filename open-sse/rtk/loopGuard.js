// AegistRouter LoopGuard — O(K) tool-call loop detection over the request history.
// Counts identical (name+args) tool calls within the last WINDOW calls; at
// THRESHOLD repeats it injects a one-line warning into the system prompt.
// Pure scan of already-in-memory messages: one small Map, bounded iteration,
// no timers, no event-loop stalls even at 1000+ message history.

import { injectSystemPrompt } from "./systemInject.js";

const WINDOW = 40;      // inspect last N tool calls
const THRESHOLD = 5;    // >= identical repeats within window triggers the guard
const WARNING =
  "LoopGuard: the conversation history contains the same tool call repeated " +
  `${THRESHOLD}+ times. Do NOT repeat it again. Change strategy: fix the input, ` +
  "read the error, or stop and report the blocker.";

function toolCallKey(name, args) {
  let argsStr = "";
  try { argsStr = typeof args === "string" ? args : JSON.stringify(args ?? null); }
  catch { argsStr = String(args); }
  return `${name}|${argsStr.length > 512 ? argsStr.slice(0, 512) : argsStr}`;
}

export function detectToolLoop(body) {
  const messages = body?.messages;
  if (!Array.isArray(messages)) return null;

  const counts = new Map();
  let seen = 0;
  for (let i = messages.length - 1; i >= 0 && seen < WINDOW; i--) {
    const m = messages[i];
    const calls = m?.tool_calls || (m?.role === "tool" && m?.name ? [{ name: m.name, arguments: m.content }] : []);
    for (let j = calls.length - 1; j >= 0 && seen < WINDOW; j--) {
      const c = calls[j];
      if (!c) continue;
      const name = c.function?.name || c.name || "";
      if (!name) continue;
      const key = toolCallKey(name, c.function?.arguments ?? c.arguments ?? c.content);
      const n = (counts.get(key) || 0) + 1;
      counts.set(key, n);
      seen++;
      if (n >= THRESHOLD) return WARNING;
    }
  }
  return null;
}

export function injectLoopGuard(body, format) {
  const warning = detectToolLoop(body);
  if (warning) injectSystemPrompt(body, format, warning);
  return warning;
}
