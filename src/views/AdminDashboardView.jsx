/*
 * File Path: src/views/AdminDashboardView.jsx
 * Description: Executive Admin Dashboard displaying key health club metrics, membership renewals, trainer requests, and system report exports.
 * Props: dashboard (object returned by useClubDashboard hook).
 * Backend Integration: Consumes members, trainers, plans, and requests loaded via Spring Boot REST APIs (/api/admin/dashboard, /api/members, etc.).
 */
import SectionHeader from '../components/SectionHeader.jsx';
import { downloadTextFile } from '../services/downloadService.js';

export default function AdminDashboardView({ dashboard }) {
  const reportText = (type) => {
    const lines = [`Health Club Management System - ${type} Report`, `Generated: ${new Date().toLocaleString('en-IN')}`, ''];
    if (type === 'Members') {
      dashboard.members.forEach((m) => lines.push(`${m.id} | ${m.name} | ${m.email} | Plan: ${m.plan} | Trainer: ${m.trainer} | Status: ${m.status} | Renewal: ${m.renewal}`));
    }
    if (type === 'Trainers') {
      dashboard.trainers.forEach((t) => lines.push(`${t.id} | ${t.name} | ${t.email} | Specialty: ${t.specialty} | Exp: ${t.experience} | Certs: ${t.certifications}`));
    }
    if (type === 'Summary') {
      dashboard.stats.forEach((stat) => lines.push(`${stat.label}: ${stat.value}`));
      lines.push('', 'Trainer Requests Overview:');
      dashboard.requests.forEach((r) => lines.push(`${r.id} | ${r.memberName} -> ${r.trainerName} | Status: ${r.status} | Requested: ${r.requestedAt}`));
    }
    return lines.join('\n');
  };

  const downloadReport = (type) => downloadTextFile(`hcms-${type.toLowerCase()}-report.txt`, reportText(type));

  return (
    <>
      <SectionHeader
        eyebrow="Admin Panel"
        title="Club Executive Overview"
        action={(
          <div className="flex flex-wrap gap-2">
            <button className="btn-soft text-xs" onClick={() => downloadReport('Members')}>Export Members</button>
            <button className="btn-soft text-xs" onClick={() => downloadReport('Trainers')}>Export Trainers</button>
            <button className="btn-primary text-xs" onClick={() => downloadReport('Summary')}>Export System Report</button>
          </div>
        )}
      />

      {/* 3 Essential Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {dashboard.stats.map((stat) => (
          <div key={stat.label} className="panel border-t-4 border-t-teal-700">
            <p className="text-xs font-bold uppercase text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-black text-ink-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Upcoming Renewals */}
        <div className="panel">
          <h2 className="text-base font-bold text-ink-900 mb-3">Upcoming Membership Renewals</h2>
          <div className="space-y-2">
            {dashboard.members.slice(0, 5).map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-xs border border-slate-100">
                <div>
                  <span className="font-bold text-ink-900 block">{member.name}</span>
                  <span className="text-slate-500">{member.email}</span>
                </div>
                <span className="rounded bg-teal-50 px-2 py-1 font-bold text-teal-800">{member.plan}</span>
                <span className="font-bold text-slate-700">Due: {member.renewal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trainer Requests Audit */}
        <div className="panel">
          <h2 className="text-base font-bold text-ink-900 mb-3">Trainer Assignment Requests</h2>
          <div className="space-y-2">
            {dashboard.requests.map((request) => (
              <div key={request.id} className="rounded-lg bg-slate-50 p-3 text-xs border border-slate-100">
                <div className="flex items-center justify-between">
                  <p><b>{request.memberName}</b> &rarr; <b className="text-teal-700">{request.trainerName}</b></p>
                  <span className={`rounded px-2 py-0.5 font-bold ${
                    request.status === 'Accepted' ? 'bg-mint-100 text-mint-800' :
                    request.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {request.status}
                  </span>
                </div>
                <p className="mt-1 text-slate-500">{request.goal}</p>
                <p className="mt-1 text-[11px] text-slate-400">Requested: {request.requestedAt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
