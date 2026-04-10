import { MessageCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  useConversations,
  useConversationHistory,
  useCreateConversation,
} from "@/hooks/use-chat";
import { Send, Plus, Loader2, Bot, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Chatbot() {
  const { data: conversations, isLoading: loadingConvos } = useConversations();
  const { mutateAsync: createConvo } = useCreateConversation();

  const [activeId, setActiveId] = useState<number | null>(null);
  const { data: history, isLoading: loadingHistory } =
    useConversationHistory(activeId);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set initial active conversation or create one
  useEffect(() => {
    if (!loadingConvos && conversations) {
      if (conversations.length > 0 && !activeId) {
        setActiveId(conversations[0].id);
      } else if (conversations.length === 0) {
        handleNewChat();
      }
    }
  }, [conversations, loadingConvos]);

  // Sync history when activeId changes
  useEffect(() => {
    if (history) {
      setMessages(history);
    }
  }, [history]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewChat = async () => {
    const newConvo = await createConvo({
      title: `Session ${new Date().toLocaleDateString()}`,
    });
    setActiveId(newConvo.id);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeId || isStreaming) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    // Placeholder for assistant response
    const assistantMessageIdx = messages.length + 1;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch(`/api/conversations/${activeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMessage.content }),
      });

      if (!response.ok) throw new Error("Failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  assistantText += data.content;
                  setMessages((prev) => {
                    const newMsgs = [...prev];
                    newMsgs[assistantMessageIdx] = {
                      role: "assistant",
                      content: assistantText,
                    };
                    return newMsgs;
                  });
                }
                if (data.done) {
                  setIsStreaming(false);
                }
              } catch (e) {
                // Ignore parse errors on incomplete chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setIsStreaming(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-6">
      {/* Sidebar for Conversations */}
      <div className="w-1/3 max-w-sm glass-card rounded-3xl flex flex-col hidden lg:flex">
        <div className="p-6 border-b border-border/50">
          <button
            onClick={handleNewChat}
            className="w-full py-3 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center gap-2 hover:bg-teal-200 transition-colors"
          >
            <Plus className="w-5 h-5" /> New Session
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversations?.map((c: any) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full text-left p-4 rounded-xl transition-all ${
                activeId === c.id
                  ? "bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 shadow-sm"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                {c.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(c.createdAt).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass-card rounded-3xl flex flex-col overflow-hidden relative shadow-xl">
        {/* Chat Header */}
        <div className="p-6 border-b border-border/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Bot className="w-6 h-6 text-teal-600" />
            Therapist AI
          </h2>
          <p className="text-sm text-muted-foreground">
            Safe, private, and judgment-free space.
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && !loadingHistory && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <MessageCircle className="w-16 h-16 mb-4 text-teal-600" />
              <p className="text-lg font-medium">Start a conversation...</p>
              <p className="text-sm">
                Say hello or share how you're feeling today.
              </p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((m, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx}
                className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    m.role === "user"
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300"
                      : "bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-300"
                  }`}
                >
                  {m.role === "user" ? (
                    <UserIcon className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] p-4 rounded-2xl ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {m.content ? (
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {m.content}
                    </p>
                  ) : (
                    <div className="flex gap-1 items-center h-6">
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"></span>
                      <span
                        className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></span>
                      <span
                        className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border/50 bg-white/50 dark:bg-slate-900/50">
          <form onSubmit={sendMessage} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isStreaming}
              className="w-full pl-6 pr-16 py-4 rounded-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="absolute right-2 top-2 bottom-2 aspect-square rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center disabled:opacity-50 disabled:hover:bg-teal-600 transition-colors"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
