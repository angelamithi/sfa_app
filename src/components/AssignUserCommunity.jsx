import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { retrieve } from './Encryption';

const AssignUserCommunity = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [communityId, setCommunityId] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch users
    fetch('/users', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      }
    })
      .then(response => response.json())
      .then(data => setUsers(data))
      .catch(error => console.error('Error fetching users:', error));

    // Fetch communities
    fetch('/communities', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      }
    })
      .then(response => response.json())
      .then(data => setCommunities(data))
      .catch(error => console.error('Error fetching communities:', error));
  }, []);

  const handleUserSelection = (userId) => {
    setSelectedUsers(prevSelectedUsers => {
      if (prevSelectedUsers.includes(userId)) {
        return prevSelectedUsers.filter(id => id !== userId);
      } else {
        return [...prevSelectedUsers, userId];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('/user_communities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
      body: JSON.stringify({ user_ids: selectedUsers, community_id: communityId }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setMessage('Users successfully assigned to community!');
          setTimeout(() => {
            navigate('/user_communities');
          }, 3000);
        }
      })
      .catch(error => {
        console.error('Error assigning users to community:', error);
      });
  };

  return (
    <div>
      <h2>Assign Users to Community</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <h3>Select Users:</h3>
          {users.map(user => (
            <div key={user.id}>
              <input
                type="checkbox"
                id={`user-${user.id}`}
                value={user.id}
                onChange={() => handleUserSelection(user.id)}
              />
              <label htmlFor={`user-${user.id}`}>{user.username}</label>
            </div>
          ))}
        </div>
        <div>
          <label>
            Select Community:
            <select value={communityId} onChange={e => setCommunityId(e.target.value)} required>
              <option value="" disabled>Select a community</option>
              {communities.map(community => (
                <option key={community.id} value={community.id}>{community.name}</option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit">Assign</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AssignUserCommunity;
