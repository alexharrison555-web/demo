import { useCallback, useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ANTHROPIC_MODEL, SYSTEM_PROMPT } from "@/lib/prompt";
import type { CandidateData } from "@/lib/data";

type AnthropicMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatItem =
  | { kind: "user"; id: string; text: string }
  | { kind: "ai"; id: string; text: string }
  | { kind: "typing"; id: string }
  | { kind: "cv-upload"; id: string }
  | { kind: "cv-uploaded"; id: string; filename: string }
  | { kind: "finalizing"; id: string };

// ============================================================
// API key — hardcoded for demo use only.
// REPLACE THIS with your own key locally before deploying.
// Generate a fresh one at https://console.anthropic.com/settings/keys
// Revoke it after the demo.
// ============================================================
const ANTHROPIC_API_KEY = "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";

const CHAT_ENDPOINT = "https://api.anthropic.com/v1/messages";

let idCounter = 0;
const nextId = () => `i${++idCounter}`;

// ============================================================
// Parsing helpers
// ============================================================
function extractCandidateData(text: string): CandidateData | null {
  const match = text.match(/<CANDIDATE_DATA>([\s\S]*?)<\/CANDIDATE_DATA>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1].trim()) as CandidateData;
  } catch (err) {
    console.error("Failed to parse CANDIDATE_DATA JSON:", err);
    return null;
  }
}

function stripDataBlock(text: string): string {
  return text.replace(/<CANDIDATE_DATA>[\s\S]*?<\/CANDIDATE_DATA>/g, "").trim();
}

function hasCvUploadSignal(text: string): boolean {
  return /\[SHOW_CV_UPLOAD\]/.test(text);
}

function stripCvUploadSignal(text: string): string {
  return text.replace(/\[SHOW_CV_UPLOAD\]/g, "").trim();
}

// ============================================================
// Page
// ============================================================
export default function HomePage() {
  const router = useRouter();
  const [items, setItems] = useState<ChatItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationComplete, setConversationComplete] = useState(false);

  // Refs hold mutable state that should not trigger re-renders
  const messagesRef = useRef<AnthropicMessage[]>([]);
  const cvFilenameRef = useRef<string>("");
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const startedRef = useRef<boolean>(false);

  // ----- Body class to lock scroll -----
  useEffect(() => {
    document.body.classList.add("chat-page");
    return () => document.body.classList.remove("chat-page");
  }, []);

  // ----- Auto-scroll to bottom on new items -----
  useEffect(() => {
    requestAnimationFrame(() => {
      if (chatWindowRef.current) {
        chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
      }
    });
  }, [items]);

  // ----- Mutators -----
  const appendItem = useCallback((item: ChatItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const removeItemByKind = useCallback((kind: ChatItem["kind"]) => {
    setItems((prev) => prev.filter((i) => i.kind !== kind));
  }, []);

  // ----- API call (direct to Anthropic for demo) -----
  const callClaude = useCallback(async (): Promise<string> => {
    const body = {
      model: ANTHROPIC_MODEL,
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: messagesRef.current,
    };

    const res = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const textBlock = (data.content as Array<{ type: string; text?: string }>)
      .find((b) => b.type === "text");
    return textBlock?.text ?? "";
  }, []);

  // ----- Send flow -----
  const sendMessage = useCallback(
    async (text: string, alsoRender = true) => {
      if (isProcessing || conversationComplete) return;
      const trimmed = text.trim();
      if (!trimmed) return;

      setIsProcessing(true);

      if (alsoRender) {
        appendItem({ kind: "user", id: nextId(), text: trimmed });
      }
      messagesRef.current.push({ role: "user", content: trimmed });

      appendItem({ kind: "typing", id: "typing" });

      try {
        const aiText = await callClaude();
        removeItemByKind("typing");

        messagesRef.current.push({ role: "assistant", content: aiText });

        const candidateData = extractCandidateData(aiText);
        const cleanedText = stripCvUploadSignal(stripDataBlock(aiText));

        if (cleanedText) {
          appendItem({ kind: "ai", id: nextId(), text: cleanedText });
        }

        if (candidateData) {
          if (!candidateData.cvFilename && cvFilenameRef.current) {
            candidateData.cvFilename = cvFilenameRef.current;
          }
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "cityscapeCandidate",
              JSON.stringify(candidateData),
            );
          }
          setConversationComplete(true);
          appendItem({ kind: "finalizing", id: nextId() });
          setTimeout(() => {
            router.push("/results");
          }, 2500);
          return;
        }

        if (hasCvUploadSignal(aiText)) {
          appendItem({ kind: "cv-upload", id: "cv-upload" });
        }

        setIsProcessing(false);
        // Refocus the input
        requestAnimationFrame(() => inputRef.current?.focus());
      } catch (err) {
        removeItemByKind("typing");
        console.error(err);
        appendItem({
          kind: "ai",
          id: nextId(),
          text: "Sorry — I hit a brief hiccup connecting. Please try sending that again.",
        });
        setIsProcessing(false);
      }
    },
    [
      appendItem,
      callClaude,
      conversationComplete,
      isProcessing,
      removeItemByKind,
      router,
    ],
  );

  // ----- Kick off conversation on mount -----
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      setIsProcessing(true);
      appendItem({ kind: "typing", id: "typing" });

      messagesRef.current.push({
        role: "user",
        content:
          "[The candidate has just opened the chat. Greet them and begin the intake.]",
      });

      try {
        const aiText = await callClaude();
        removeItemByKind("typing");
        messagesRef.current.push({ role: "assistant", content: aiText });
        const cleaned = stripCvUploadSignal(stripDataBlock(aiText));
        if (cleaned) {
          appendItem({ kind: "ai", id: nextId(), text: cleaned });
        }
        if (hasCvUploadSignal(aiText)) {
          appendItem({ kind: "cv-upload", id: "cv-upload" });
        }
        setIsProcessing(false);
        requestAnimationFrame(() => inputRef.current?.focus());
      } catch (err) {
        removeItemByKind("typing");
        console.error(err);
        appendItem({
          kind: "ai",
          id: nextId(),
          text: "Welcome to Cityscape AI. I'm having a momentary issue connecting — please send a message to try again.",
        });
        messagesRef.current.length = 0;
        setIsProcessing(false);
      }
    })();
  }, [appendItem, callClaude, removeItemByKind]);

  // ----- Handlers -----
  const handleSend = () => {
    const text = inputValue;
    if (!text.trim()) return;
    setInputValue("");
    sendMessage(text, true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCvSelected = (filename: string) => {
    cvFilenameRef.current = filename;
    setItems((prev) =>
      prev.map((i) =>
        i.kind === "cv-upload"
          ? { kind: "cv-uploaded", id: i.id, filename }
          : i,
      ),
    );
    sendMessage(`I've uploaded my CV: ${filename}`, false);
  };

  const handleCvSkipped = () => {
    cvFilenameRef.current = "";
    removeItemByKind("cv-upload");
    sendMessage(`I'll send my CV across later — please continue.`, false);
  };

  return (
    <>
      <Head>
        <title>Cityscape AI — Your AI Recruiter</title>
      </Head>

      <header
        className="fixed top-0 left-0 right-0 bg-white flex items-center justify-between px-7 z-[100]"
        style={{ height: "var(--header-h)", boxShadow: "var(--shadow-header)" }}
      >
        <div className="text-[22px] font-semibold tracking-tight text-charcoal">
          Cityscape<span className="text-green">AI</span>
        </div>
        <div className="text-sm font-medium text-green tracking-wide hidden sm:block">
          Your AI Recruiter
        </div>
      </header>

      <div
        className="fixed left-0 right-0 flex justify-center overflow-hidden"
        style={{ top: "var(--header-h)", bottom: "var(--input-h)" }}
      >
        <div
          ref={chatWindowRef}
          className="chat-window w-full max-w-[720px] px-6 pt-7 pb-3 overflow-y-auto scroll-smooth"
        >
          {items.map((item) => (
            <ChatItemView
              key={item.id}
              item={item}
              onCvSelected={handleCvSelected}
              onCvSkipped={handleCvSkipped}
            />
          ))}
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-grey-100 flex items-center justify-center px-6 z-[100]"
        style={{ height: "var(--input-h)" }}
      >
        <div className="w-full max-w-[720px] flex gap-2.5 items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message…"
            autoComplete="off"
            disabled={isProcessing || conversationComplete}
            className="flex-1 h-12 px-[18px] border border-grey-200 rounded-3xl bg-bg text-[15px] text-charcoal outline-none transition-all duration-200 focus:border-green focus:bg-white focus:shadow-[0_0_0_3px_rgba(74,124,89,0.12)] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ fontSize: "15px" }}
          />
          <button
            onClick={handleSend}
            disabled={isProcessing || conversationComplete}
            className="h-12 px-[22px] bg-green text-white rounded-3xl text-[15px] font-medium flex items-center gap-1.5 transition-all duration-200 hover:bg-green-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(74,124,89,0.25)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            <span className="hidden sm:inline">Send</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

// ============================================================
// Chat item renderer
// ============================================================
function ChatItemView({
  item,
  onCvSelected,
  onCvSkipped,
}: {
  item: ChatItem;
  onCvSelected: (filename: string) => void;
  onCvSkipped: () => void;
}) {
  if (item.kind === "user") {
    return (
      <div
        className="flex justify-end mb-3.5"
        style={{ animation: "msgIn 0.4s var(--ease)" }}
      >
        <div
          className="max-w-[78%] px-[17px] py-[13px] text-[15px] leading-[1.5] bg-green text-white break-words"
          style={{
            borderRadius: "18px 18px 4px 18px",
            boxShadow: "0 1px 2px rgba(74, 124, 89, 0.18)",
          }}
        >
          {item.text}
        </div>
      </div>
    );
  }

  if (item.kind === "ai") {
    const paragraphs = item.text
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    return (
      <div
        className="flex justify-start mb-3.5"
        style={{ animation: "msgIn 0.4s var(--ease)" }}
      >
        <div
          className="max-w-[78%] px-[17px] py-[13px] text-[15px] leading-[1.5] bg-white text-charcoal break-words shadow-card"
          style={{ borderRadius: "4px 18px 18px 18px" }}
        >
          {paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? "m-0" : "m-0 mt-2"}>
              {p}
            </p>
          ))}
        </div>
      </div>
    );
  }

  if (item.kind === "typing") {
    return (
      <div
        className="flex justify-start mb-3.5"
        style={{ animation: "msgIn 0.4s var(--ease)" }}
      >
        <div
          className="inline-flex items-center gap-1 bg-white px-[18px] py-[14px] shadow-card"
          style={{ borderRadius: "4px 18px 18px 18px" }}
        >
          <span
            className="w-[7px] h-[7px] rounded-full bg-green"
            style={{
              animation: "pulse 1.3s infinite ease-in-out",
              opacity: 0.4,
            }}
          />
          <span
            className="w-[7px] h-[7px] rounded-full bg-green"
            style={{
              animation: "pulse 1.3s infinite ease-in-out 0.2s",
              opacity: 0.4,
            }}
          />
          <span
            className="w-[7px] h-[7px] rounded-full bg-green"
            style={{
              animation: "pulse 1.3s infinite ease-in-out 0.4s",
              opacity: 0.4,
            }}
          />
        </div>
      </div>
    );
  }

  if (item.kind === "cv-upload") {
    return <CvUpload onSelected={onCvSelected} onSkipped={onCvSkipped} />;
  }

  if (item.kind === "cv-uploaded") {
    return (
      <div
        className="flex justify-start mb-3.5"
        style={{ animation: "msgIn 0.4s var(--ease)" }}
      >
        <div className="bg-white rounded-card shadow-card p-[22px] max-w-[78%]">
          <div
            className="flex items-center gap-3 px-4 py-3.5 rounded-sm2"
            style={{
              background: "rgba(74, 124, 89, 0.08)",
              animation: "msgIn 0.4s var(--ease)",
            }}
          >
            <div
              className="w-7 h-7 rounded-full bg-green text-white flex items-center justify-center flex-shrink-0"
              style={{ animation: "tickPop 0.5s var(--ease)" }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                className="w-4 h-4"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div className="text-sm font-medium text-charcoal overflow-hidden text-ellipsis whitespace-nowrap">
              {item.filename}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (item.kind === "finalizing") {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 px-5 text-center"
        style={{ animation: "msgIn 0.5s var(--ease)" }}
      >
        <div
          className="w-11 h-11 rounded-full mb-4"
          style={{
            border: "3px solid rgba(74, 124, 89, 0.18)",
            borderTopColor: "var(--green)",
            animation: "spin 0.9s linear infinite",
          }}
        />
        <div
          className="text-[15px] font-medium text-charcoal"
          style={{ animation: "textPulse 1.8s ease-in-out infinite" }}
        >
          Finding your best matches…
        </div>
      </div>
    );
  }

  return null;
}

// ============================================================
// CV upload zone
// ============================================================
function CvUpload({
  onSelected,
  onSkipped,
}: {
  onSelected: (filename: string) => void;
  onSkipped: () => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="flex justify-start mb-3.5"
      style={{ animation: "msgIn 0.4s var(--ease)" }}
    >
      <div className="bg-white rounded-card shadow-card p-[22px] max-w-[78%]">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) onSelected(file.name);
          }}
          className={`rounded-sm2 px-5 py-7 text-center cursor-pointer transition-all duration-300 ${
            isDragOver
              ? "border-2 border-dashed border-green -translate-y-px"
              : "border-2 border-dashed border-grey-200"
          }`}
          style={{
            background: isDragOver ? "rgba(74, 124, 89, 0.04)" : "var(--bg)",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-9 h-9 mx-auto mb-2.5 text-green"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <div className="text-sm font-medium text-charcoal mb-1">
            Drop your CV here or click to browse
          </div>
          <div className="text-xs text-grey-400">
            Any file type — we'll pass it to your consultant
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onSelected(file.name);
            }}
          />
        </div>
        <button
          onClick={onSkipped}
          className="block mx-auto mt-3 bg-transparent border-0 font-sans text-[13px] text-grey-400 cursor-pointer px-2 py-1 transition-colors hover:text-charcoal"
        >
          Skip — I'll send it later
        </button>
      </div>
    </div>
  );
}
