import React, { useState, useEffect } from 'react';
import { retrieve } from './Encryption';
import { useParams, useNavigate } from 'react-router-dom';

const EditCommunity = () => {
  const [community, setCommunity] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coordinatorId, setCoordinatorId] = useState('');
  const [coordinatorList, setCoordinatorList] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/communities/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('Failed to fetch community');
        }
        return resp.json();
      })
      .then((data) => {
        setCommunity(data);
        setName(data.name);
        setDescription(data.description);
        setCoordinatorId(data.coordinator_id);
      })
      .catch((error) => {
        console.error('Error fetching community:', error);
        setError('Failed to fetch community details. Please try again.');
      });
  }, [id]);

  useEffect(() => {
    fetch('/coordinators', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('Failed to fetch coordinators');
        }
        return resp.json();
      })
      .then((data) => {
        setCoordinatorList(data);
      })
      .catch((error) => {
        console.error('Error fetching coordinators:', error);
        setError('Failed to fetch coordinators. Please try again.');
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous error message

    const updatedCommunity = {
      name,
      description,
      coordinator_id: coordinatorId,
    };

    fetch(`/communities/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
      body: JSON.stringify(updatedCommunity),
    })
      .then((resp) => {
        if (!resp.ok) {
          return resp.json().then(err => {
            setError(err.error || 'Failed to update community. Please try again.');
            setMessage(''); // Clear previous success message
            throw new Error(err.error || 'Failed to update community. Please try again.');
          });
        }
        return resp.json();
      })
      .then((updatedData) => {
        console.log('Updated Community:', updatedData);
        setMessage('Community details have been updated successfully!');
        setTimeout(() => {
          navigate("/manage_community"); // Redirect to Manage Communities after a few seconds
        }, 3000); // Wait for 3 seconds before redirecting
      })
      .catch((error) => {
        console.error('Error updating community:', error);
        setError('Failed to update community. Please try again.');
      });
  };

  // Reset error message when the user starts typing again
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError(''); // Clear error when user starts fixing it
  };

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <h2 style={{ marginLeft: "570px", marginTop: "60px" }}>Edit Community</h2>
      <div className="ui equal width form" style={{ marginLeft: "450px", marginTop: "60px" }}>
        <form onSubmit={handleSubmit}>
          <div className="eight wide field">
            <label>
              Name:
              <input type="text" value={name} onChange={handleInputChange(setName)} required />
            </label>
          </div>
          <div className="eight wide field">
            <label>
              Description:
              <input type="text" value={description} onChange={handleInputChange(setDescription)} />
            </label>
          </div>
          <div className="eight wide field">
            <label>
              Coordinator:
              <select value={coordinatorId} onChange={handleInputChange(setCoordinatorId)} required>
                <option value="">Select Coordinator</option>
                {coordinatorList.map(coordinator => (
                  <option key={coordinator.id} value={coordinator.id}>
                    {coordinator.first_name} {coordinator.last_name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <br />
          <button type="submit" className='ui teal button' style={{ width: "200px", marginLeft: "110px", marginTop: "20px" }}>Update Community</button>
        </form>
        {message && <div className="ui positive message" style={{ marginTop: "20px" }}>{message}</div>}
        {error && <div className="ui negative message" style={{ marginTop: "20px" }}>{error}</div>}
      </div>
    </div>
  );
};

export default EditCommunity;


