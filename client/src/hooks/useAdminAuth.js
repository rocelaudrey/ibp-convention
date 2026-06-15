import { useCallback, useState } from 'react';
import * as api from '../services/api.js';

export function useAdminAuth() {
  const [isAuthed, setIsAuthed] = useState(() => api.isAdminAuthed());

  const login = useCallback(async (password) => {
    const res = await api.adminLogin(password);
    if (res.ok) setIsAuthed(true);
    return res;
  }, []);

  const logout = useCallback(async () => {
    await api.adminLogout();
    setIsAuthed(false);
  }, []);

  return { isAuthed, login, logout };
}
