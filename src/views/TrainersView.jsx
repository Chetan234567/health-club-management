/*
 * File Path: src/views/TrainersView.jsx
 * Description: Trainers Directory view displaying personal trainer credentials, ratings, experience, and admin CRUD form.
 * Props: role ('admin' | 'member' | 'trainer'), dashboard (object returned by useClubDashboard hook).
 * Backend Integration: Executes CRUD operations via /api/trainers (GET, POST, PUT, DELETE).
 */
import { Award, Briefcase, Dumbbell, Star } from 'lucide-react';
import { useState } from 'react';
import SectionHeader from '../components/SectionHeader.jsx';

const emptyTrainer = { name: '', email: '', phone: '', specialty: '', experience: '', certifications: '' };

export default function TrainersView({ role, dashboard }) {
  const [form, setForm] = useState(emptyTrainer);
  const [editingId, setEditingId] = useState(null);

  const save = (event) => {
    event.preventDefault();
    if (editingId) dashboard.updateTrainer(editingId, form);
    else dashboard.addTrainer(form);
    setForm(emptyTrainer);
    setEditingId(null);
  };

  return (
    <>
      <SectionHeader eyebrow={role === 'admin' ? 'Admin Panel' : 'Trainer Directory'} title="Personal Trainer Roster & Credentials" />
      {role === 'admin' && (
        <form onSubmit={save} className="panel mb-5 grid gap-3 md:grid-cols-3">
          <input className="field" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="field" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <input className="field" placeholder="Specialization (e.g. HIIT & Fat Loss)" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} required />
          <input className="field" placeholder="Experience (e.g. 6+ Years Exp)" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} required />
          <input className="field" placeholder="Certifications (e.g. ACE Certified)" value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} required />
          <button className="btn-primary md:col-span-3">{editingId ? 'Update Trainer Profile' : 'Add New Trainer'}</button>
        </form>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboard.trainers.map((trainer) => (
          <div key={trainer.id} className="panel flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ink-900">{trainer.name}</h2>
                  <p className="text-xs font-bold text-teal-700">{trainer.specialty}</p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                  <Star size={12} className="fill-amber-500 text-amber-500" /> {trainer.rating}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Briefcase size={14} className="text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-700">{trainer.experience || '5+ Years Experience'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Award size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <span>{trainer.certifications || 'Certified Personal Trainer'}</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-slate-500">
                  <Dumbbell size={14} className="text-slate-400" />
                  <span>Assigned Clients: <b className="text-ink-900">{trainer.sessions}</b></span>
                </div>
              </div>
            </div>

            {role === 'admin' && (
              <div className="mt-5 flex gap-2 border-t border-slate-100 pt-3">
                <button className="btn-soft text-xs" onClick={() => { setEditingId(trainer.id); setForm(trainer); }}>Edit Profile</button>
                <button className="btn-danger text-xs" onClick={() => dashboard.deleteTrainer(trainer.id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
