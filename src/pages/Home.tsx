import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { CalorieRing } from '../components/dashboard/CalorieRing';
import { MacroCards } from '../components/dashboard/MacroCards';
import { StepCard } from '../components/dashboard/StepCard';
import { WaterCard } from '../components/dashboard/WaterCard';
import { QuickTMAI } from '../components/dashboard/QuickTMAI';
import { UtensilsCrossed, Plus, ArrowRight, Trash2 } from 'lucide-react';
import { formatKcal } from '../services/nutritionService';

export const Home: React.FC = () => {
  const { today, deleteFood, setActiveTab } = useTracker();

  // Show up to 4 recent foods logged today
  const recentFoods = today.foods.slice(0, 4);

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Calorie & Macro Hero */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <CalorieRing />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <MacroCards />
          <QuickTMAI />
        </div>
      </div>

      {/* Activity & Water Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <StepCard />
        <WaterCard />
      </div>

      {/* Today's Food Summary Snippet */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 122, 0, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-orange)',
              }}
            >
              <UtensilsCrossed size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Today's Meals
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {today.foods.length} items logged ({formatKcal(today.calories)} kcal)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('add')}
              className="btn-primary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem', borderRadius: '10px' }}
            >
              <Plus size={14} />
              <span>+ Add Food</span>
            </button>
            <button
              onClick={() => setActiveTab('food')}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem', borderRadius: '10px' }}
            >
              <span>View Log</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {recentFoods.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            No foods logged yet today. Type "200g chicken" above to test TM AI!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentFoods.map(food => (
              <div
                key={food.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{food.emoji}</span>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {food.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {food.quantity} {food.unit} • <span style={{ textTransform: 'capitalize' }}>{food.meal}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {formatKcal(food.calories)} kcal
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary-orange)' }}>
                      {food.protein}g protein
                    </div>
                  </div>

                  <button
                    onClick={() => deleteFood(food.id)}
                    title="Delete item"
                    style={{
                      padding: '0.4rem',
                      borderRadius: '8px',
                      color: 'var(--text-tertiary)',
                    }}
                    onMouseOver={e => ((e.currentTarget as HTMLElement).style.color = '#EF4444')}
                    onMouseOut={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
