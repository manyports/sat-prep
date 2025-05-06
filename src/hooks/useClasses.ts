import { useState, useEffect } from 'react';
import axios from 'axios';

interface Member {
  id: string;
  name: string;
  email: string;
}

interface Instructor {
  id: string;
  name: string;
  email: string;
}

export interface Class {
  id: string;
  name: string;
  description: string;
  instructor: {
    id: string;
    name: string;
  };
  members: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  invitationCode?: string;
  invitationCodeExpires?: string;
  createdAt: string;
  updatedAt: string;
}

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/classes');
      setClasses(response.data.classes);
    } catch (err) {
      setError('Failed to fetch classes');
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const createClass = async (name: string, description: string) => {
    try {
      setError(null);
      const response = await axios.post('/api/classes', { name, description });
      setClasses(prev => [...prev, response.data.class]);
      return response.data.class;
    } catch (err) {
      setError('Failed to create class');
      console.error('Error creating class:', err);
      throw err;
    }
  };

  const updateClass = async (classId: string, name: string, description: string) => {
    try {
      setError(null);
      const response = await axios.put(`/api/classes/${classId}`, { name, description });
      setClasses(prev => prev.map(cls => cls.id === classId ? response.data.class : cls));
      return response.data.class;
    } catch (err) {
      setError('Failed to update class');
      console.error('Error updating class:', err);
      throw err;
    }
  };

  const deleteClass = async (classId: string) => {
    try {
      setError(null);
      await axios.delete(`/api/classes/${classId}`);
      setClasses(prev => prev.filter(cls => cls.id !== classId));
    } catch (err) {
      setError('Failed to delete class');
      console.error('Error deleting class:', err);
      throw err;
    }
  };

  const addMember = async (classId: string, userId: string) => {
    try {
      setError(null);
      const response = await axios.post(`/api/classes/${classId}/members`, { userId });
      setClasses(prev => prev.map(cls => cls.id === classId ? response.data.class : cls));
      return response.data.class;
    } catch (err) {
      setError('Failed to add member');
      console.error('Error adding member:', err);
      throw err;
    }
  };

  const removeMember = async (classId: string, userId: string) => {
    try {
      setError(null);
      const response = await axios.delete(`/api/classes/${classId}/members`, { data: { userId } });
      setClasses(prev => prev.map(cls => cls.id === classId ? response.data.class : cls));
      return response.data.class;
    } catch (err) {
      setError('Failed to remove member');
      console.error('Error removing member:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return {
    classes,
    loading,
    error,
    fetchClasses,
    createClass,
    updateClass,
    deleteClass,
    addMember,
    removeMember
  };
} 