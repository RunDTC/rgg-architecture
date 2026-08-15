import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { staticModel } from "@/data/model";
import { deriveOpsFromMessages } from "@/lib/chat/deriveOps";
import { applyOps, rawFromModel } from "@/lib/chat/ops";
import { createTools } from "@/lib/chat/tools";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You help edit the Rue Gilt Group architecture model through conversation.

Scope: you may only add, update, or remove systems, data stores, externals, flows, migrations, and sequence diagrams via your tools. You cannot and must not touch anything else about this application — no code, no config, no pages.

Facts: this model documents real, sourced architecture facts, not a sample. Only write factual fields (description, notes, summary, stack, runtime) from what the user has actually told you in this conversation. If a required factual detail is missing, ask the user for it — never invent or guess at architecture facts.

Ids: never change an existing node/flow/migration/sequence id. New ids should be short and kebab-case, consistent with the existing model (e.g. "loyalty-engine").

Removing something: your remove tools are blocked automatically if other entries still reference the id, with a list of what references it. Don't try to work around this by removing referencing entries silently — ask the user to confirm removing each dependent, then remove them one at a time as separate tool calls.

After making tool calls, briefly summarize in plain language what you changed (or, if a tool call was rejected, explain why and what you need from the user to proceed). The user will see a live preview and a list of proposed changes before anything is saved — you are proposing, not committing.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const priorOps = deriveOpsFromMessages(messages);
  const state = { raw: applyOps(rawFromModel(staticModel), priorOps) };
  const tools = createTools(state);

  const result = streamText({
    model: process.env.CHAT_MODEL ?? "openai/gpt-5-mini",
    system: SYSTEM_PROMPT,
    messages: convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(8),
  });

  return result.toUIMessageStreamResponse();
}
