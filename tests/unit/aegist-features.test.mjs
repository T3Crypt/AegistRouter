// AegistRouter unit checks: LoopGuard detection + Skeptical injection.
// Run: node tests/unit/aegist-features.test.mjs
import assert from "node:assert";

const ponytail = await import("../../open-sse/rtk/ponytail.js");
const loopGuard = await import("../../open-sse/rtk/loopGuard.js");
const skeptical = await import("../../open-sse/rtk/skeptical.js");

// --- LoopGuard: no messages → null
assert.equal(loopGuard.detectToolLoop({}), null);
assert.equal(loopGuard.detectToolLoop({ messages: [] }), null);

// --- LoopGuard: 5 identical tool calls in window → warning
const looped = {
  messages: [
    { role: "user", content: "go" },
    ...Array.from({ length: 5 }, () => ({
      role: "assistant",
      tool_calls: [{ function: { name: "read_file", arguments: '{"path":"/tmp/x"}' } }],
    })),
  ],
};
assert.ok(loopGuard.detectToolLoop(looped), "must detect 5 identical calls");

// --- LoopGuard: 4 identical → no warning (below threshold)
const borderline = {
  messages: [
    { role: "user", content: "go" },
    ...Array.from({ length: 4 }, () => ({
      role: "assistant",
      tool_calls: [{ function: { name: "read_file", arguments: '{"path":"/tmp/x"}' } }],
    })),
  ],
};
assert.equal(loopGuard.detectToolLoop(borderline), null);

// --- LoopGuard: 5 distinct calls → no warning
const distinct = {
  messages: Array.from({ length: 5 }, (_, i) => ({
    role: "assistant",
    tool_calls: [{ function: { name: `tool_${i}`, arguments: `{"n":${i}}` } }],
  })),
};
assert.equal(loopGuard.detectToolLoop(distinct), null);

// --- LoopGuard: tool-role shape also detected
const toolRole = {
  messages: Array.from({ length: 5 }, () => ({ role: "tool", name: "bash", content: "ls" })),
};
assert.ok(loopGuard.detectToolLoop(toolRole), "tool-role repeats must trigger");

// --- injectLoopGuard mutates body with warning (OpenAI format)
const body = { messages: [{ role: "system", content: "base" }, ...looped.messages] };
const w = loopGuard.injectLoopGuard(body, "openai");
assert.ok(w, "inject returns warning");
const sys = body.messages.find(m => m.role === "system");
assert.ok(sys.content.includes("LoopGuard"), "system prompt must contain LoopGuard warning");

// --- Skeptical: prompt exists + injector appends
assert.ok(skeptical.SKEPTICAL_PROMPT.includes("Never claim a fix works without having run it"));
const skBody = { messages: [{ role: "system", content: "base" }] };
skeptical.injectSkeptical(skBody, "openai");
assert.ok(
  skBody.messages.find(m => m.role === "system").content.includes("Skeptical Rules"),
  "skeptical must be injectable"
);

// --- Ponytail+Skeptical wired: injectPonytail appends both
const ptBody = { messages: [{ role: "system", content: "base" }] };
ponytail.injectPonytail(ptBody, "openai", "ultra");
const ptSys = ptBody.messages.find(m => m.role === "system");
assert.ok(ptSys.content.includes("lazy senior developer"), "ponytail persona present");
assert.ok(ptSys.content.includes("Skeptical Rules"), "skeptical rides along with ponytail");

console.log("✅ aegist-features: 10 checks passed");
