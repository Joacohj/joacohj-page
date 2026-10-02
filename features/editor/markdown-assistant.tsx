"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Bot,
  Send,
  Sparkles,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ScrollArea,
  ScrollBar,
} from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type MessageRole = "user" | "assistant";

type Message = {
  id: string;
  role: MessageRole;
  content: string;
};

type MarkdownAssistantProps = {
  markdown?: string;
  onMarkdownChange?: (markdown: string) => void;
};

export function MarkdownAssistant({
  markdown,
  onMarkdownChange,
}: MarkdownAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hola. Puedo ayudarte a modificar, corregir, estructurar o mejorar el Markdown de tu documento.",
    },
  ]);

  const [input, setInput] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------------------------
  // Auto-scroll
  // ----------------------------------------------------------

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    element.scrollTo({
      top: element.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // ----------------------------------------------------------
  // Send message
  // ----------------------------------------------------------

  function handleSubmit() {
    const content = input.trim();

    if (!content) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");

    // --------------------------------------------------------
    // TODO:
    // Acá posteriormente llamás a tu API.
    // --------------------------------------------------------

    setTimeout(() => {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Perfecto. Cuando conectemos el modelo, acá voy a analizar tu Markdown y aplicar el cambio solicitado.",
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    }, 500);
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSubmit();
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-background">
      {/* -------------------------------------------------- */}
      {/* Header */}
      {/* -------------------------------------------------- */}

      <div className="flex shrink-0 items-center gap-3 border-b px-8 py-5">
        <Avatar className="size-8">
          <AvatarFallback>
            <Sparkles className="size-4" />
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            Markdown Assistant
          </p>

          <p className="text-xs text-muted-foreground">
            Modificá tu documento con lenguaje natural
          </p>
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* Messages */}
      {/* -------------------------------------------------- */}

      <ScrollArea className="min-h-0 flex-1">
        <div
          ref={scrollRef}
          className="space-y-5 p-8"
        >
          {messages.map((message) => {
            const isUser =
              message.role === "user";

            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  isUser &&
                    "flex-row-reverse",
                )}
              >
                <Avatar className="size-7 shrink-0">
                  <AvatarFallback>
                    {isUser ? (
                      <User className="size-3.5" />
                    ) : (
                      <Bot className="size-3.5" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={cn(
                    "max-w-[85%] space-y-1",
                    isUser &&
                      "items-end text-right",
                  )}
                >
                  <p className="text-xs font-medium text-muted-foreground">
                    {isUser
                      ? "Vos"
                      : "Assistant"}
                  </p>

                  <div
                    className={cn(
                      "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      isUser
                        ? "rounded-tr-sm bg-primary text-primary-foreground"
                        : "rounded-tl-sm bg-muted",
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <ScrollBar />
      </ScrollArea>

      {/* -------------------------------------------------- */}
      {/* Composer */}
      {/* -------------------------------------------------- */}

      <div className="shrink-0 border-t p-4">
        <div className="relative rounded-xl border bg-background transition-colors focus-within:border-ring">
          <Textarea
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Pedile un cambio al Markdown..."
            className="min-h-[72px] resize-none border-0 bg-transparent pr-12 shadow-none focus-visible:ring-0"
          />

          <Button
            type="button"
            size="icon"
            disabled={!input.trim()}
            onClick={handleSubmit}
            className="absolute bottom-2 right-2 size-8 rounded-lg"
          >
            <Send className="size-4" />
          </Button>
        </div>

        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Enter para enviar · Shift + Enter para nueva línea
        </p>
      </div>
    </div>
  );
}