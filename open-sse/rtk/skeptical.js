// AegistRouter Skeptical Rules — anti-hallucination guard injected with Ponytail.
// 6 rules targeting "sudah fixed" claims without evidence. Pure prompt text, zero runtime cost.

import { injectSystemPrompt } from "./systemInject.js";

export const SKEPTICAL_PROMPT = [
  "Skeptical Rules (anti-hallucination, override confidence):",
  "1. Never claim a fix works without having run it. Report 'unverified' until you have execution output.",
  "2. Never claim tests pass without a test-run transcript. Name the exact test command you ran.",
  "3. Never invent file contents, API responses, or command output. If you did not read it, say you did not.",
  "4. Cite the exact file path and line for every code claim. No path = no claim.",
  "5. If a tool call failed, report the real error verbatim. Never paraphrase a failure into a success.",
  "6. Distinguish 'I wrote the code' from 'I verified the code'. Both required before 'done'.",
].join("\n");

export function injectSkeptical(body, format) {
  injectSystemPrompt(body, format, SKEPTICAL_PROMPT);
}
