/*
 * File Path: src/controllers/useRoleRouter.js
 * Description: Client-side URL routing custom hook supporting role paths (/admin, /member, /trainer), authentication modes, and view navigation.
 * Return Object: role, view, authMode, isAuth, navigate(role, view), goAuth(role, mode).
 */
import { useEffect, useMemo, useState } from 'react';

const roleViews = {
  admin: ['admin-dashboard', 'members', 'plans', 'trainers'],
  member: ['member-dashboard', 'plans'],
  trainer: ['trainer-dashboard', 'members']
};

const defaultView = {
  admin: 'admin-dashboard',
  member: 'member-dashboard',
  trainer: 'trainer-dashboard'
};

export function useRoleRouter() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const route = useMemo(() => {
    const [, maybeRole = 'admin', maybeView = 'login'] = path.split('/');
    const role = ['admin', 'member', 'trainer'].includes(maybeRole) ? maybeRole : 'admin';
    const authMode = maybeView === 'signup' ? 'signup' : 'login';
    const isAuth = ['login', 'signup', ''].includes(maybeView);
    const normalizedView = maybeView === 'dashboard' ? `${role}-dashboard` : maybeView;
    const view = isAuth ? defaultView[role] : roleViews[role].includes(normalizedView) ? normalizedView : defaultView[role];
    return { role, view, authMode, isAuth };
  }, [path]);

  const navigate = (role, view = defaultView[role]) => {
    const nextPath = `/${role}/${view.replace(`${role}-`, '')}`;
    window.history.pushState({}, '', nextPath);
    setPath(window.location.pathname);
  };

  const goAuth = (role, mode = 'login') => {
    window.history.pushState({}, '', `/${role}/${mode}`);
    setPath(window.location.pathname);
  };

  return { ...route, navigate, goAuth };
}
