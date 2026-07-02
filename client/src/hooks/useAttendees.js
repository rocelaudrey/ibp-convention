import { useCallback, useEffect, useState } from 'react';
import * as api from '../services/api.js';

// `enabled` (default true) gates the initial + auto refetch so callers can
// hold off until the user is signed in. Flipping enabled false → true
// triggers an immediate fetch.
export function useAttendees({ enabled = true } = {}) {
  const [attendees, setAttendees] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listAttendees();
      setAttendees(data);
      setError(null);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refresh();
  }, [refresh, enabled]);

  const create = useCallback(async (data) => {
    const created = await api.createAttendee(data);
    await refresh();
    return created;
  }, [refresh]);

  const update = useCallback(async (ref, patch) => {
    const updated = await api.updateAttendee(ref, patch);
    await refresh();
    return updated;
  }, [refresh]);

  const remove = useCallback(async (ref) => {
    await api.deleteAttendee(ref);
    await refresh();
  }, [refresh]);

  return { attendees, loading, error, refresh, create, update, remove };
}
