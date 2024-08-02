import React, { useState, useEffect } from 'react';
import { retrieve } from './Encryption'; // Adjust import as necessary
import { useParams, useNavigate } from 'react-router-dom';

const EditSession = () => {
  const [session, setSession] = useState(null);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [yearId, setYearId] = useState('');
  const [yearList, setYearList] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch session details
    fetch(`/sessions/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('Failed to fetch session');
        }
        return resp.json();
      })
      .then((data) => {
        setSession(data);
        setName(data.name);
        setStartDate(data.start_date);
        setEndDate(data.end_date);
        setYearId(data.year_id);
      })
      .catch((error) => {
        console.error('Error fetching session:', error);
        setError('Failed to fetch session details. Please try again.');
      });
  }, [id]);

  useEffect(() => {
    // Fetch year list
    fetch('/years', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('Failed to fetch years');
        }
        return resp.json();
      })
      .then((data) => {
        setYearList(data);
      })
      .catch((error) => {
        console.error('Error fetching years:', error);
        setError('Failed to fetch years. Please try again.');
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous error message

    const updatedSession = {
      name,
      start_date: startDate,
      end_date: endDate,
    
    };

    fetch(`/sessions/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
      body: JSON.stringify(updatedSession),
    })
      .then((resp) => {
        if (!resp.ok) {
          return resp.json().then(err => {
            setError(err.error || 'Failed to update session. Please try again.');
            setMessage(''); // Clear previous success message
            throw new Error(err.error || 'Failed to update session. Please try again.');
          });
        }
        return resp.json();
      })
      .then((updatedData) => {
        console.log('Updated Session:', updatedData);
        setMessage('Session details have been updated successfully!');
        setTimeout(() => {
          navigate("/manage_sessions"); // Redirect to Manage Sessions after a few seconds
        }, 3000); // Wait for 3 seconds before redirecting
      })
      .catch((error) => {
        console.error('Error updating session:', error);
        setError('Failed to update session. Please try again.');
      });
  };

  // Reset error message when the user starts typing again
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError(''); // Clear error when user starts fixing it
  };

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <h2>Edit Session</h2>
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" value={name} onChange={handleInputChange(setName)} required />
        </div>
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input type="date" id="startDate" value={startDate} onChange={handleInputChange(setStartDate)} required />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input type="date" id="endDate" value={endDate} onChange={handleInputChange(setEndDate)} required />
        </div>
        
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditSession;
