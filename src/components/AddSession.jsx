import React, { useState, useEffect } from 'react';
import { retrieve } from './Encryption';
import { useParams, useNavigate } from 'react-router-dom';

const AddSession = () => {
  const [sessionForm, setSessionForm] = useState({
    name: '',
    start_date: '',
    end_date: '',
  });
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    if (id) {
      fetchSession(id);
    }
  }, [id]);

  const fetchSession = async (id) => {
    try {
      const response = await fetch(`/sessions/${id}`, {
        headers: {
          'Authorization': 'Bearer ' + retrieve().access_token,
        },
      });
      const data = await response.json();
      setSessionForm(data);
      setEditingSessionId(id);
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingSessionId ? 'PATCH' : 'POST';
    const url = editingSessionId ? `/sessions/${editingSessionId}` : '/sessions';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + retrieve().access_token,
        },
        body: JSON.stringify(sessionForm),
      });
      if (response.ok) {
        navigate('/manage_sessions'); // Navigate to ManageSessions
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error submitting session');
        console.error('Error submitting session:', errorData);
      }
    } catch (error) {
      console.error('Error submitting session:', error);
    }
  };

  return (
    <div>
      <h2>{editingSessionId ? 'Edit Session' : 'Add Session'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={sessionForm.name}
          onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
          required
        />
        <input
          type="date"
          placeholder="Start Date"
          value={sessionForm.start_date}
          onChange={(e) => setSessionForm({ ...sessionForm, start_date: e.target.value })}
          required
        />
        <input
          type="date"
          placeholder="End Date"
          value={sessionForm.end_date}
          onChange={(e) => setSessionForm({ ...sessionForm, end_date: e.target.value })}
          required
        />
        <button type="submit">{editingSessionId ? 'Update' : 'Create'} Session</button>
      </form>
    </div>
  );
};

export default AddSession;
