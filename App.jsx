/*
 * File Path: src/App.jsx
 * Component: Root Application Component (App)
 * Easy Explanation: The main entry point of the React application. Controls user session login/logout state, role routing, and renders either the Login/Signup screen or the main Dashboard.
 */
import { useState } from 'react';
import AuthView from './views/AuthView.jsx';
import AppShell from './views/AppShell.jsx';
import { useClubDashboard } from './controllers/useClubDashboard.js';
import { useRoleRouter } from './controllers/useRoleRouter.js';

export default function App() {
  // State: Remembers logged-in user session from browser localStorage
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('hcms_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Custom Router hook managing URL routes and view screens
  const router = useRoleRouter();

  // Custom Dashboard Hook connecting to live Spring Boot APIs
  const dashboard = useClubDashboard(router.role, session?.email);

  /**
   * Method: handleLogin
   * Easy Explanation: Authenticates user credentials via Axios login call, saves session to localStorage, and navigates to the role dashboard.
   */
  const handleLogin = async (payload) => {
    const result = await dashboard.login(payload);
    if (result && result.ok) {
      const sess = { role: payload.role, email: payload.email };
      setSession(sess);
      localStorage.setItem('hcms_session', JSON.stringify(sess));
      router.navigate(payload.role);
      return { ok: true };
    }
    return { ok: false, message: result?.message || 'Invalid login details.' };
  };

  /**
   * Method: handleSignup
   * Easy Explanation: Registers a new user account via Axios register call.
   */
  const handleSignup = async (payload) => {
    return await dashboard.signup(payload);
  };

  /**
   * Method: handleLogout
   * Easy Explanation: Clears JWT token and user session from localStorage and redirects back to the login screen.
   */
  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('hcms_session');
    localStorage.removeItem('hcms_token');
    localStorage.removeItem('hcms_user');
    router.goAuth(router.role, 'login');
  };

  // Render Auth screen if not logged in or switching role
  if (router.isAuth || !session || session.role !== router.role) {
    return (
      <AuthView
        role={router.role}
        mode={router.authMode}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onEmailCheck={dashboard.emailExists}
        onPasswordReset={dashboard.resetPassword}
        onSwitchMode={(mode) => router.goAuth(router.role, mode)}
        onSwitchRole={(role) => router.goAuth(role, router.authMode)}
      />
    );
  }

  // Render Main Application Shell with Sidebar and Dashboard Views
  return (
    <AppShell
      role={router.role}
      view={router.view}
      dashboard={dashboard}
      onNavigate={(view) => router.navigate(router.role, view)}
      onLogout={handleLogout}
    />
  );
}
