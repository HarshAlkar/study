import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Brain, Clock, Zap, Coffee, Target, Heart, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

// Mentor Knowledge & Tone
const RESPONSES = {
  GREETINGS: [
    "Hey! I'm your study mentor. How's the learning going today?",
    "Hello there! Ready to crush some study goals together?",
    "Hi! I was just looking over some study tips for you. What's on your mind?",
  ],
  TIRED: [
    "I hear you. Pushing through exhaustion usually leads to diminishing returns. Why not try a 15-minute 'power nap' or a quick walk?",
    "Being tired is a signal from your brain. Have you been using the Pomodoro technique? Maybe it's time for a longer break.",
    "Totally understandable. Learning is hard work! Let's pivot—what's the simplest, smallest thing you can do right now to feel productive?",
  ],
  FOCUS: [
    "Focus is a muscle! If you're struggling, try the '5-minute rule': tell yourself you'll only work for 5 minutes. Usually, getting started is the hardest part.",
    "Distractions everywhere? Try clearing your physical desk first. A clean space often leads to a clean mind.",
    "If your mind is wandering, try 'Active Recall'. Instead of reading, close the book and write down everything you remember.",
  ],
  STRESSED: [
    "Take a deep breath. You're more than your grades or your productivity. Let's break that big task into 3 tiny pieces. Which one is first?",
    "I've seen this before—it's just 'Pre-exam Jitters'. You've put in the work. Let's focus on what we can control right now.",
    "Stress often comes from looking too far ahead. Let's just focus on the next 25 minutes. Want to start a timer?",
  ],
  PLANNING: [
    "A good plan is half the battle won. Start by listing your top 3 priorities for today. Everything else is a bonus!",
    "Try 'Time Blocking'. Assign a specific hour to a specific subject. It removes the 'what should I do now?' stress.",
    "Don't forget to schedule your breaks! A plan without breaks is just a recipe for burnout.",
  ],
  MOTIVATION: [
    "Remember why you started. Every page you read is a step toward that goal you set!",
    "Motivation follows action, not the other way around. Just start, and the feeling will catch up.",
    "You've handled tough subjects before, and you'll handle this one too. I believe in you!",
  ],
  EXAM_PREP: [
    "For exams, 'Space Repetition' is King. Don't cram—review in small chunks over several days.",
    "Try 'The Feynman Technique': explain the concept out loud as if you're teaching a 10-year-old. It highlights exactly what you don't know.",
    "Past papers are your best friend. They show you the patterns in how questions are asked.",
  ],
  DEFAULT: [
    "That's a great point. Tell me more about how you're approaching this.",
    "I see. How can I best support you with that right now?",
    "Interesting! Let's think about how we can apply a better study strategy there.",
  ]
};

const SUGGESTIONS = [
  { label: "I'm feeling tired", icon: Coffee, query: "I am feeling tired" },
  { label: "Can't focus", icon: Target, query: "I can't focus right now" },
  { label: "Need a study plan", icon: Clock, query: "How do I create a study plan?" },
  { label: "Motivate me", icon: Sparkles, query: "Give me some motivation" },
];

export default function StudyChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "1",
          role: "bot",
          content: RESPONSES.GREETINGS[Math.floor(Math.random() * RESPONSES.GREETINGS.length)],
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const getBotResponse = (userInput: string) => {
    const lower = userInput.toLowerCase();
    
    if (lower.includes("tired") || lower.includes("sleepy") || lower.includes("exhausted")) {
      return RESPONSES.TIRED[Math.floor(Math.random() * RESPONSES.TIRED.length)];
    }
    if (lower.includes("focus") || lower.includes("distract") || lower.includes("concentrate")) {
      return RESPONSES.FOCUS[Math.floor(Math.random() * RESPONSES.FOCUS.length)];
    }
    if (lower.includes("stress") || lower.includes("anxious") || lower.includes("worried") || lower.includes("hard")) {
      return RESPONSES.STRESSED[Math.floor(Math.random() * RESPONSES.STRESSED.length)];
    }
    if (lower.includes("plan") || lower.includes("schedule") || lower.includes("organize")) {
      return RESPONSES.PLANNING[Math.floor(Math.random() * RESPONSES.PLANNING.length)];
    }
    if (lower.includes("motivate") || lower.includes("inspiration") || lower.includes("help") || lower.includes("give up")) {
      return RESPONSES.MOTIVATION[Math.floor(Math.random() * RESPONSES.MOTIVATION.length)];
    }
    if (lower.includes("exam") || lower.includes("test") || lower.includes("quiz") || lower.includes("prep")) {
      return RESPONSES.EXAM_PREP[Math.floor(Math.random() * RESPONSES.EXAM_PREP.length)];
    }
    
    return RESPONSES.DEFAULT[Math.floor(Math.random() * RESPONSES.DEFAULT.length)];
  };

  const handleSend = (content: string) => {
    if (!content.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Human-like delay based on message length
    const delay = Math.min(Math.max(content.length * 20, 1000), 2500);

    setTimeout(() => {
      const response = getBotResponse(content);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, delay);
  };

  const resetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "bot",
        content: "Let's start fresh! How are you feeling about your studies right now?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: "bottom right" }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-[calc(100vw-2rem)] md:w-[400px] h-[600px] max-h-[80vh] bg-card rounded-[2rem] shadow-2xl border flex flex-col overflow-hidden ring-1 ring-black/5"
            >
              {/* Header */}
              <div className="p-5 border-b bg-primary flex items-center justify-between text-primary-foreground">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-none">Human Mentor</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                      <p className="text-[10px] font-medium opacity-80 uppercase tracking-wider">Online & Ready</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={resetChat} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Reset Conversation</TooltipContent>
                  </Tooltip>
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages Container */}
              <div 
                ref={scrollRef} 
                className="flex-1 p-5 overflow-y-auto no-scrollbar scroll-smooth bg-gradient-to-b from-transparent to-muted/20"
              >
                <div className="space-y-6">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} max-w-[85%]`}>
                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-tr-none font-medium"
                              : "bg-background border text-foreground rounded-tl-none ring-1 ring-black/5"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1.5 px-1 font-medium opacity-50">
                          {msg.role === "user" ? "You" : "Mentor"} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="bg-background border rounded-2xl px-4 py-3 flex gap-1.5 items-center shadow-sm">
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Suggestions Panel */}
              <div className="px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar border-t bg-muted/10">
                {SUGGESTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleSend(action.query)}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-background border shadow-sm text-[11px] font-bold text-foreground hover:bg-primary hover:text-primary-foreground transition-all active:scale-95"
                  >
                    <action.icon className="h-3.5 w-3.5" />
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-5 bg-background border-t">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend(input);
                  }}
                  className="flex gap-3"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message your mentor..."
                    className="h-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/20"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="h-12 w-12 rounded-2xl shadow-lg shadow-primary/20 shrink-0"
                    disabled={!input.trim() || isTyping}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
                <p className="text-[10px] text-center text-muted-foreground mt-3 font-medium opacity-60">
                   Mentor can help with planning, focus, mood, and exams.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`h-16 w-16 rounded-[1.5rem] shadow-2xl flex items-center justify-center transition-all duration-300 ${
            isOpen ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
          }`}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="h-8 w-8" />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <MessageCircle className="h-8 w-8" />
              </motion.div>
            )}
          </AnimatePresence>
          {!isOpen && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold"
            >
              1
            </motion.span>
          )}
        </motion.button>
      </div>
    </TooltipProvider>
  );
}
