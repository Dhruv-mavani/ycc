"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChatMessage } from "./chat-message";

export function PublicChatPanel() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/yuvan/public" }),
  });
  
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API for voice input
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput((prev) => prev + (prev ? " " : "") + transcript);
          setIsListening(false);
          navigator.vibrate?.(50);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error, event);
          setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
        setSpeechSupported(true);
      }
    }
  }, []);

  // Haptic feedback when the assistant replies
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "assistant") {
      navigator.vibrate?.([10, 30, 10]);
    }
  }, [messages.length]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim() && status === "ready") {
      sendMessage({ text: input.trim() });
      setInput("");
      navigator.vibrate?.(50); // Haptic on send
    }
  }

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      navigator.vibrate?.(50);
    }
  };

  return (
    <Card className="mb-3 flex h-[70vh] max-h-[600px] w-[calc(100vw-2rem)] max-w-sm flex-col gap-0 overflow-hidden p-0 shadow-2xl ring-1 ring-border/50 font-sans border-0 rounded-2xl bg-background/95 backdrop-blur-md">
      <div className="flex shrink-0 items-center gap-3 border-b border-border/50 bg-muted/30 px-4 py-3">
        <Image
          src="/yuvan/avatar.jpg"
          alt="YUVAN"
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-full object-cover ring-2 ring-blue-500/20"
        />
        <div>
          <p className="text-sm font-bold text-foreground tracking-tight">YUVAN</p>
          <p className="text-[11px] font-medium text-muted-foreground">
            YCC Assistant • Online
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 bg-gradient-to-b from-background to-muted/20">
        {messages.length === 0 ? (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="max-w-[90%] space-y-1.5 rounded-2xl rounded-tl-sm bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 px-4 py-3 text-sm text-foreground shadow-sm">
              <p className="whitespace-pre-wrap leading-relaxed">
                Hi! Ask me about YCC events, pricing, how to register, or say a mobile number/code to find your registration.
              </p>
            </div>
          </div>
        ) : (
          messages.map((m) => <ChatMessage key={m.id} message={m} />)
        )}
        {status === "submitted" || status === "streaming" ? (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3 shadow-sm flex items-center gap-1.5 h-[44px]">
              <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        ) : null}
        {error ? (
          <div className="flex justify-center mt-2">
            <p className="text-[11px] font-medium text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
              Something went wrong — please try again.
            </p>
          </div>
        ) : null}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex shrink-0 gap-2 border-t border-border/50 bg-background p-3">
        <div className="relative flex-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status !== "ready"}
            placeholder={isListening ? "Listening..." : "Type your message..."}
            className={`h-10 w-full rounded-full border border-input bg-muted/50 pl-4 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:bg-background focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:opacity-50 ${isListening ? "ring-2 ring-red-500/50" : ""}`}
          />
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-2 transition-colors ${
                isListening 
                  ? "text-red-500 bg-red-100 dark:bg-red-900/30 animate-pulse" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
            >
              <Mic className="size-4" />
            </button>
          )}
        </div>
        <Button
          type="submit"
          size="icon"
          className="size-10 shrink-0 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={status !== "ready" || !input.trim()}
          aria-label="Send"
        >
          <Send className="size-4 ml-0.5" />
        </Button>
      </form>
    </Card>
  );
}
