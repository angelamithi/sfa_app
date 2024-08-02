import React, { useState, useEffect } from 'react';
import { retrieve } from './Encryption'; // Adjust the import based on your file structure
import { useNavigate } from 'react-router-dom';

const AddGoal = ({ goals = [], setGoals }) => {

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch sessions data from the backend
    fetch('/sessions_names', { headers: { 'Authorization': 'Bearer ' + retrieve().access_token } })
      .then(response => response.json())
      .then((sessionsData) => {
        setSessions(sessionsData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError('Error fetching data.');
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newGoal = {
      name,
      description,
      session_id: sessionId
    };

    fetch('/goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
      body: JSON.stringify(newGoal),
    })
      .then((resp) => {
        if (!resp.ok) {
          return resp.json().then(err => {
            setError(err.error || 'Error adding goal. Please try again.');
            setMessage(''); // Clear previous success message
            throw new Error(err.error || 'Error adding goal. Please try again.');
          });
        }
        return resp.json();
      })
      .then((data) => {
        console.log('Added Goal:', data);
        if (setGoals) {
          setGoals([...goals, data]);
        }
        setError(''); // Clear any previous error
        setMessage('Goal has been successfully created');
        setTimeout(() => {
          setShowForm(false);
          navigate('/manage_goals');
        }, 3000); // Display message for 3 seconds before navigating
      })
      .catch((error) => {
        console.error('Error adding goal:', error);
      });
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError(''); // Clear error when user starts fixing it
  };

  if (!showForm) {
    return null;
  }

  return (
    <div className='content-wrapper' style={{ marginLeft: "60px", backgroundColor: "white", marginTop: "20px" }}>
      <h2 style={{ marginTop: "120px" }}>Add Goal</h2>
      <div className="ui equal width form" style={{ marginTop: "60px" }}>
        <form onSubmit={handleSubmit}>
          <div className="six wide field">
            <label>
              Goal Name:
              <input
                type="text"
                value={name}
                onChange={handleInputChange(setName)}
                required
              />
            </label>
          </div>
          <br />
          <div className="six wide field">
            <label>
              Description:
              <input
                type="text"
                value={description}
                onChange={handleInputChange(setDescription)}
                required
              />
            </label>
          </div>
          <br />
          <div className="six wide field">
            <label>
              Session:
              <select
                value={sessionId}
                onChange={handleInputChange(setSessionId)}
                required
              >
                <option value="">Select Session</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <br />
          <button
            type="submit"
            className='ui teal button'
            style={{ width: "200px", marginLeft: "110px", marginTop: "20px" }}
          >
            Add Goal
          </button>
        </form>
        {message && <div className="ui positive message" style={{ marginTop: "20px" }}>{message}</div>}
        {error && <div className="ui negative message" style={{ marginTop: "20px" }}>{error}</div>}
      </div>
    </div>
  );
};

export default AddGoal;