import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { parseTMAIFood } from '../../services/tmAiParser';
import { Sparkles, Mic, MicOff, ArrowRight } from 'lucide-react';
import { FoodConfirmationModal } from '../food/FoodConfirmationModal';
import { TMAIAnalysisResult } from '../../types/tracker';

export const QuickTMAI: React.FC = () => {
  const { setActiveTab } = useTracker();
  const [input, setInput] = useState('');
  const [selectedResult, setSelectedResult] = useState<TMAIAnalysisResult | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const samplePills = [
    '200g chicken',
    '2 eggs',
    '150g paneer',
    '250g chicken biryani',
    '1 banana',
    '3 idlis',
    '1 dosa with 2 eggs',
  ];

  const handleAnalyze = (queryToAnalyze?: string) => {
    const text = queryToAnalyze || input;
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      const parsed = parseTMAIFood(text);
      setIsAnalyzing(false);
      if (parsed.items.length > 0) {
        // If single item, open confirmation directly
        setSelectedResult(parsed.items[0]);
      } else {
        setActiveTab('tmai');
      }
    }, 250);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAnalyze();
    }
  };

  // Speech-to-text integration
  const toggleSpeech = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type directly!');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleAnalyze(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 122, 0, 0.25)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.85rem',
        }}
      >
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
              color: '#FFFFFF',
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              TM AI Quick Food Log
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Natural language nutrition calculation
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('tmai')}
          style={{
            fontSize: '0.75rem',
            fontWeight: '700',
            color: 'var(--primary-orange)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          Open Chat <ArrowRight size={13} />
        </button>
      </div>

      {/* Input Form */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-input)',
          borderRadius: '14px',
          padding: '0.35rem 0.5rem 0.35rem 0.85rem',
          border: '1px solid var(--border-subtle)',
          transition: 'border-color 0.2s ease',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='What did you eat? e.g. "200g chicken"'
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            fontSize: '0.9375rem',
            color: 'var(--text-primary)',
            padding: '0.4rem 0',
          }}
        />

        {/* Voice button */}
        <button
          onClick={toggleSpeech}
          title={isListening ? 'Listening...' : 'Speak food'}
          style={{
            padding: '0.5rem',
            color: isListening ? '#EF4444' : 'var(--text-secondary)',
            marginRight: '0.25rem',
          }}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* TM AI Button */}
        <button
          onClick={() => handleAnalyze()}
          disabled={!input.trim() || isAnalyzing}
          className="btn-primary"
          style={{
            padding: '0.55rem 1rem',
            fontSize: '0.8125rem',
            borderRadius: '10px',
            opacity: !input.trim() ? 0.6 : 1,
          }}
        >
          <Sparkles size={14} />
          <span>{isAnalyzing ? 'Analyzing...' : 'TM AI ✨'}</span>
        </button>
      </div>

      {/* Quick Pills */}
      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '600' }}>TRY:</span>
        {samplePills.map(pill => (
          <button
            key={pill}
            onClick={() => {
              setInput(pill);
              handleAnalyze(pill);
            }}
            style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              padding: '0.2rem 0.55rem',
              borderRadius: '999px',
              backgroundColor: 'var(--bg-card-subtle)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-orange)';
              (e.currentTarget as HTMLElement).style.color = 'var(--primary-orange)';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
          >
            {pill}
          </button>
        ))}
      </div>

      {selectedResult && (
        <FoodConfirmationModal
          item={selectedResult}
          onClose={() => {
            setSelectedResult(null);
            setInput('');
          }}
          defaultMeal="lunch"
        />
      )}
    </div>
  );
};
