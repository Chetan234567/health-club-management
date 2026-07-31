/*
 * File Path: src/views/MemberDashboardView.jsx
 * Description: Member Portal view displaying active membership plan status, profile details, day-by-day workout routine, diet schedule, and trainer requests.
 * Props: dashboard (object returned by useClubDashboard hook).
 * Backend Integration: Saves member profile via PUT /api/members/{id}, requests trainer via POST /api/trainer-requests, and displays workout/diet plans.
 */
import { Dumbbell, Flame, Utensils, Droplet } from 'lucide-react';
import { useEffect, useState } from 'react';
import SectionHeader from '../components/SectionHeader.jsx';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MemberDashboardView({ dashboard }) {
  const [profile, setProfile] = useState(dashboard.memberProfile);
  const [trainerName, setTrainerName] = useState(dashboard.trainers[0]?.name || '');
  const [activeDay, setActiveDay] = useState('Mon');

  useEffect(() => {
    setProfile(dashboard.memberProfile);
  }, [dashboard.memberProfile]);

  const workoutPlan = dashboard.memberProfile?.workoutPlan || {};
  const currentWorkout = workoutPlan[activeDay] || { title: 'Rest & Recovery', exercises: ['Light stretching & hydration'] };

  const dietPlan = dashboard.memberProfile?.dietPlan || {};

  return (
    <>
      <SectionHeader eyebrow="Member Portal" title={`Welcome back, ${dashboard.memberProfile.name}`} />

      {/* Active Membership Plan Summary */}
      <div className="panel mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-teal-700">Active Membership Plan</p>
          <h2 className="text-2xl font-black text-ink-900">{dashboard.memberProfile.plan}</h2>
          <p className="text-xs text-slate-500">{dashboard.remainingPlanDays} days remaining · Valid till {dashboard.memberProfile.nextRenewal}</p>
        </div>
        <div className="rounded-lg bg-teal-50 border border-teal-200 px-4 py-3 text-xs font-bold text-teal-800">
          Personal Trainer: <span className="text-sm font-black block text-teal-900">{dashboard.memberProfile.trainer}</span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        <div className="space-y-6">
          {/* Personal Details Panel */}
          <div className="panel">
            <h2 className="text-lg font-bold text-ink-900">Personal Details</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600">Full Name</label>
                <input className="field" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Email Address</label>
                <input className="field" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Phone Number</label>
                <input className="field" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </div>
              <button className="btn-primary w-full" onClick={() => dashboard.updateMemberProfile(profile)}>Save Profile</button>
            </div>
          </div>

          {/* Trainer Assignment Request Panel */}
          <div className="panel">
            <h2 className="text-lg font-bold text-ink-900">Choose / Request Trainer</h2>
            <p className="mt-1 text-xs text-slate-500">View coach credentials and request a dedicated trainer for your plan.</p>
            <div className="mt-4 flex gap-2">
              <select className="field" value={trainerName} onChange={(e) => setTrainerName(e.target.value)}>
                {dashboard.trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.name}>
                    {trainer.name} ({trainer.experience})
                  </option>
                ))}
              </select>
              <button className="btn-primary" onClick={() => dashboard.requestTrainer(trainerName, `Goal: ${dashboard.memberProfile.plan} guidance`)}>Request</button>
            </div>

            {/* Selected Trainer Credentials Preview */}
            {(() => {
              const selectedCoach = dashboard.trainers.find((t) => t.name === trainerName) || dashboard.trainers[0];
              if (!selectedCoach) return null;
              return (
                <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs space-y-1 border border-slate-200">
                  <p className="font-bold text-teal-800">{selectedCoach.name} · ⭐ {selectedCoach.rating}</p>
                  <p className="text-slate-700"><b>Specialization:</b> {selectedCoach.specialty}</p>
                  <p className="text-slate-700"><b>Experience:</b> {selectedCoach.experience}</p>
                  <p className="text-slate-700"><b>Certifications:</b> {selectedCoach.certifications}</p>
                </div>
              );
            })()}

            {dashboard.requests.filter((r) => r.memberName === dashboard.memberProfile.name && r.status === 'Pending').length > 0 && (
              <p className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-bold text-amber-800">
                ⏳ Request pending with {dashboard.requests.filter((r) => r.memberName === dashboard.memberProfile.name && r.status === 'Pending')[0]?.trainerName}
              </p>
            )}
            {dashboard.requests.filter((r) => r.memberName === dashboard.memberProfile.name && r.status === 'Accepted').length > 0 && (
              <p className="mt-3 rounded-lg bg-mint-100 border border-mint-200 px-3 py-2 text-xs font-bold text-mint-800">
                ✓ Request accepted by {dashboard.requests.filter((r) => r.memberName === dashboard.memberProfile.name && r.status === 'Accepted')[0]?.trainerName}
              </p>
            )}
          </div>
        </div>

        {/* Workout Plan & Diet Schedule Panels */}
        <div className="space-y-6">
          {/* Day-by-Day Workout Plan Display */}
          <div className="panel">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-bold text-ink-900">
                <Dumbbell size={20} className="text-teal-700" />
                <span>My Weekly Workout Routine</span>
              </div>
              <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800">
                {dashboard.memberProfile.plan} Plan
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Day-by-day workout program assigned by {dashboard.memberProfile.trainer}.</p>

            {/* Mon-Sun Day Tabs */}
            <div className="mt-4 flex flex-wrap gap-1 border-b border-slate-200 pb-3">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDay(day)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    activeDay === day ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Active Day Workout Schedule */}
            <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-base font-bold text-ink-900">{activeDay}: {currentWorkout.title}</h3>
                <span className="text-xs font-semibold text-teal-700">{currentWorkout.exercises?.length || 0} Exercises</span>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {(currentWorkout.exercises || []).map((exercise, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-teal-700 text-[10px] font-bold text-white shrink-0">
                      {index + 1}
                    </span>
                    <span>{exercise}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Daily Diet & Nutrition Plan Display */}
          <div className="panel">
            <div className="flex items-center gap-2 text-lg font-bold text-ink-900">
              <Utensils size={20} className="text-teal-700" />
              <span>My Daily Diet & Nutrition Plan</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Customized meal targets tailored to your fitness plan.</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                <p className="text-xs font-bold text-teal-700 uppercase">Breakfast</p>
                <p className="mt-1 text-xs font-semibold text-slate-700">{dietPlan.breakfast || 'Oatmeal & Protein'}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                <p className="text-xs font-bold text-teal-700 uppercase">Lunch</p>
                <p className="mt-1 text-xs font-semibold text-slate-700">{dietPlan.lunch || 'Grilled Protein & Brown Rice'}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                <p className="text-xs font-bold text-teal-700 uppercase">Evening Snack</p>
                <p className="mt-1 text-xs font-semibold text-slate-700">{dietPlan.snack || 'Greek Yogurt / Green Tea'}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                <p className="text-xs font-bold text-teal-700 uppercase">Dinner</p>
                <p className="mt-1 text-xs font-semibold text-slate-700">{dietPlan.dinner || 'Lean Salad & Quinoa'}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 rounded-lg bg-teal-50 p-3 border border-teal-100 text-xs font-bold text-teal-900">
              <div className="flex items-center gap-1.5">
                <Flame size={16} className="text-amber-600" /> Target Calories: <span>{dietPlan.calories || '2,200 kcal'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Droplet size={16} className="text-blue-600" /> Daily Water Goal: <span>{dietPlan.water || '3.5 Liters'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
