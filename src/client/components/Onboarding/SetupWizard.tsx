import React, { useState } from 'react';
import { UserConfig } from '../../../shared/interfaces';

/**
 * Setup Wizard Component
 * A multi-step onboarding form for first-time users.
 */

const SetupWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserConfig>>({
    userName: '',
    monthlyBudgetTarget: 0,
    habits: [
      { name: '', mini: '1x', plus: '20x', elite: 'Gym 1hr' }
    ],
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = () => {
    // @ts-ignore (google.script.run provided by gas-client or global)
    google.script.run
      .withSuccessHandler(() => {
        alert('Welcome to Harmony Tracker! Refreshing...');
        // @ts-ignore
        google.script.host.close();
      })
      .saveUserConfig(formData);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      {step === 1 && (
        <div className="animate-in fade-in duration-500">
          <h1 className="text-2xl font-bold text-emerald-700 mb-4">Welcome to Harmony Tracker</h1>
          <p className="mb-6">Let's set up your personalized digital sanctuary.</p>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">What should we call you?</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="e.g. Rina"
              value={formData.userName}
              onChange={e => setFormData({...formData, userName: e.target.value})}
            />
          </div>
          <button 
            onClick={nextStep}
            className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-in slide-in-from-right duration-300">
          <h2 className="text-xl font-semibold mb-4">Set Your Habits</h2>
          <p className="text-sm mb-4 text-slate-600">Start with one essential habit (Mini/Plus/Elite).</p>
          {formData.habits?.map((habit, idx) => (
            <div key={idx} className="space-y-3 mb-4 p-3 bg-white rounded shadow-sm border border-slate-200">
              <input 
                type="text" 
                placeholder="Habit Name (e.g. Exercise)"
                className="w-full p-2 border-b outline-none focus:border-emerald-500"
                value={habit.name}
                onChange={e => {
                  const newHabits = [...(formData.habits || [])];
                  newHabits[idx].name = e.target.value;
                  setFormData({...formData, habits: newHabits});
                }}
              />
              <div className="grid grid-cols-3 gap-2 text-xs">
                <input placeholder="Mini" className="p-1 border rounded" value={habit.mini} onChange={e => {
                  const h = [...(formData.habits || [])]; h[idx].mini = e.target.value; setFormData({...formData, habits: h});
                }}/>
                <input placeholder="Plus" className="p-1 border rounded" value={habit.plus} onChange={e => {
                  const h = [...(formData.habits || [])]; h[idx].plus = e.target.value; setFormData({...formData, habits: h});
                }}/>
                <input placeholder="Elite" className="p-1 border rounded" value={habit.elite} onChange={e => {
                  const h = [...(formData.habits || [])]; h[idx].elite = e.target.value; setFormData({...formData, habits: h});
                }}/>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={prevStep} className="flex-1 border py-2 rounded">Back</button>
            <button onClick={nextStep} className="flex-1 bg-emerald-600 text-white py-2 rounded">Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-in slide-in-from-right duration-300">
          <h2 className="text-xl font-semibold mb-4">Financial Goal</h2>
          <p className="text-sm mb-6 text-slate-600">What is your monthly budget target?</p>
          <input 
            type="number" 
            className="w-full p-3 text-2xl font-bold text-center border-b-2 border-emerald-500 bg-transparent mb-8 outline-none"
            value={formData.monthlyBudgetTarget}
            onChange={e => setFormData({...formData, monthlyBudgetTarget: Number(e.target.value)})}
          />
          <div className="flex gap-2">
            <button onClick={prevStep} className="flex-1 border py-2 rounded">Back</button>
            <button onClick={handleSubmit} className="flex-1 bg-emerald-600 text-white py-2 rounded">Complete Setup</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupWizard;
