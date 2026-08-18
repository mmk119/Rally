import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface CoachAIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCourtAndTime?: (courtId: string, time: string) => void;
}

export const CoachAIPanel: React.FC<CoachAIPanelProps> = ({
  isOpen,
  onClose,
  onSelectCourtAndTime,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: "I see you're looking at Center Court at 19:00. Great choice for a competitive match! Should I lock this in?",
      timestamp: 'Just now',
      richCard: {
        title: 'Booking Reference',
        court: 'Center Court',
        time: '19:00',
        date: 'Wed, Oct 13',
        price: '$45.00',
        actionLabel: 'Lock In Court',
      },
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputVal.trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          context: {
            selectedCourt: 'Center Court',
            selectedTime: '19:00',
            clubOccupancy: '88%',
          },
        }),
      });

      const data = await res.json();
      const aiReply = data.reply || "Center Court is primed for high-speed action. Let's get you on court!";

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        richCard:
          query.toLowerCase().includes('court') || query.toLowerCase().includes('promo') || query.toLowerCase().includes('book')
            ? {
                title: 'Tactical Recommendation',
                court: query.toLowerCase().includes('court 4') ? 'Court 4' : 'Center Court',
                time: '19:00',
                date: 'Wed, Oct 13',
                price: '$45.00',
                actionLabel: 'Select on Board',
              }
            : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: "Center Court at 19:00 is our top recommendation for peak tactical gameplay tonight. Ready to proceed?",
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (card: ChatMessage['richCard']) => {
    if (!card) return;
    const courtId = card.court.toLowerCase().includes('4') ? 'c4' : 'c1';
    onSelectCourtAndTime?.(courtId, card.time || '19:00');
  };

  if (!isOpen) {
    return (
      <button
        onClick={onClose}
        title="Open Coach AI"
        className="fixed bottom-20 md:bottom-6 right-4 md:right-8 z-50 w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#141A16] border border-[#bef264] text-[#bef264] shadow-[0_0_20px_rgba(190,242,100,0.3)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer group"
      >
        <span className="material-symbols-outlined text-[24px] group-hover:rotate-12 transition-transform">
          smart_toy
        </span>
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#bef264] border-2 border-[#0B0F0C] animate-ping" />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-8 z-50 flex items-center gap-2 bg-[#141A16] border border-[#bef264]/60 rounded-full px-4 py-2.5 shadow-2xl backdrop-blur-xl">
        <span className="material-symbols-outlined text-[#bef264] text-[18px]">smart_toy</span>
        <span className="text-xs font-semibold text-white">Coach Assistant</span>
        <button
          onClick={() => setIsMinimized(false)}
          className="text-[#c3c9b2] hover:text-white p-0.5 ml-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">open_in_full</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-8 z-50 flex flex-col items-end pointer-events-auto">
      <div className="bg-[#141A16]/95 border border-[#232B27] rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] w-[310px] sm:w-[340px] md:w-[360px] flex flex-col overflow-hidden backdrop-blur-2xl border-t-[#bef264]/40">
        {/* Header */}
        <div className="bg-[#272B29]/90 px-4 py-3 flex items-center justify-between border-b border-[#232B27]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#bef264]/20 flex items-center justify-center border border-[#bef264]/40 shadow-[0_0_8px_rgba(190,242,100,0.2)]">
              <span className="material-symbols-outlined text-[#bef264] text-[13px]">smart_toy</span>
            </div>
            <span className="font-semibold text-xs text-white tracking-wide">Coach Assistant</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#c3c9b2]">
            <button
              onClick={() => setIsMinimized(true)}
              className="hover:text-white p-1 rounded hover:bg-[#1B2320] transition-colors cursor-pointer"
              title="Minimize"
            >
              <span className="material-symbols-outlined text-[14px]">remove</span>
            </button>
            <button
              onClick={onClose}
              className="hover:text-white p-1 rounded hover:bg-[#1B2320] transition-colors cursor-pointer"
              title="Close"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="p-3.5 flex flex-col gap-3 max-h-[340px] overflow-y-auto bg-[#0B0F0C]/60 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-6 h-6 rounded-full bg-[#bef264]/20 border border-[#bef264]/30 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[#bef264] text-[12px]">smart_toy</span>
                </div>
              )}

              <div
                className={`max-w-[84%] rounded-xl p-3 text-xs leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-[#bef264] text-[#0B0F0C] font-medium rounded-tr-none'
                    : 'bg-[#1B2320] text-[#e1e3e0] border border-[#232B27] rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>

                {/* Rich Card Attachment */}
                {msg.richCard && (
                  <div
                    onClick={() => handleCardClick(msg.richCard)}
                    className="mt-2.5 bg-[#0c0f0e] border border-[#bef264]/40 rounded-lg p-2.5 flex items-center justify-between cursor-pointer hover:bg-[#bef264]/10 hover:border-[#bef264] transition-all group"
                  >
                    <div>
                      <p className="text-[10px] text-[#bef264] font-bold uppercase tracking-wider mb-0.5">
                        {msg.richCard.title}
                      </p>
                      <p className="text-xs text-white font-medium">
                        {msg.richCard.court} • {msg.richCard.time}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-[#bef264] text-[16px] group-hover:translate-x-1 transition-transform">
                      chevron_right
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading bubble dots */}
          {isLoading && (
            <div className="flex gap-2.5 items-center">
              <div className="w-6 h-6 rounded-full bg-[#bef264]/20 border border-[#bef264]/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#bef264] text-[12px]">smart_toy</span>
              </div>
              <div className="bg-[#1B2320] text-[#e1e3e0] border border-[#232B27] rounded-xl rounded-tl-none px-3.5 py-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#bef264] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#bef264] animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#bef264] animate-bounce delay-200" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-3 py-1.5 flex gap-1.5 overflow-x-auto bg-[#141A16] border-t border-[#232B27] scrollbar-none">
          <button
            onClick={() => handleSendMessage('Court 4 Tuesday promo recommendation')}
            className="text-[10px] whitespace-nowrap bg-[#1B2320] hover:bg-[#bef264]/10 border border-[#232B27] hover:border-[#bef264]/40 text-[#c3c9b2] hover:text-white px-2 py-1 rounded-md transition-colors cursor-pointer"
          >
            📊 Tuesday Promo
          </button>
          <button
            onClick={() => handleSendMessage('What is the peak utilization hour?')}
            className="text-[10px] whitespace-nowrap bg-[#1B2320] hover:bg-[#bef264]/10 border border-[#232B27] hover:border-[#bef264]/40 text-[#c3c9b2] hover:text-white px-2 py-1 rounded-md transition-colors cursor-pointer"
          >
            ⚡ Peak Hours
          </button>
          <button
            onClick={() => handleSendMessage('Recommend best court for high speed rallies')}
            className="text-[10px] whitespace-nowrap bg-[#1B2320] hover:bg-[#bef264]/10 border border-[#232B27] hover:border-[#bef264]/40 text-[#c3c9b2] hover:text-white px-2 py-1 rounded-md transition-colors cursor-pointer"
          >
            🎾 Fast Court
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-2.5 bg-[#0c0f0e] border-t border-[#232B27]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="bg-[#141A16] rounded-full px-3.5 py-1.5 flex items-center border border-[#232B27] focus-within:border-[#bef264] focus-within:shadow-[0_0_10px_rgba(190,242,100,0.15)] transition-all"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask Coach..."
              className="bg-transparent border-none outline-none text-xs w-full text-white placeholder-[#5d6562] focus:ring-0 p-0"
            />
            <button
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="text-[#bef264] hover:scale-110 active:scale-95 disabled:opacity-40 transition-transform ml-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
