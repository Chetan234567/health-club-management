/*
 * File Path: src/views/MembersView.jsx
 * Description: Members management view allowing admins to create, edit, update, and delete members, and trainers to view assigned clients.
 * Props: role ('admin' | 'trainer'), dashboard (object returned by useClubDashboard hook).
 * Backend Integration: Executes CRUD operations via /api/members (GET, POST, PUT, DELETE).
 */
import { useState } from 'react';
import SectionHeader from '../components/SectionHeader.jsx';

const emptyMember = { name: '', email: '', phone: '', plan: 'Monthly Gym', trainer: 'Not Assigned', renewal: '2026-08-31', status: 'Active' };

export default function MembersView({ role, dashboard }) {
  const [form, setForm] = useState(emptyMember);
  const [editingId, setEditingId] = useState(null);
  const list = role === 'trainer' ? dashboard.members.filter((member) => member.trainer === dashboard.trainerProfile.name) : dashboard.members;

  const save = (event) => {
    event.preventDefault();
    if (editingId) dashboard.updateMember(editingId, form);
    else dashboard.addMember(form);
    setForm(emptyMember);
    setEditingId(null);
  };

  return (
    <>
      <SectionHeader eyebrow={role === 'admin' ? 'Admin Panel' : 'Trainer Workspace'} title={role === 'admin' ? 'View & Manage Members' : 'Assigned Clients'} />
      {role === 'admin' && (
        <form onSubmit={save} className="panel mb-5 grid gap-3 md:grid-cols-3">
          <input className="field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="field" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <input className="field" placeholder="Plan" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} />
          <input className="field" placeholder="Trainer" value={form.trainer} onChange={(e) => setForm({ ...form, trainer: e.target.value })} />
          <button className="btn-primary">{editingId ? 'Update Member' : 'Add Member'}</button>
        </form>
      )}
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="text-slate-500">
            <tr><th className="py-3">Name</th><th>Email</th><th>Plan</th><th>Trainer</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {list.map((member) => (
              <tr key={member.id} className="border-t border-slate-100">
                <td className="py-3 font-bold">{member.name}</td>
                <td>{member.email}</td>
                <td><span className="rounded bg-teal-50 px-2 py-1 text-xs font-bold text-teal-800">{member.plan}</span></td>
                <td>{member.trainer}</td>
                <td>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${member.status === 'Active' ? 'bg-mint-100 text-mint-800' : 'bg-amber-100 text-amber-800'}`}>
                    {member.status}
                  </span>
                </td>
                <td className="flex gap-2 py-2">
                  {role === 'admin' && (
                    <>
                      <button className="btn-soft" onClick={() => { setEditingId(member.id); setForm(member); }}>Edit</button>
                      <button className="btn-danger" onClick={() => dashboard.deleteMember(member.id)}>Delete</button>
                    </>
                  )}
                  {role === 'trainer' && (
                    <span className="text-xs text-slate-500 flex items-center">Active Client</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
