import { useCallback, useEffect, useRef, useState } from 'react';
import sessionApi from '../api/sessionApi.ts';
import type { BotActionLogResponse, SessionResponse } from '../api/types/session.ts';

const POLL_INTERVAL_MS = 2000;

/**
 * TODO(student): Load one session (sessionApi.findById) together with its
 * action logs (sessionApi.findLogs) for the SessionDetailsPage, including
 * loading/error state. Consider polling the logs while the session is RUNNING
 * so the trace updates live.
 */
const useSessionDetails = (id: string) => {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [logs, setLogs] = useState<BotActionLogResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [sessionResponse, logsResponse] = await Promise.all([
        sessionApi.findById(id),
        sessionApi.findLogs(id)
      ]);
      setSession(sessionResponse.data);
      setLogs(logsResponse.data);
    } catch (err) {
      console.error('Failed to load session details.', err);
    }
  }, [id]);

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    void loadInitial();
  }, [fetchData]);

  useEffect(() => {
    if (session?.status === 'RUNNING') {
      intervalRef.current = setInterval(() => {
        void fetchData();
      }, POLL_INTERVAL_MS);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [session?.status, fetchData]);

  return { session, logs, loading };
};

export default useSessionDetails;
