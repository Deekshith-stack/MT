import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { parseTMAIFood } from '../services/tmAiParser';
import { MultiItemAnalysisResult } from '../types/tracker';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Check,
  Plus,
  Flame,
  Info,
  Lightbulb,
} from 'lucide-react';
import { formatKcal } from '../services/nutritionService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  multiResult?: MultiItemAnalysisResult;
  timestamp: string;
}

export const TMAIChat: React.FC = () => {
  const { today, user, addFood, setActiveTab } = useTracker();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [addedMessageIds, setAddedMessageIds] = useState<string[]>([]);

  const remainingCal = Math.max(0, user.calorieGoal - today.calories);
  const remainingProtein = Math.max(0, user.proteinGoal - today.protein);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${user.name}! I'm TM AI, your nutrition and macro assistant. What did you eat today? You can enter items like "200g cooked rice and 150g chicken" or tap one of the meal ideas below.`,
      timestamp: '10:00 AM',
    },
  ]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Process with TM AI parser
    setTimeout(() => {
      const parsed = parseTMAIFood(text);
      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        multiResult: parsed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 400);
  };

  const handleAddAll = (msgId: string, result: MultiItemAnalysisResult) => {
    result.items.forEach(item => {
      addFood({
        name: item.food,
        emoji: item.emoji,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        meal: 'lunch',
        confidence: item.confidence,
        source: 'tmai',
      });
    });

    setAddedMessageIds(prev => [...prev, msgId]);
  };

  return (
    <div
      className="page-wrapper animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        maxHeight: '850px',
        gap: '0.85rem',
      }}
    >
      {/* Header Banner with Remaining Goal & Suggestions */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid rgba(255, 122, 0, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--orange-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Lightbulb size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Target Remaining: {formatKcal(remainingCal)} kcal • {remainingProtein}g Protein
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Contextual high-protein suggestions tailored to your remaining macros
              </div>
            </div>
          </div>

          {/* Contextual Smart Suggestion Chips */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleSend('3 eggs + vegetables')}
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                padding: '0.3rem 0.65rem',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-orange-light)',
                color: 'var(--primary-orange)',
                border: '1px solid rgba(255, 122, 0, 0.2)',
              }}
            >
              🍳 3 eggs + vegetables (≈300 kcal, 21g P)
            </button>
            <button
              onClick={() => handleSend('150g chicken + salad')}
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                padding: '0.3rem 0.65rem',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-orange-light)',
                color: 'var(--primary-orange)',
                border: '1px solid rgba(255, 122, 0, 0.2)',
              }}
            >
              🍗 150g chicken + salad (≈300 kcal, 47g P)
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div
        className="card"
        style={{
          flex: 1,
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          const isAdded = addedMessageIds.includes(msg.id);

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                width: '100%',
              }}
            >
              {isUser ? (
                <div
                  style={{
                    backgroundColor: 'var(--primary-orange)',
                    color: '#FFFFFF',
                    padding: '0.75rem 1rem',
                    borderRadius: '16px 16px 2px 16px',
                    maxWidth: '85%',
                    boxShadow: 'var(--shadow-orange)',
                    fontSize: '0.9375rem',
                    fontWeight: '500',
                  }}
                >
                  {msg.text}
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: 'var(--bg-card-subtle)',
                    border: '1px solid var(--border-subtle)',
                    padding: '1rem',
                    borderRadius: '16px 16px 16px 2px',
                    maxWidth: '90%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  {/* TM AI Avatar & Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: 'var(--orange-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                      }}
                    >
                      <Sparkles size={13} />
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: '800', color: 'var(--primary-orange)' }}>
                      TM AI
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Regular Text */}
                  {msg.text && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {msg.text}
                    </p>
                  )}

                  {/* Multi-Item Breakdown Card */}
                  {msg.multiResult && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                        Here is your estimated nutrition breakdown:
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {msg.multiResult.items.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.6rem 0.75rem',
                              borderRadius: '10px',
                              backgroundColor: 'var(--bg-card)',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '1.25rem' }}>{item.emoji}</span>
                              <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                  {item.food} — {item.quantity} {item.unit}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  {item.protein}g P • {item.carbs}g C • {item.fat}g F
                                </div>
                              </div>
                            </div>

                            <div style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                              {item.calories} kcal
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total Box */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 0.85rem',
                          borderRadius: '12px',
                          backgroundColor: 'var(--primary-orange-light)',
                          border: '1px solid rgba(255, 122, 0, 0.25)',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary-orange)', textTransform: 'uppercase' }}>
                            TOTAL ESTIMATE
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                            {msg.multiResult.totalProtein}g Protein • {msg.multiResult.totalCarbs}g Carbs • {msg.multiResult.totalFat}g Fat
                          </div>
                        </div>

                        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                          {formatKcal(msg.multiResult.totalCalories)} kcal
                        </div>
                      </div>

                      {/* Accuracy Disclaimer */}
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Info size={12} />
                        <span>Values may vary depending on recipe, oil and preparation method.</span>
                      </div>

                      {/* Action Button: Add All */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        {isAdded ? (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.6rem 1rem',
                              borderRadius: '10px',
                              backgroundColor: 'var(--color-success-bg)',
                              color: 'var(--color-success)',
                              fontSize: '0.8125rem',
                              fontWeight: '700',
                            }}
                          >
                            <Check size={16} /> Added to Today's Macros!
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddAll(msg.id, msg.multiResult!)}
                            className="btn-primary"
                            style={{ padding: '0.6rem 1.25rem', fontSize: '0.8125rem', borderRadius: '10px' }}
                          >
                            <Plus size={16} />
                            + Add All to Today
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-card)',
          padding: '0.5rem',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder='e.g., "200g cooked rice and 150g chicken"'
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            padding: '0.5rem 0.75rem',
            fontSize: '0.9375rem',
            color: 'var(--text-primary)',
          }}
        />

        <button
          type="button"
          onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRec) {
              alert('Speech recognition not available.');
              return;
            }
            const rec = new SpeechRec();
            rec.lang = 'en-US';
            rec.onstart = () => setIsListening(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rec.onresult = (e: any) => {
              const text = e.results[0][0].transcript;
              setInput(text);
              setIsListening(false);
              handleSend(text);
            };
            rec.onerror = () => setIsListening(false);
            rec.onend = () => setIsListening(false);
            rec.start();
          }}
          style={{ padding: '0.5rem', color: isListening ? '#EF4444' : 'var(--text-secondary)' }}
          title="Voice input"
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <button
          type="submit"
          disabled={!input.trim()}
          className="btn-primary"
          style={{ padding: '0.6rem 1rem', borderRadius: '12px' }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
