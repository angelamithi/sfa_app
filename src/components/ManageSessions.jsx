import React, { useState, useEffect } from 'react';
import { retrieve } from './Encryption';
import { useNavigate } from 'react-router-dom';

const ManageSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [currentYear, setCurrentYear] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/sessions', {
        headers: {
          'Authorization': 'Bearer ' + retrieve().access_token,
        },
      });
      const data = await response.json();
      console.log('Fetched sessions:', data); // Log fetched data
      setSessions(Array.isArray(data) ? data : []); // Ensure sessions is set to an array
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      console.log('Deleting session with id:', id); // Debugging statement
      try {
        const response = await fetch(`/sessions/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + retrieve().access_token,
          },
        });
        if (response.ok) {
          fetchSessions();
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to delete session.');
          console.error('Error deleting session:', errorData);
        }
      } catch (error) {
        console.error('Error deleting session:', error);
        setError('Failed to delete session. Please try again.');
      }
    }
  };

  const handleGenerateYear = async () => {
    try {
      const response = await fetch('/years', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + retrieve().access_token,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentYear(data.year_name);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error generating year');
        console.error('Error generating year:', errorData);
      }
    } catch (error) {
      console.error('Error generating year:', error);
      setError('Failed to generate year. Please try again.');
    }
  };

  const handleAddSession = () => {
    navigate('/add_session'); // Navigate to AddSession component
  };

  const handleEdit = (sessionId) => {
    console.log('Editing session with id:', sessionId); // Debugging statement
    navigate(`/edit_session/${sessionId}`); // Navigate to EditSession component with session ID
  };

  return (
    <div>
      <button onClick={handleGenerateYear}>Generate Current Year</button>
      <h2>Manage Sessions</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {sessions.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.session_id}>
                <td>{session.session_name}</td>
                <td>{session.start_date}</td>
                <td>{session.end_date}</td>
                <td>
                  <button onClick={() => handleEdit(session.session_id)}>Edit</button>
                  <button onClick={() => handleDelete(session.session_id)} style={{ marginLeft: '10px', color: 'red' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No sessions available.</p>
      )}

      <button onClick={handleAddSession}>Add Session</button>
     
      {currentYear && <p>Current Year: {currentYear}</p>}
    </div>
  );
};

export default ManageSessions;
