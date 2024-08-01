import React, { useState, useEffect } from 'react';
import { retrieve } from './Encryption';
import { useParams, useNavigate } from 'react-router-dom';

const EditGoal = () => {
  const [goal, setGoal] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [sessionList, setSessionList] = useState([]);
  const [communityList, setCommunityList] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/goals/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('Failed to fetch goal');
        }
        return resp.json();
      })
      .then((data) => {
        setGoal(data);
        setName(data.name);
        setDescription(data.description);
        setSessionId(data.session_id);
        setCommunityId(data.community_id);
      })
      .catch((error) => {
        console.error('Error fetching goal:', error);
        setError('Failed to fetch goal details. Please try again.');
      });
  }, [id]);

  useEffect(() => {
    fetch('/sessions_names', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('Failed to fetch sessions');
        }
        return resp.json();
      })
      .then((data) => {
        setSessionList(data);
      })
      .catch((error) => {
        console.error('Error fetching sessions:', error);
        setError('Failed to fetch sessions. Please try again.');
      });
  }, []);

  useEffect(() => {
    fetch('/communities', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('Failed to fetch communities');
        }
        return resp.json();
      })
      .then((data) => {
        setCommunityList(data);
      })
      .catch((error) => {
        console.error('Error fetching communities:', error);
        setError('Failed to fetch communities. Please try again.');
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous error message

    const updatedGoal = {
      name,
      description,
      session_id: sessionId,
      community_id: communityId,
    };

    fetch(`/goals/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
      body: JSON.stringify(updatedGoal),
    })
      .then((resp) => {
        if (!resp.ok) {
          return resp.json().then(err => {
            setError(err.error || 'Failed to update goal. Please try again.');
            setMessage(''); // Clear previous success message
            throw new Error(err.error || 'Failed to update goal. Please try again.');
          });
        }
        return resp.json();
      })
      .then((updatedData) => {
        console.log('Updated Goal:', updatedData);
        setMessage('Goal details have been updated successfully!');
        setTimeout(() => {
          navigate("/manage_goals"); // Redirect to Manage Goals after a few seconds
        }, 3000); // Wait for 3 seconds before redirecting
      })
      .catch((error) => {
        console.error('Error updating goal:', error);
        setError('Failed to update goal. Please try again.');
      });
  };

  // Reset error message when the user starts typing again
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError(''); // Clear error when user starts fixing it
  };

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <h2>Edit Goal</h2>
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" value={name} onChange={handleInputChange(setName)} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" value={description} onChange={handleInputChange(setDescription)} required></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="sessionId">Session</label>
          <select id="sessionId" value={sessionId} onChange={handleInputChange(setSessionId)} required>
            <option value="">Select Session</option>
            {sessionList.map(session => (
              <option key={session.id} value={session.id}>{session.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="communityId">Community</label>
          <select id="communityId" value={communityId} onChange={handleInputChange(setCommunityId)} required>
            <option value="">Select Community</option>
            {communityList.map(community => (
              <option key={community.id} value={community.id}>{community.name}</option>
            ))}
          </select>
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditGoal;
