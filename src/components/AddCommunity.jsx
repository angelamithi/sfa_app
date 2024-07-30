import React, { useState } from 'react';
import { retrieve } from './Encryption';
import { useNavigate } from 'react-router-dom';

const AddCommunity = ({ communities = [], setCommunities }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coordinatorId, setCoordinatorId] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const newCommunity = {
      name,
      description,
      coordinator_id: coordinatorId
    };

    fetch(`/communities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
      body: JSON.stringify(newCommunity),
    })
      .then((resp) => {
        if (!resp.ok) {
          return resp.json().then(err => {
            setError(err.error || 'Error adding community. Please try again.');
            setMessage(''); // Clear previous success message
            throw new Error(err.error || 'Error adding community. Please try again.');
          });
        }
        return resp.json();
      })
      .then((data) => {
        console.log('Added Community:', data);
        if (setCommunities) {
          setCommunities([...communities, data]);
        }
        setError(''); // Clear any previous error
        setMessage('Community has been successfully created');
        setTimeout(() => {
          setShowForm(false);
          navigate('/manage_communities');
        }, 3000); // Display message for 3 seconds before navigating
      })
      .catch((error) => {
        console.error('Error adding community:', error);
      });
  };

  // Reset error message when the user starts typing again
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError(''); // Clear error when user starts fixing it
  };

  if (!showForm) {
    return null;
  }

  return (
    <div className='content-wrapper' style={{ marginLeft: "60px", backgroundColor: "white", marginTop: "20px" }}>
      <h2 style={{ marginTop: "120px" }}>Add Community</h2>
      <div className="ui equal width form" style={{ marginTop: "60px" }}>
        <form onSubmit={handleSubmit}>
          <div className="six wide field">
            <label>
              Community Name:
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
              Coordinator ID:
              <input
                type="text"
                value={coordinatorId}
                onChange={handleInputChange(setCoordinatorId)}
                required
              />
            </label>
          </div>
          <br />
          <button
            type="submit"
            className='ui teal button'
            style={{ width: "200px", marginLeft: "110px", marginTop: "20px" }}
          >
            Add Community
          </button>
        </form>
        {message && <div className="ui positive message" style={{ marginTop: "20px" }}>{message}</div>}
        {error && <div className="ui negative message" style={{ marginTop: "20px" }}>{error}</div>}
      </div>
    </div>
  );
};

export default AddCommunity;
