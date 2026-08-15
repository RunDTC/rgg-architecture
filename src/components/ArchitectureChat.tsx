"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { staticModel } from "@/data/model";
import { useSetDraftModel } from "@/lib/model/ModelContext";
import { applyOps, modelFromRaw, rawFromModel } from "@/lib/chat/ops";
import { deriveAppliedToolCalls } from "@/lib/chat/deriveOps";
import { ProposedChangesPanel } from "./ProposedChangesPanel";

const DISPLAY_NAME_KEY = "architecture-chat-display-name";

interface ArchitectureChatProps {
  onClose: () => void;
}

export function ArchitectureChat({ onClose }: ArchitectureChatProps) {
  const setDraftModel = useSetDraftModel();
  const { messages, sendMessage, status, error, setMessages } = useChat();
  const [input, setInput] = useState("");
  // Lazy initializer guards against SSR, where `localStorage` doesn't exist — this is a
  // client-only value, so there's no server/client markup to keep in sync.
  const [displayName, setDisplayName] = useState(() =>
    typeof window === "undefined" ? "" : (localStorage.getItem(DISPLAY_NAME_KEY) ?? ""),
  );

  const appliedCalls = useMemo(() => deriveAppliedToolCalls(messages), [messages]);

  // Recompute the live preview every time the set of successful tool calls changes —
  // this is what makes proposed edits show up on the real diagram before saving.
  useEffect(() => {
    if (appliedCalls.length === 0) {
      setDraftModel(null);
      return;
    }
    const raw = applyOps(
      rawFromModel(staticModel),
      appliedCalls.map((call) => call.op),
    );
    setDraftModel(modelFromRaw(raw));
  }, [appliedCalls, setDraftModel]);

  // Clear the preview when the panel unmounts, so closing the chat (not discarding)
  // doesn't strand the rest of the app on a draft dataset.
  useEffect(() => () => setDraftModel(null), [setDraftModel]);

  function handleDiscard() {
    setMessages([]);
    setDraftModel(null);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    sendMessage({ text });
    setInput("");
  }

  const busy = status === "streaming" || status === "submitted";

  return (
    <aside className="flex h-full w-96 shrink-0 flex-col border-l border-slate-800 bg-[#0c1422]">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Edit with AI</h3>
          <p className="text-[11px] text-slate-400">
            Propose changes to systems, flows, and diagrams
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md px-2 py-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>

      <div className="border-b border-slate-800 px-4 py-2.5">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Your name
        </label>
        <input
          value={displayName}
          onChange={(event) => {
            setDisplayName(event.target.value);
            localStorage.setItem(DISPLAY_NAME_KEY, event.target.value);
          }}
          placeholder="For commit credit once saving is wired up"
          className="mt-1 w-full rounded-md border border-slate-700 bg-[#111a2b] px-2 py-1 text-[13px] text-slate-200 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
        />
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="text-[13px] leading-relaxed text-slate-400">
            Describe a change — e.g. &ldquo;Add a new flow from the loyalty engine to
            the data platform for reconciliation events.&rdquo; You&rsquo;ll see it on
            the live diagram before anything is saved.
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.role === "user" ? "text-right" : "text-left"}
          >
            <div
              className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-left text-[13px] leading-relaxed ${
                message.role === "user"
                  ? "bg-sky-500/20 text-sky-100"
                  : "bg-slate-800/70 text-slate-200"
              }`}
            >
              {message.parts.map((part, i) =>
                part.type === "text" ? <span key={i}>{part.text}</span> : null,
              )}
            </div>
          </div>
        ))}
        {busy && <div className="text-[13px] text-slate-400">Thinking…</div>}
        {error && (
          <div className="rounded-md border border-rose-800 bg-rose-950/40 px-3 py-2 text-[13px] text-rose-300">
            {error.message}
          </div>
        )}
      </div>

      <ProposedChangesPanel calls={appliedCalls} onDiscard={handleDiscard} />

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-800 p-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={busy}
          placeholder="Describe a change…"
          className="w-full min-w-0 flex-1 rounded-md border border-slate-600 bg-[#111a2b] px-3 py-2 text-[13px] text-slate-200 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="shrink-0 rounded-md bg-sky-500/20 px-3 py-2 text-[13px] font-medium text-sky-300 transition-colors hover:bg-sky-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </aside>
  );
}
