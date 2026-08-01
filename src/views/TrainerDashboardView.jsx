/*
 * File Path: src/views/TrainerDashboardView.jsx
 * Description: Trainer Workspace view for managing coach profile, accepting/rejecting member requests, and updating member workout routines & diet plans.
 * Props: dashboard (object returned by useClubDashboard hook).
 * Backend Integration: Calls PUT /api/trainer-requests/{id}/status, PUT /api/members/{id}/workout-plan, and PUT /api/members/{id}/diet-plan.
 */
import { Award, Briefcase, CheckCircle2, Dumbbell, Save, Utensils } from 'lucide-react';
import { useEffect, useState } from 'react';
import SectionHeader from '../components/SectionHeader.jsx';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function TrainerDashboardView({ dashboard }) {
  const trainer = dashboard.trainerProfile;
  const requests = dashboard.requests.filter((request) => request.trainerName === trainer.name);
  const assignedClients = dashboard.members.filter((m) => m.trainer === trainer.name);
  const availableClients = assignedClients.length > 0 ? assignedClients : dashboard.members;

  const [selectedClientEmail, setSelectedClientEmail] = useState(availableClients[0]?.email || '');
  const [activeDay, setActiveDay] = useState('Mon');
  const [statusMsg, setStatusMsg] = useState('');

  const currentClient = dashboard.members.find((m) => m.email === selectedClientEmail) || availableClients[0];
  const clientWorkoutPlan = currentClient?.workoutPlan || {};
  const currentDayWorkout = clientWorkoutPlan[activeDay] || { title: '', exercises: [] };

  const [workoutTitle, setWorkoutTitle] = useState(currentDayWorkout.title || '');
  const [exercisesText, setExercisesText] = useState((currentDayWorkout.exercises || []).join('\n'));

  const [dietForm, setDietForm] = useState(currentClient?.dietPlan || {
    breakfast: '',
    lunch: '',
    snack: '',
    dinner: '',
    calories: '',
    water: ''
  });

  useEffect(() => {
    if (currentClient) {
      const dayData = (currentClient.workoutPlan || {})[activeDay] || { title: '', exercises: [] };
      setWorkoutTitle(dayData.title || '');
      setExercisesText((dayData.exercises || []).join('\n'));
      setDietForm(currentClient.dietPlan || { breakfast: '', lunch: '', snack: '', dinner: '', calories: '', water: '' });
    }
  }, [selectedClientEmail, activeDay, currentClient]);

  const saveWorkout = (e) => {
    e.preventDefault();
    if (!currentClient) return;
    const exercisesList = exercisesText.split('\n').map((l) => l.trim()).filter(Boolean);
    dashboard.updateMemberWorkoutPlan(currentClient.name, activeDay, {
      title: workoutTitle || 'Daily Workout Routine',
      exercises: exercisesList
    });
    setStatusMsg(`Workout updated for ${activeDay} (${currentClient.name})`);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const saveDiet = (e) => {
    e.preventDefault();
    if (!currentClient) return;
    dashboard.updateMemberDietPlan(currentClient.name, dietForm);
    setStatusMsg(`Diet plan updated for ${currentClient.name}`);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  return (
    <>
      <SectionHeader eyebrow="Trainer Workspace" title={`Coach Workspace - ${trainer.name}`} />

      {/* 1. Trainer Profile Overview */}
      <div className="panel mb-6 border-l-4 border-l-teal-700">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <h2 className="text-xl font-bold text-ink-900">{trainer.name}</h2>
            <p className="text-xs font-bold text-teal-700">{trainer.specialty}</p>
            <p className="mt-1 text-xs text-slate-500">{trainer.email} · {trainer.phone}</p>
          </div>
          <div className="text-xs space-y-1 text-slate-600">
            <p className="flex items-center gap-1.5 font-semibold">
              <Briefcase size={14} className="text-teal-700" /> {trainer.experience || '5+ Years Exp'}
            </p>
            <p className="flex items-start gap-1.5">
              <Award size={14} className="text-teal-700 mt-0.5" /> {trainer.certifications || 'Certified Trainer'}
            </p>
          </div>
          <div className="flex items-center justify-start md:justify-end gap-4 text-xs font-bold">
            <div className="rounded-lg bg-slate-50 p-2.5 text-center border border-slate-200 min-w-24">
              <span className="block text-slate-500 uppercase">Assigned</span>
              <span className="text-lg font-black text-ink-900">{assignedClients.length}</span>
            </div>
            <div className="rounded-lg bg-amber-50 p-2.5 text-center border border-amber-200 min-w-24">
              <span className="block text-amber-800 uppercase">Rating</span>
              <span className="text-lg font-black text-amber-900">⭐ {trainer.rating}</span>
            </div>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-mint-100 p-3 text-sm font-bold text-mint-800">
          <CheckCircle2 size={18} /> {statusMsg}
        </div>
      )}

      {/* 2. Client Trainer Requests Table */}
      <div className="panel mb-6">
        <h2 className="text-base font-bold text-ink-900 mb-3">Incoming Client Requests</h2>
        {requests.length === 0 ? (
          <p className="text-xs text-slate-500">No pending trainer requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="pb-2">Member</th>
                  <th className="pb-2">Goal / Request Note</th>
                  <th className="pb-2">Requested At</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td className="py-2.5 font-bold">{req.memberName}</td>
                    <td>{req.goal}</td>
                    <td className="text-slate-500">{req.requestedAt}</td>
                    <td>
                      <span className={`rounded px-2 py-0.5 font-bold ${
                        req.status === 'Accepted' ? 'bg-mint-100 text-mint-800' :
                        req.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      {req.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button className="btn-primary py-1 px-2 text-xs" onClick={() => dashboard.updateTrainerRequest(req.id, 'Accepted')}>Accept</button>
                          <button className="btn-soft py-1 px-2 text-xs" onClick={() => dashboard.updateTrainerRequest(req.id, 'Rejected')}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Workout & Diet Plan Management for Clients */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Workout Plan Builder */}
        <div className="panel">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-base font-bold text-ink-900">
              <Dumbbell size={18} className="text-teal-700" />
              <span>Client Workout Plan</span>
            </div>
            <select className="field text-xs py-1 px-2 max-w-48" value={selectedClientEmail} onChange={(e) => setSelectedClientEmail(e.target.value)}>
              {dashboard.members.map((c) => (
                <option key={c.id} value={c.email}>{c.name} ({c.plan})</option>
              ))}
            </select>
          </div>

          {/* Mon - Sun Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-2 mb-4 border-b border-slate-200">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setActiveDay(day)}
                className={`rounded px-3 py-1 text-xs font-bold transition ${
                  activeDay === day ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <form onSubmit={saveWorkout} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-600">{activeDay} Workout Title</label>
              <input className="field mt-1" placeholder="e.g. Chest & Triceps Routine" value={workoutTitle} onChange={(e) => setWorkoutTitle(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">Exercises (One per line)</label>
              <textarea className="field mt-1 font-mono text-xs min-h-28" placeholder="Bench Press 4x10&#10;Incline Flyes 3x12" value={exercisesText} onChange={(e) => setExercisesText(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary w-full py-2">
              <Save size={15} /> Save {activeDay} Workout Plan
            </button>
          </form>
        </div>

        {/* Diet Plan Builder */}
        <div className="panel">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-base font-bold text-ink-900">
              <Utensils size={18} className="text-teal-700" />
              <span>Client Nutrition & Diet Schedule</span>
            </div>
            <span className="text-xs font-bold text-teal-700">{currentClient?.name}</span>
          </div>

          <form onSubmit={saveDiet} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-600">Breakfast</label>
                <input className="field mt-1" value={dietForm.breakfast || ''} onChange={(e) => setDietForm({ ...dietForm, breakfast: e.target.value })} placeholder="Oatmeal, Eggs & Berries" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Lunch</label>
                <input className="field mt-1" value={dietForm.lunch || ''} onChange={(e) => setDietForm({ ...dietForm, lunch: e.target.value })} placeholder="Grilled Protein & Rice" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Evening Snack</label>
                <input className="field mt-1" value={dietForm.snack || ''} onChange={(e) => setDietForm({ ...dietForm, snack: e.target.value })} placeholder="Greek Yogurt & Green Tea" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Dinner</label>
                <input className="field mt-1" value={dietForm.dinner || ''} onChange={(e) => setDietForm({ ...dietForm, dinner: e.target.value })} placeholder="Salad & Quinoa" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Target Calories</label>
                <input className="field mt-1" value={dietForm.calories || ''} onChange={(e) => setDietForm({ ...dietForm, calories: e.target.value })} placeholder="2,200 kcal" />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full py-2 mt-2">
              <Save size={15} /> Save Diet Plan
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
