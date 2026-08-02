/*
 * File Path: src/views/AppShell.jsx
 * Description: Layout Shell component embedding Sidebar navigation, active view renderer, and GenAI Chatbot widget.
 * Props: role ('admin' | 'member' | 'trainer'), view (string), dashboard (useClubDashboard instance), onNavigate, onLogout.
 * Navigation: Controls view routing between Dashboards, Members, Trainers, and Plans components.
 */
import Sidebar from '../components/Sidebar.jsx';
import GenAiChatbot from '../components/GenAiChatbot.jsx';
import AdminDashboardView from './AdminDashboardView.jsx';
import MemberDashboardView from './MemberDashboardView.jsx';
import MembersView from './MembersView.jsx';
import PlansView from './PlansView.jsx';
import TrainerDashboardView from './TrainerDashboardView.jsx';
import TrainersView from './TrainersView.jsx';

export default function AppShell({ role, view, dashboard, onNavigate, onLogout }) {
  const renderView = () => {
    if (view === 'admin-dashboard') return <AdminDashboardView dashboard={dashboard} />;
    if (view === 'member-dashboard') return <MemberDashboardView dashboard={dashboard} />;
    if (view === 'trainer-dashboard') return <TrainerDashboardView dashboard={dashboard} />;
    if (view.endsWith('members')) return <MembersView role={role} dashboard={dashboard} />;
    if (view.endsWith('trainers')) return <TrainersView role={role} dashboard={dashboard} />;
    if (view.endsWith('plans')) return <PlansView role={role} dashboard={dashboard} />;
    return <AdminDashboardView dashboard={dashboard} />;
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[288px_1fr]">
      <Sidebar role={role} items={dashboard.navigationItems} activeView={view} onNavigate={onNavigate} onLogout={onLogout} />
      <main className="min-h-screen bg-paper-100 p-5 lg:p-8">
        {renderView()}
      </main>
      <GenAiChatbot role={role} />
    </div>
  );
}
