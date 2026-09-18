import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { MealType, FoodItem } from '../types/tracker';
import { Plus, Trash2, Calendar, ChevronLeft, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatKcal } from '../services/nutritionService';

export const FoodLog: React.FC = () => {
  const { today, user, deleteFood, setActiveTab } = useTracker();
  const [selectedDate, setSelectedDate] = useState('Friday, September 18');

  const mealSections: { type: MealType; title: string; emoji: string }[] = [
    { type: 'breakfast', title: 'Breakfast', emoji: '🍳' },
    { type: 'lunch', title: 'Lunch', emoji: '🥗' },
    { type: 'dinner', title: 'Dinner', emoji: '🍲' },
    { type: 'snack', title: 'Snacks & Extras', emoji: '🍎' },
  ];

  const getFoodsForMeal = (meal: MealType): FoodItem[] => {
    return today.foods.filter(f => f.meal === meal);
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Date Header & Quick Add */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            style={{
              padding: '0.45rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={18} color="var(--primary-orange)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              {selectedDate}
            </h2>
          </div>
          <button
            style={{
              padding: '0.45rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <button
          onClick={() => setActiveTab('add')}
          className="btn-primary"
          style={{ padding: '0.55rem 1rem', fontSize: '0.8125rem' }}
        >
          <Plus size={16} />
          <span>+ Add Food</span>
        </button>
      </div>

      {/* Meal Group Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {mealSections.map(section => {
          const foods = getFoodsForMeal(section.type);
          const mealCalories = foods.reduce((sum, f) => sum + f.calories, 0);
          const mealProtein = Math.round(foods.reduce((sum, f) => sum + f.protein, 0) * 10) / 10;

          return (
            <div key={section.type} className="card" style={{ padding: '1.25rem' }}>
              {/* Meal Section Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{section.emoji}</span>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {section.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)', fontWeight: '700' }}>
                      {formatKcal(mealCalories)}
                    </strong>{' '}
                    kcal • <span style={{ color: 'var(--primary-orange)', fontWeight: '600' }}>{mealProtein}g P</span>
                  </div>

                  <button
                    onClick={() => setActiveTab('add')}
                    title={`Add food to ${section.title}`}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--primary-orange-light)',
                      color: 'var(--primary-orange)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Items List */}
              {foods.length === 0 ? (
                <div
                  style={{
                    padding: '1.25rem',
                    textAlign: 'center',
                    color: 'var(--text-tertiary)',
                    fontSize: '0.8125rem',
                    backgroundColor: 'var(--bg-card-subtle)',
                    borderRadius: '12px',
                  }}
                >
                  No items logged for {section.title.toLowerCase()} yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {foods.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 0.85rem',
                        borderRadius: '12px',
                        backgroundColor: 'var(--bg-card-subtle)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.6rem' }}>{item.emoji}</span>
                        <div>
                          <div style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {item.quantity} {item.unit}
                            {item.source === 'tmai' && (
                              <span
                                style={{
                                  marginLeft: '0.4rem',
                                  color: 'var(--primary-orange)',
                                  fontWeight: '600',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                }}
                              >
                                <Sparkles size={11} /> TM AI
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.9375rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                            {formatKcal(item.calories)} kcal
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <span style={{ color: 'var(--primary-orange)', fontWeight: '600' }}>{item.protein}g P</span> •{' '}
                            <span>{item.carbs}g C</span> • <span>{item.fat}g F</span>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteFood(item.id)}
                          title="Delete"
                          style={{
                            padding: '0.4rem',
                            color: 'var(--text-tertiary)',
                            borderRadius: '8px',
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
          );
        })}
      </div>

      {/* Bottom Summary: Today's Total */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--bg-card)',
          border: '2px solid var(--primary-orange)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Today's Total Nutrition
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Summary of all meals consumed on {selectedDate}
            </p>
          </div>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: '700',
            }}
          >
            <CheckCircle2 size={14} />
            On Track
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.75rem',
            textAlign: 'center',
          }}
        >
          <div style={{ padding: '0.75rem 0.5rem', borderRadius: '12px', backgroundColor: 'var(--primary-orange-light)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary-orange)' }}>
              Calories
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {formatKcal(today.calories)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>/ {user.calorieGoal} kcal</div>
          </div>

          <div style={{ padding: '0.75rem 0.5rem', borderRadius: '12px', backgroundColor: 'var(--bg-card-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#FF7A00' }}>
              Protein
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {Math.round(today.protein)}g
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>/ {user.proteinGoal}g</div>
          </div>

          <div style={{ padding: '0.75rem 0.5rem', borderRadius: '12px', backgroundColor: 'var(--bg-card-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#3B82F6' }}>
              Carbs
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {Math.round(today.carbs)}g
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>/ {user.carbGoal}g</div>
          </div>

          <div style={{ padding: '0.75rem 0.5rem', borderRadius: '12px', backgroundColor: 'var(--bg-card-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#F59E0B' }}>
              Fat
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {Math.round(today.fat)}g
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>/ {user.fatGoal}g</div>
          </div>
        </div>
      </div>
    </div>
  );
};
