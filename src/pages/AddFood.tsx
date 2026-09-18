import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { FOOD_DATABASE, FoodDatabaseEntry } from '../data/foodDatabase';
import { parseTMAIFood } from '../../src/services/tmAiParser';
import { FoodConfirmationModal } from '../components/food/FoodConfirmationModal';
import { TMAIAnalysisResult, MealType } from '../types/tracker';
import {
  Sparkles,
  Search,
  PenTool,
  Camera,
  Plus,
  Mic,
  MicOff,
  CheckCircle2,
  Scan,
  Upload,
} from 'lucide-react';
import { formatKcal } from '../services/nutritionService';

export const AddFood: React.FC = () => {
  const { addFood, setActiveTab } = useTracker();
  const [activeSubTab, setActiveSubTab] = useState<'tmai' | 'search' | 'manual' | 'scan'>('tmai');

  // TM AI State
  const [aiInput, setAiInput] = useState('');
  const [selectedResult, setSelectedResult] = useState<TMAIAnalysisResult | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Manual Form State
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualQuantity, setManualQuantity] = useState('100');
  const [manualUnit, setManualUnit] = useState('g');
  const [manualMeal, setManualMeal] = useState<MealType>('lunch');

  // Scanner Simulator State
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);

  const samplePrompts = [
    '250g chicken biryani',
    '200g chicken',
    '2 boiled eggs',
    '150g paneer',
    '1 banana',
    '3 idlis',
    '1 dosa with 2 eggs',
    '1 scoop whey protein in 250ml milk',
  ];

  const handleAISubmit = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const query = customText || aiInput;
    if (!query.trim()) return;

    const parsed = parseTMAIFood(query);
    if (parsed.items.length > 0) {
      setSelectedResult(parsed.items[0]);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    addFood({
      name: manualName,
      emoji: '🍽️',
      quantity: parseFloat(manualQuantity) || 100,
      unit: manualUnit,
      calories: parseInt(manualCalories, 10) || 0,
      protein: parseFloat(manualProtein) || 0,
      carbs: parseFloat(manualCarbs) || 0,
      fat: parseFloat(manualFat) || 0,
      meal: manualMeal,
      confidence: 'exact',
      source: 'manual',
    });

    setActiveTab('food');
  };

  // Filter Database Foods
  const filteredFoods = FOOD_DATABASE.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.aliases.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectDbFood = (food: FoodDatabaseEntry) => {
    const qty = food.defaultServing;
    const unit = food.defaultUnit;
    let cal = 0;
    let p = 0;
    let c = 0;
    let f = 0;

    if (food.caloriesPerPiece !== undefined && ['piece', 'scoop', 'tbsp', 'slice'].includes(unit)) {
      cal = food.caloriesPerPiece * qty;
      p = (food.proteinPerPiece || 0) * qty;
      c = (food.carbsPerPiece || 0) * qty;
      f = (food.fatPerPiece || 0) * qty;
    } else if (food.caloriesPer100g !== undefined) {
      const factor = qty / 100;
      cal = food.caloriesPer100g * factor;
      p = (food.proteinPer100g || 0) * factor;
      c = (food.carbsPer100g || 0) * factor;
      f = (food.fatPer100g || 0) * factor;
    }

    setSelectedResult({
      food: food.name,
      emoji: food.emoji,
      quantity: qty,
      unit,
      calories: Math.round(cal),
      protein: Math.round(p * 10) / 10,
      carbs: Math.round(c * 10) / 10,
      fat: Math.round(f * 10) / 10,
      confidence: 'exact',
    });
  };

  const simulateLabelScan = (labelName: string, cal: number, p: number, c: number, f: number) => {
    setIsScanning(true);
    setScanSuccess(null);

    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(`Recognized nutrition facts for: ${labelName}`);
      setSelectedResult({
        food: labelName,
        emoji: '🏷️',
        quantity: 1,
        unit: 'serving',
        calories: cal,
        protein: p,
        carbs: c,
        fat: f,
        confidence: 'exact',
      });
    }, 900);
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
          Add Food
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Choose your preferred method to log meals into your daily macros
        </p>
      </div>

      {/* 4 Method Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-card)',
          padding: '0.4rem',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {[
          { id: 'tmai', label: 'TM AI', icon: <Sparkles size={16} /> },
          { id: 'search', label: 'Search', icon: <Search size={16} /> },
          { id: 'manual', label: 'Manual', icon: <PenTool size={16} /> },
          { id: 'scan', label: 'Scan Label', icon: <Camera size={16} /> },
        ].map(tab => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.65rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.8125rem',
                fontWeight: isActive ? '700' : '600',
                backgroundColor: isActive ? 'var(--primary-orange)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                boxShadow: isActive ? 'var(--shadow-orange)' : 'none',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TM AI */}
      {activeSubTab === 'tmai' && (
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--orange-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '800' }}>Ask TM AI</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Type or speak what you ate — TM AI calculates calories and macros instantly.
              </p>
            </div>
          </div>

          <form onSubmit={handleAISubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-input)',
                borderRadius: '16px',
                border: '2px solid var(--border-subtle)',
                padding: '0.5rem 0.85rem',
              }}
            >
              <input
                type="text"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                placeholder='e.g., "250g chicken biryani", "2 boiled eggs and 1 banana"'
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1rem',
                  color: 'var(--text-primary)',
                  padding: '0.5rem 0',
                }}
              />

              <button
                type="button"
                onClick={() => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                  if (!SpeechRec) {
                    alert('Speech recognition is not available. Please type directly!');
                    return;
                  }
                  const rec = new SpeechRec();
                  rec.lang = 'en-US';
                  rec.onstart = () => setIsListening(true);
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  rec.onresult = (e: any) => {
                    const text = e.results[0][0].transcript;
                    setAiInput(text);
                    setIsListening(false);
                    handleAISubmit(undefined, text);
                  };
                  rec.onerror = () => setIsListening(false);
                  rec.onend = () => setIsListening(false);
                  rec.start();
                }}
                style={{ padding: '0.5rem', color: isListening ? '#EF4444' : 'var(--text-secondary)' }}
                title="Voice Input"
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={!aiInput.trim()}
              className="btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
            >
              <Sparkles size={18} />
              <span>Calculate with TM AI</span>
            </button>
          </form>

          {/* Quick Test Prompt Pills */}
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Quick Examples:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {samplePrompts.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => {
                    setAiInput(prompt);
                    handleAISubmit(undefined, prompt);
                  }}
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-card-subtle)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Search Food Database */}
      {activeSubTab === 'search' && (
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-input)',
              borderRadius: '14px',
              padding: '0.45rem 0.85rem',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Search size={18} color="var(--text-secondary)" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search rice, chicken, eggs, paneer, oats..."
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: '0.9375rem',
                color: 'var(--text-primary)',
                marginLeft: '0.5rem',
              }}
            />
          </div>

          {/* Category Chips */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {['all', 'protein', 'grain', 'dairy', 'fruit', 'meal', 'vegetable', 'fat'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: selectedCategory === cat ? '700' : '500',
                  textTransform: 'capitalize',
                  backgroundColor: selectedCategory === cat ? 'var(--primary-orange)' : 'var(--bg-card-subtle)',
                  color: selectedCategory === cat ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Database Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '420px', overflowY: 'auto' }}>
            {filteredFoods.map(food => (
              <div
                key={food.id}
                onClick={() => handleSelectDbFood(food)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                }}
                onMouseOver={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-orange)')}
                onMouseOut={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.6rem' }}>{food.emoji}</span>
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {food.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Per {food.defaultServing} {food.defaultUnit}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {food.caloriesPerPiece
                        ? formatKcal(food.caloriesPerPiece * food.defaultServing)
                        : formatKcal((food.caloriesPer100g || 0) * (food.defaultServing / 100))}{' '}
                      kcal
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary-orange)', fontWeight: '600' }}>
                      {food.proteinPerPiece
                        ? Math.round(food.proteinPerPiece * food.defaultServing)
                        : Math.round((food.proteinPer100g || 0) * (food.defaultServing / 100))}
                      g protein
                    </div>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderRadius: '8px' }}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Manual Entry */}
      {activeSubTab === 'manual' && (
        <form
          onSubmit={handleManualSubmit}
          className="card"
          style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}
        >
          <h3 style={{ fontSize: '1.125rem', fontWeight: '800' }}>Manual Nutrition Entry</h3>

          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
              Food Name *
            </label>
            <input
              type="text"
              required
              value={manualName}
              onChange={e => setManualName(e.target.value)}
              placeholder="e.g., Mom's Special Curry"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                Quantity
              </label>
              <input
                type="number"
                value={manualQuantity}
                onChange={e => setManualQuantity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                Unit
              </label>
              <select
                value={manualUnit}
                onChange={e => setManualUnit(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="g">grams (g)</option>
                <option value="piece">pieces</option>
                <option value="ml">ml</option>
                <option value="scoop">scoops</option>
                <option value="cup">cups</option>
                <option value="serving">serving</option>
              </select>
            </div>
          </div>

          {/* Macro Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary-orange)', display: 'block', marginBottom: '0.2rem' }}>
                Calories
              </label>
              <input
                type="number"
                required
                value={manualCalories}
                onChange={e => setManualCalories(e.target.value)}
                placeholder="kcal"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#FF7A00', display: 'block', marginBottom: '0.2rem' }}>
                Protein (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={manualProtein}
                onChange={e => setManualProtein(e.target.value)}
                placeholder="g"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#3B82F6', display: 'block', marginBottom: '0.2rem' }}>
                Carbs (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={manualCarbs}
                onChange={e => setManualCarbs(e.target.value)}
                placeholder="g"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#F59E0B', display: 'block', marginBottom: '0.2rem' }}>
                Fat (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={manualFat}
                onChange={e => setManualFat(e.target.value)}
                placeholder="g"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {/* Meal Selection */}
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
              Assign to Meal
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
              {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(m => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setManualMeal(m)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: manualMeal === m ? '700' : '500',
                    textTransform: 'capitalize',
                    backgroundColor: manualMeal === m ? 'var(--primary-orange)' : 'var(--bg-card-subtle)',
                    color: manualMeal === m ? '#FFFFFF' : 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
            <Plus size={18} />
            <span>Save & Log Food</span>
          </button>
        </form>
      )}

      {/* TAB 4: Scan Food Label */}
      {activeSubTab === 'scan' && (
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--orange-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Camera size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '800' }}>Scan Food Nutrition Label</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Point camera or select a packaged food label to auto-extract macros.
              </p>
            </div>
          </div>

          {/* Scanner Viewfinder Simulation */}
          <div
            style={{
              height: '200px',
              backgroundColor: 'var(--bg-card-subtle)',
              borderRadius: '18px',
              border: '2px dashed var(--primary-orange)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {isScanning ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <Scan size={36} color="var(--primary-orange)" className="animate-spin" />
                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--primary-orange)' }}>
                  OCR Analyzing Nutrition Facts...
                </span>
              </div>
            ) : (
              <>
                <Camera size={38} color="var(--text-secondary)" />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  Select a sample label below or upload photo
                </span>
              </>
            )}
          </div>

          {scanSuccess && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                borderRadius: '10px',
                fontSize: '0.8125rem',
                fontWeight: '600',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{scanSuccess}</span>
            </div>
          )}

          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Simulate Label Scanner on Packaged Foods:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
              {[
                { name: 'Greek Yogurt Pot', cal: 130, p: 17, c: 6, f: 0 },
                { name: 'Whey Isolate Shake', cal: 140, p: 30, c: 2, f: 1 },
                { name: 'Protein Oats Bar', cal: 210, p: 12, c: 26, f: 6 },
                { name: 'Peanut Butter (2 tbsp)', cal: 190, p: 8, c: 7, f: 16 },
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => simulateLabelScan(item.name, item.cal, item.p, item.c, item.f)}
                  style={{
                    padding: '0.65rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-card-subtle)',
                    border: '1px solid var(--border-subtle)',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    {item.cal} kcal • {item.p}g P
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedResult && (
        <FoodConfirmationModal
          item={selectedResult}
          onClose={() => setSelectedResult(null)}
          onSuccess={() => setActiveTab('food')}
        />
      )}
    </div>
  );
};
