import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { retrieve } from './Encryption';

const UserCommunitiesManager = () => {
  const [userCommunities, setUserCommunities] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [communityId, setCommunityId] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user-communities
    fetch('/user_communities')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched user-communities:', data);
        if (Array.isArray(data)) {
          setUserCommunities(data);
        } else {
          console.error('Expected user-communities to be an array:', data);
        }
      })
      .catch(error => console.error('Error fetching user-communities:', error));

    // Fetch users
    fetch('/users', {
      headers: {
        'Authorization': 'Bearer ' + retrieve().access_token,
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('Fetched users:', data);
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error('Expected users to be an array:', data);
        }
      })
      .catch(error => console.error('Error fetching users:', error));

    // Fetch communities
    fetch('/communities', {
      headers: {
        'Authorization': 'Bearer ' + retrieve().access_token,
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('Fetched communities:', data);
        if (Array.isArray(data)) {
          setCommunities(data);
        } else {
          console.error('Expected communities to be an array:', data);
        }
      })
      .catch(error => console.error('Error fetching communities:', error));
  }, []);

  const handleDeleteClick = (userId, communityId) => {
    fetch(`/user_communities/${userId}/${communityId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete user-community relationship');
        }
        setUserCommunities(prevState => prevState.filter(uc => uc.user_id !== userId || uc.community_id !== communityId));
      })
      .catch(error => console.error('Error deleting user-community relationship:', error));
  };

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
          setUserCommunities(prevState => [
            ...prevState,
            ...selectedUsers.map(userId => ({ user_id: userId, community_id: communityId }))
          ]);
          setTimeout(() => {
            setMessage('');
            setSelectedUsers([]);
            setCommunityId('');
          }, 3000);
        }
      })
      .catch(error => console.error('Error assigning users to community:', error));
  };

  return (
    <div>
      <h2>User Communities Manager</h2>
      <div>
        <h3>User Communities</h3>
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Community ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(userCommunities) && userCommunities.length > 0 ? (
              userCommunities.map(uc => (
                <tr key={`${uc.user_id}-${uc.community_id}`}>
                  <td>{uc.user_id}</td>
                  <td>{uc.community_id}</td>
                  <td>
                    <button onClick={() => navigate(`/edit_user_community/${uc.user_id}/${uc.community_id}`)}>Edit</button>
                    <button onClick={() => handleDeleteClick(uc.user_id, uc.community_id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No user communities available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div>
        <h3>Assign Users to Community</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <h4>Select Users:</h4>
            {Array.isArray(users) && users.length > 0 ? (
              users.map(user => (
                <div key={user.id}>
                  <input
                    type="checkbox"
                    id={`user-${user.id}`}
                    value={user.id}
                    onChange={() => handleUserSelection(user.id)}
                    checked={selectedUsers.includes(user.id)}
                  />
                  <label htmlFor={`user-${user.id}`}>{user.username}</label>
                </div>
              ))
            ) : (
              <p>No users available</p>
            )}
          </div>
          <div>
            <label>
              Select Community:
              <select value={communityId} onChange={e => setCommunityId(e.target.value)} required>
                <option value="" disabled>Select a community</option>
                {Array.isArray(communities) && communities.length > 0 ? (
                  communities.map(community => (
                    <option key={community.id} value={community.id}>{community.name}</option>
                  ))
                ) : (
                  <option value="" disabled>No communities available</option>
                )}
              </select>
            </label>
          </div>
          <button type="submit">Assign</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default UserCommunitiesManager;
