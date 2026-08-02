/*
 * File Path: src/components/Sidebar.jsx
 * Description: Left sidebar navigation component rendering role-based navigation links and logout trigger.
 * Props: role ('admin' | 'member' | 'trainer'), items (array), activeView (string), onNavigate (func), onLogout (func).
 */
import { Dumbbell, LogOut } from 'lucide-react';

export default function Sidebar({ role, items, activeView, onNavigate, onLogout }) {
  return (
    <aside className="flex min-h-screen w-full flex-col border-r border-slate-200 bg-white px-4 py-5 lg:w-72">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-700 text-white">
          <Dumbbell size={22} />
        </div>
        <div>
          <p className="text-sm font-bold uppercase text-teal-700">HCMS</p>
          <p className="text-lg font-bold capitalize text-ink-900">{role} Portal</p>
        </div>
      </div>
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.id === activeView;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                active ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-ink-900'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <button type="button" onClick={onLogout} className="btn-soft mt-auto">
        <LogOut size={17} /> Logout
      </button>
    </aside>
  );
}
