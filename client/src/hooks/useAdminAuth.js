import { useCallback, useEffect, useState } from 'react';
import * as api from '../services/api.js';

export function useAdminAuth() {
  const [user, setUser] = useState(() => api.currentUser());
  const [isAuthed, setIsAuthed] = useState(() => api.isAdminAuthed());

  // Verify the session against the server on mount so a stale token gets cleared.
  useEffect(() => {
    if (!isAuthed || !api.isApiMode) return;
    let cancelled = false;
    (async () => {
      const fresh = await api.refreshCurrentUser();
      if (cancelled) return;
      if (fresh) setUser(fresh);
      else { setIsAuthed(false); setUser(null); }
    })();
    return () => { cancelled = true; };
  }, [isAuthed]);

  const login = useCallback(async (username, password) => {
    const res = await api.adminLogin(username, password);
    if (res.ok) {
      setIsAuthed(true);
      setUser(res.user || api.currentUser());
    }
    return res;
  }, []);

  const logout = useCallback(async () => {
    await api.adminLogout();
    setIsAuthed(false);
    setUser(null);
  }, []);

  return {
    isAuthed,
    user,
    role: user?.role || null,
    isSuperAdmin: user?.role === 'super_admin',
    login,
    logout,
  };
}
