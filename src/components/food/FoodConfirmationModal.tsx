import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { TMAIAnalysisResult, MealType } from '../../types/tracker';
import { Sparkles, X, Plus, Minus, Check, Edit3, AlertCircle } from 'lucide-react';
import { formatKcal } from '../../services/nutritionService';

interface FoodConfirmationModalProps {
  item: TMAIAnalysisResult;
  onClose: () => void;
  onSuccess?: () => void;
  defaultMeal?: MealType;
}

export const FoodConfirmationModal: React.FC<FoodConfirmationModalProps> = ({
  item,
  onClose,
  onSuccess,
  defaultMeal = 'lunch',
}) => {
  const { addFood } = useTracker();

  // Local state allowing the user to tweak quantity or meal before adding
  const [quantity, setQuantity] = useState<number>(item.quantity || 100);
  const [unit, setUnit] = useState<string>(item.unit || 'g');
  const [meal, setMeal] = useState<MealType>(defaultMeal);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [foodName, setFoodName] = useState<string>(item.food);

  // Ratio scaling for macros if quantity changed
  const ratio = (item.quantity && item.quantity > 0) ? (quantity / item.quantity) : 1;
  const currentCalories = Math.round(item.calories * ratio);
  const currentProtein = Math.round(item.protein * ratio * 10) / 10;
  const currentCarbs = Math.round(item.carbs * ratio * 10) / 10;
  const currentFat = Math.round(item.fat * ratio * 10) / 10;

  const handleAdd = () => {
    addFood({
      name: foodName,
      emoji: item.emoji || '🍽️',
      quantity,
      unit,
      calories: currentCalories,
      protein: currentProtein,
      carbs: currentCarbs,
      fat: currentFat,
      meal,
      confidence: item.confidence,
      source: 'tmai',
    });

    onClose();
    if (onSuccess) onSuccess();
  };

  const adjustQty = (delta: number) => {
    setQuantity(prev => {
      const step = unit === 'piece' || unit === 'scoop' ? 1 : 25;
      const next = Math.max(1, prev + delta * step);
      return next;
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(5px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '1.5rem',
          backgroundColor: 'var(--bg-card)',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: '24px',
          border: '1px solid var(--border-subtle)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'var(--primary-orange-light)',
                color: 'var(--primary-orange)',
                padding: '0.25rem 0.65rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '800',
                letterSpacing: '0.04em',
              }}
            >
              <Sparkles size={14} />
              TM AI RESULT
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-card-subtle)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Food Item Title & Emoji */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              fontSize: '2.25rem',
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-card-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {item.emoji || '🍗'}
          </div>

          <div style={{ flex: 1 }}>
            {isEditing ? (
              <input
                type="text"
                value={foodName}
                onChange={e => setFoodName(e.target.value)}
                style={{
                  width: '100%',
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  padding: '0.35rem 0.5rem',
                  borderRadius: '8px',
                  border: '1px solid var(--primary-orange)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {foodName}
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  style={{ color: 'var(--text-tertiary)', padding: '2px' }}
                  title="Rename"
                >
                  <Edit3 size={14} />
                </button>
              </div>
            )}
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Estimated serving: {quantity} {unit}
            </div>
          </div>
        </div>

        {/* Quantity Adjuster */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--bg-card-subtle)',
            borderRadius: '14px',
            marginBottom: '1.25rem',
          }}
        >
          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Serving Quantity:
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={() => adjustQty(-1)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
              }}
            >
              <Minus size={16} />
            </button>

            <span style={{ fontSize: '1.05rem', fontWeight: '800', minWidth: '45px', textAlign: 'center' }}>
              {quantity} {unit}
            </span>

            <button
              onClick={() => adjustQty(1)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
              }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Nutritional Breakdown Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.6rem',
            marginBottom: '1.25rem',
          }}
        >
          <div
            style={{
              padding: '0.75rem 0.5rem',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-orange-light)',
              textAlign: 'center',
              border: '1px solid rgba(255, 122, 0, 0.2)',
            }}
          >
            <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--primary-orange)', textTransform: 'uppercase' }}>
              Calories
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {formatKcal(currentCalories)}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>kcal</div>
          </div>

          <div
            style={{
              padding: '0.75rem 0.5rem',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-card-subtle)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: '#FF7A00', textTransform: 'uppercase' }}>
              Protein
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {currentProtein}g
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>protein</div>
          </div>

          <div
            style={{
              padding: '0.75rem 0.5rem',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-card-subtle)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: '#3B82F6', textTransform: 'uppercase' }}>
              Carbs
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {currentCarbs}g
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>carbs</div>
          </div>

          <div
            style={{
              padding: '0.75rem 0.5rem',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-card-subtle)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: '#F59E0B', textTransform: 'uppercase' }}>
              Fat
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {currentFat}g
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>fats</div>
          </div>
        </div>

        {/* Meal Selector */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
            Assign to Meal:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(m => {
              const isSelected = meal === m;
              return (
                <button
                  key={m}
                  onClick={() => setMeal(m)}
                  style={{
                    padding: '0.5rem 0.25rem',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? '700' : '500',
                    textTransform: 'capitalize',
                    backgroundColor: isSelected ? 'var(--primary-orange)' : 'var(--bg-card-subtle)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                    border: `1px solid ${isSelected ? 'var(--primary-orange)' : 'var(--border-subtle)'}`,
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Disclaimer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.4rem',
            padding: '0.65rem',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-card-subtle)',
            marginBottom: '1.25rem',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
          }}
        >
          <AlertCircle size={14} color="var(--primary-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>ⓘ Values may vary depending on recipe, oil and preparation method.</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ flex: 1, padding: '0.75rem' }}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="btn-primary"
            style={{ flex: 2, padding: '0.75rem' }}
          >
            <Check size={18} />
            Add to Today
          </button>
        </div>
      </div>
    </div>
  );
};
