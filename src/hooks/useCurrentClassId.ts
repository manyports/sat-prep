import { useState, useEffect } from 'react';

export function useCurrentClassId() {
  const [classId, setClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getClassId = async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/user/state');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.state && data.state.currentClassId) {
          return data.state.currentClassId;
        }
      }

      return localStorage.getItem('currentClassId');
    } catch (err) {
      console.error('Error fetching class ID:', err);
      return localStorage.getItem('currentClassId');
    }
  };

  const updateClassId = async (newClassId: string) => {
    setLoading(true);
    try {
      await fetch('/api/user/state', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentClassId: newClassId }),
      });

      localStorage.setItem('currentClassId', newClassId);
      
      setClassId(newClassId);
    } catch (err) {
      console.error('Error updating class ID:', err);
      setError(err instanceof Error ? err : new Error('Unknown error updating class ID'));
      
      localStorage.setItem('currentClassId', newClassId);
      setClassId(newClassId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchClassId = async () => {
      setLoading(true);
      try {
        const id = await getClassId();
        setClassId(id);
      } catch (err) {
        console.error('Error in useCurrentClassId hook:', err);
        setError(err instanceof Error ? err : new Error('Unknown error in useCurrentClassId hook'));
      } finally {
        setLoading(false);
      }
    };

    fetchClassId();
  }, []);

  return { classId, loading, error, updateClassId };
} 