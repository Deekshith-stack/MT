import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { calculateBMR, calculateTDEE, calculateRecommendedTargets } from '../services/nutritionService';
import { User, Check, Calculator, Footprints, ExternalLink, RefreshCw } from 'lucide-react';

export const Profile: React.FC = () => {
  const {
    user,
    updateUser,
    triggerGoalCelebration,
    healthState,
    setIsHealthConnectModalOpen,
    syncHealthSteps,
  } = useTracker();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form State
  const [name, setName] = useState(user.name);
  const [weight, setWeight] = useState(user.weight.toString());
  const [targetWeight, setTargetWeight] = useState(user.targetWeight.toString());
  const [height, setHeight] = useState(user.height.toString());
  const [age, setAge] = useState(user.age.toString());
  const [gender, setGender] = useState(user.gender);
  const [activityLevel, setActivityLevel] = useState(user.activityLevel);
  const [goal, setGoal] = useState(user.goal);

  // Targets State
  const [calorieGoal, setCalorieGoal] = useState(user.calorieGoal.toString());
  const [proteinGoal, setProteinGoal] = useState(user.proteinGoal.toString());
  const [carbGoal, setCarbGoal] = useState(user.carbGoal.toString());
  const [fatGoal, setFatGoal] = useState(user.fatGoal.toString());
  const [waterGoal, setWaterGoal] = useState(user.waterGoal.toString());
  const [stepGoal, setStepGoal] = useState(user.stepGoal.toString());

  const bmr = calculateBMR(user);
  const tdee = calculateTDEE(user);
  const isConnected = healthState.status === 'connected';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateUser({
      name,
      weight: parseFloat(weight) || 65,
      targetWeight: parseFloat(targetWeight) || 60,
      height: parseFloat(height) || 165,
      age: parseInt(age, 10) || 26,
      gender,
      activityLevel,
      goal,
      calorieGoal: parseInt(calorieGoal, 10) || 2000,
      proteinGoal: parseInt(proteinGoal, 10) || 120,
      carbGoal: parseInt(carbGoal, 10) || 220,
      fatGoal: parseInt(fatGoal, 10) || 65,
      waterGoal: parseInt(waterGoal, 10) || 2500,
      stepGoal: parseInt(stepGoal, 10) || 10000,
    });

    setSavedSuccess(true);
    triggerGoalCelebration();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAutoCalculate = () => {
    const tempUser = {
      ...user,
      weight: parseFloat(weight) || user.weight,
      height: parseFloat(height) || user.height,
      age: parseInt(age, 10) || user.age,
      gender,
      activityLevel,
      goal,
    };
    const targets = calculateRecommendedTargets(tempUser);
    setCalorieGoal(targets.calories.toString());
    setProteinGoal(targets.protein.toString());
    setCarbGoal(targets.carbs.toString());
    setFatGoal(targets.fat.toString());
    setWaterGoal(targets.water.toString());
    setStepGoal(targets.steps.toString());
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
          Profile & Macro Targets
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Personalize your biometrics, metabolic calculations, and daily nutrition targets
        </p>
      </div>

      {savedSuccess && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            fontSize: '0.875rem',
            fontWeight: '700',
          }}
        >
          <Check size={18} />
          <span>Profile and daily targets updated successfully!</span>
        </div>
      )}

      {/* HEALTH CONNECTIONS STATUS CARD (Section 15 of prompt) */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--orange-gradient)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Footprints size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary-orange)' }}>
                HEALTH CONNECTIONS
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Steps
              </h3>
            </div>
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '0.2rem 0.65rem',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              backgroundColor: isConnected ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
              color: isConnected ? 'var(--color-success)' : 'var(--color-warning)',
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: isConnected ? 'var(--color-success)' : 'var(--color-warning)' }} />
            {isConnected ? '● Connected' : '○ Not connected'}
          </span>
        </div>

        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Health Connect (Phone sensor + fitness apps)
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Last synced: <strong style={{ color: 'var(--text-primary)' }}>{healthState.lastSynced}</strong>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isConnected && (
              <button
                type="button"
                onClick={async () => {
                  setIsSyncing(true);
                  await syncHealthSteps();
                  setTimeout(() => setIsSyncing(false), 400);
                }}
                className="btn-secondary"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem', borderRadius: '8px' }}
              >
                <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                Sync
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsHealthConnectModalOpen(true)}
              className="btn-primary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem', borderRadius: '8px' }}
            >
              <ExternalLink size={13} />
              <span>{isConnected ? 'Manage Access' : 'Connect Health Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metabolic Summary Banner */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid rgba(255, 122, 0, 0.25)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
            BASAL METABOLIC RATE (BMR)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {bmr} <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>kcal/day</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Mifflin-St Jeor formula</div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
            MAINTENANCE ENERGY (TDEE)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-orange)', marginTop: '0.2rem' }}>
            {tdee} <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>kcal/day</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>With moderate physical activity</div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
            TARGET DEFICIT
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-success)', marginTop: '0.2rem' }}>
            -{tdee - user.calorieGoal} <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>kcal/day</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>~0.45 kg loss per week</div>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Biometrics Card */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} color="var(--primary-orange)" />
            Personal Biometrics
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
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
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Current Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={e => setWeight(e.target.value)}
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
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Target Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={e => setTargetWeight(e.target.value)}
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
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Height (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={e => setHeight(e.target.value)}
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
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
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
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Gender
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Activity Level
              </label>
              <select
                value={activityLevel}
                onChange={e => setActivityLevel(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="sedentary">Sedentary (desk job, minimal movement)</option>
                <option value="light">Light Activity (1-3 days/week exercise)</option>
                <option value="moderate">Moderate Activity (3-5 days/week exercise)</option>
                <option value="very_active">Very Active (6-7 days intense exercise)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Primary Goal
              </label>
              <select
                value={goal}
                onChange={e => setGoal(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="lose">Lose Weight (Calorie Deficit)</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Gain Weight / Muscle Hypertrophy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Targets Card */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '800' }}>
              Daily Nutritional & Activity Targets
            </h3>
            <button
              type="button"
              onClick={handleAutoCalculate}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem', borderRadius: '10px' }}
            >
              <Calculator size={14} /> Auto-Optimize Targets
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--primary-orange)', display: 'block', marginBottom: '0.35rem' }}>
                Daily Calories (kcal)
              </label>
              <input
                type="number"
                value={calorieGoal}
                onChange={e => setCalorieGoal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontWeight: '700',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#FF7A00', display: 'block', marginBottom: '0.35rem' }}>
                Protein Target (g)
              </label>
              <input
                type="number"
                value={proteinGoal}
                onChange={e => setProteinGoal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontWeight: '700',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#3B82F6', display: 'block', marginBottom: '0.35rem' }}>
                Carbs Target (g)
              </label>
              <input
                type="number"
                value={carbGoal}
                onChange={e => setCarbGoal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontWeight: '700',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#F59E0B', display: 'block', marginBottom: '0.35rem' }}>
                Fat Target (g)
              </label>
              <input
                type="number"
                value={fatGoal}
                onChange={e => setFatGoal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontWeight: '700',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#3B82F6', display: 'block', marginBottom: '0.35rem' }}>
                Water Goal (ml)
              </label>
              <input
                type="number"
                value={waterGoal}
                onChange={e => setWaterGoal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontWeight: '700',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--primary-orange)', display: 'block', marginBottom: '0.35rem' }}>
                Step Goal (steps)
              </label>
              <input
                type="number"
                value={stepGoal}
                onChange={e => setStepGoal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontWeight: '700',
                }}
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ padding: '0.85rem', fontSize: '1rem' }}>
          <Check size={18} />
          <span>Save Profile & Targets</span>
        </button>
      </form>
    </div>
  );
};
