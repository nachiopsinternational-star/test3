import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Volume2, VolumeX, Sparkles, HelpCircle, Flame, BookOpen, Lightbulb, User } from 'lucide-react';
import { InterestId } from '../../types';

interface AILiveTutorProps {
  studentName: string;
  selectedInterest: InterestId;
  activeCourseTitle: string;
  activeChapterTitle: string;
  onXPBonus?: (xp: number) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  interestTheme?: InterestId;
}

export const AILiveTutor: React.FC<AILiveTutorProps> = ({
  studentName,
  selectedInterest,
  activeCourseTitle,
  activeChapterTitle,
  onXPBonus,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Greetings ${studentName}! I am your dedicated AI Cognitive Mentor. We are currently tackling "${activeChapterTitle}". I've configured my neural pathways to reframe all concepts through your passion for ${selectedInterest.toUpperCase()}! What would you like to explore or clarify?`,
      timestamp: 'Just now',
      interestTheme: selectedInterest,
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const speakText = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const generateInterestThemedResponse = (query: string, interest: InterestId): string => {
    const qLower = query.toLowerCase();

    if (interest === 'gaming') {
      if (qLower.includes('pointer') || qLower.includes('variable') || qLower.includes('memory')) {
        return `Think of a variable as an item hotbar slot in Minecraft. The variable name is simply the hotbar keybind (e.g. Key '1'). The actual Diamond Sword with 50 durability is stored deep in your world chunk memory (the Heap). The variable holds the slot coordinate pointer, not the entire 3D voxel data block!`;
      }
      if (qLower.includes('orbit') || qLower.includes('gravity') || qLower.includes('kepler')) {
        return `Think of orbital velocity like entering orbit in Kerbal Space Program: if your horizontal delta-V isn't fast enough, gravity pulls you straight back down to the spawn biome. But once you achieve circular orbit speed (v = √(GM/r)), you are in perpetual free-fall around the planet!`;
      }
      return `Level up unlocked! In gaming terms: this concept acts like an optimized shader pipeline. Rather than re-rendering every frame from scratch, we cache the state in memory, allowing 144 FPS smooth execution!`;
    }

    if (interest === 'space') {
      if (qLower.includes('pointer') || qLower.includes('variable') || qLower.includes('memory')) {
        return `On the Voyager probe, memory is strictly telemetry-mapped. When mission control sends an uplink packet, the flight computer doesn't duplicate sensor hardware—it points to the telemetry buffer address where magnetometer readings reside.`;
      }
      if (qLower.includes('orbit') || qLower.includes('gravity')) {
        return `At periapsis—the closest approach to Jupiter during a slingshot maneuver—gravitational acceleration peaks. Angular momentum conservation (L = m*v*r) dictates that as orbital radius r shrinks, velocity v must accelerate!`;
      }
      return `In astrophysical terms: think of this as entering a stable Lagrange point (L4/L5) where competing forces achieve balance!`;
    }

    if (interest === 'football') {
      if (qLower.includes('pointer') || qLower.includes('variable') || qLower.includes('memory')) {
        return `Imagine the tactical playbook. The coach writes 'Striker' on the clipboard (the variable identifier). But the actual athlete running the 90-minute press is Erling Haaland in the locker room (the Heap object). The clipboard just points to player #9!`;
      }
      if (qLower.includes('orbit') || qLower.includes('gravity')) {
        return `Think of a curving free kick! The Magnus effect curls the ball around the defensive wall just like gravitational curved spacetime bends the path of an orbiting satellite.`;
      }
      return `Tactical breakdown: think of this like a high-pressing 4-3-3 formation. Every line communicates in real time to shut down defensive passing lanes!`;
    }

    if (interest === 'cooking') {
      return `Culinary perspective: think of this like an emulsion in French gastronomy. If you add oil too fast without emulsifier, the sauce breaks. Here, the structure acts as the binding agent ensuring thermodynamic balance!`;
    }

    if (interest === 'anime') {
      return `Shonen power-scaling analogy: think of this like unlocking the 8th Inner Gate or entering Sage Mode! It doesn't break physical laws; it concentrates all spiritual energy into a single hyper-dense coordinate!`;
    }

    if (interest === 'music') {
      return `Acoustic breakdown: think of this like polyrhythmic counterpoint in an analog modular synth. The oscillator generates the raw waveform, while the filter cutoff shapes the resonant frequency!`;
    }

    return `Excellent inquiry! In our adaptive model, this concept connects the core mathematical foundation with real-world empirical observation.`;
  };

  const handleSendMessage = (customText?: string) => {
    const textToSend = customText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    (async () => {
      let responseText: string | null = null;
      try {
        const res = await fetch('/api/ai-tutor-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: textToSend,
            studentName,
            interestId: selectedInterest,
            courseTitle: activeCourseTitle,
            chapterTitle: activeChapterTitle,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.reply) {
            responseText = data.reply;
          }
        }
      } catch {
        // Fallback to local synthesizer
      }

      if (!responseText) {
        responseText = generateInterestThemedResponse(textToSend, selectedInterest);
      }

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: 'Just now',
        interestTheme: selectedInterest,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);

      if (voiceEnabled) {
        speakText(responseText);
      }

      if (onXPBonus) {
        onXPBonus(15);
      }
    })();
  };

  const quickPrompts = [
    `Explain this through ${selectedInterest} analogy`,
    'Give me a Socratic quiz question',
    'Explain like I am 10 years old',
    'Show the mathematical formula breakdown',
  ];

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl backdrop-blur-md flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">AI Live Tutor</h3>
              <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Adaptive Agent
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Personalized for: <span className="text-indigo-400 font-semibold capitalize">{selectedInterest}</span>
            </p>
          </div>
        </div>

        {/* Voice Speech Toggle */}
        <button
          onClick={() => {
            const next = !voiceEnabled;
            setVoiceEnabled(next);
            if (!next && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
              setIsSpeaking(false);
            }
          }}
          className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            voiceEnabled
              ? 'bg-indigo-600 text-white shadow-indigo-500/30 shadow-lg'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title={voiceEnabled ? 'Voice Readout Enabled' : 'Voice Readout Muted'}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden sm:inline">{voiceEnabled ? 'Voice ON' : 'Mute Voice'}</span>
        </button>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-none shadow-md'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.interestTheme && (
                <div className="mt-1.5 text-[10px] text-indigo-300/80 font-mono flex items-center gap-1">
                  <span>Theme:</span>
                  <span className="uppercase">{msg.interestTheme}</span>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2 items-center text-slate-400 text-xs italic pl-8">
            <span className="flex space-x-1">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
            </span>
            <span>Synthesizing customized explanation...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick Scaffold Prompt Chips */}
      <div className="py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-slate-800/80">
        {quickPrompts.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="shrink-0 bg-slate-800/80 hover:bg-slate-700 hover:text-indigo-300 text-slate-300 px-2.5 py-1 rounded-lg text-[11px] border border-slate-700 transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 pt-2 border-t border-slate-800"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={`Ask anything about this lesson (e.g. "Why is G-C stronger in DNA?")...`}
          className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim()}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
