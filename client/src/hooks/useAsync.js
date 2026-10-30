import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../services/api.js';

// Runs an async loader on mount (and whenever deps change) and tracks
// { data, loading, error }. Responses from outdated requests are ignored,
// so fast typing in a search box never shows stale results.
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null, status: null });
  const latestRequest = useRef(0);

  const run = useCallback(loader, deps);

  const reload = useCallback(
    async ({ silent = false } = {}) => {
      const requestId = ++latestRequest.current;
      if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await run();
        if (requestId === latestRequest.current) setState({ data, loading: false, error: null, status: null });
      } catch (err) {
        if (requestId === latestRequest.current) {
          setState((s) => ({ ...s, loading: false, error: getErrorMessage(err), status: err?.response?.status }));
        }
      }
    },
    [run]
  );

  useEffect(() => {
    reload();
  }, [reload]);

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }));
  }, []);

  return { ...state, reload, setData };
}
