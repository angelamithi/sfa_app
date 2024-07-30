import React, { useState, useEffect } from 'react';
import { retrieve } from './Encryption';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const UserCommunitiesManager = () => {
  const [userCommunities, setUserCommunities] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [communityId, setCommunityId] = useState('');
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    fetchUserCommunities();
    fetchUsers();
    fetchCommunities();
  }, []);

  const fetchUserCommunities = () => {
    fetch('/user_communities', {
      headers: {
        'Authorization': 'Bearer ' + retrieve().access_token,
      }
    })
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          const groupedData = data.reduce((acc, uc) => {
            if (!acc[uc.user_id]) {
              acc[uc.user_id] = {
                user_name: uc.user_name,
                communities: []
              };
            }

            // Check if the community is already in the list to avoid duplicates
            if (!acc[uc.user_id].communities.some(c => c.community_id === uc.community_id)) {
              acc[uc.user_id].communities.push({
                community_id: uc.community_id,
                community_name: uc.community_name
              });
            }

            return acc;
          }, {});
          setUserCommunities(groupedData);
        } else {
          console.error('Expected user-communities to be an array:', data);
        }
      })
      .catch(error => console.error('Error fetching user-communities:', error));
  };

  const fetchUsers = () => {
    fetch('/users', {
      headers: {
        'Authorization': 'Bearer ' + retrieve().access_token,
      }
    })
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error('Expected users to be an array:', data);
        }
      })
      .catch(error => console.error('Error fetching users:', error));
  };

  const fetchCommunities = () => {
    fetch('/communities', {
      headers: {
        'Authorization': 'Bearer ' + retrieve().access_token,
      }
    })
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCommunities(data);
        } else {
          console.error('Expected communities to be an array:', data);
        }
      })
      .catch(error => console.error('Error fetching communities:', error));
  };

  const handleDeleteClick = (userId, communityId) => {
    fetch(`/user_communities/${userId}/${communityId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete user-community relationship');
        }
        setUserCommunities(prevState => {
          const newState = { ...prevState };
          newState[userId].communities = newState[userId].communities.filter(c => c.community_id !== communityId);
          if (newState[userId].communities.length === 0) {
            delete newState[userId];
          }
          return newState;
        });
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

    // Check if any of the selected users already have the selected community
    const existingAssignments = selectedUsers.filter(userId => {
      const userCommunitiesForUser = userCommunities[userId]?.communities || [];
      return userCommunitiesForUser.some(c => c.community_id === Number(communityId));
    });

    if (existingAssignments.length > 0) {
      setMessage(`Some users are already assigned to this community.`);
      return;
    }

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
        let message = 'Users successfully assigned to community!';
        
        if (data.already_exists && data.already_exists.length > 0) {
          const alreadyAssignedUsers = data.already_exists.map(userId => {
            const user = users.find(u => u.id === userId);
            const community = communities.find(c => c.id === Number(communityId));
            return {
              userName: user ? user.username : 'Unknown User',
              communityName: community ? community.name : 'Unknown Community'
            };
          });

          const grouped = alreadyAssignedUsers.reduce((acc, { userName, communityName }) => {
            if (!acc[communityName]) acc[communityName] = [];
            acc[communityName].push(userName);
            return acc;
          }, {});

          const communityMessages = Object.keys(grouped).map(communityName => 
            `${grouped[communityName].join(', ')} are already assigned to ${communityName}`
          );

          message = `${message} ${communityMessages.join('; ')}.`;
        }

        setMessage(message);

        const community = communities.find(c => c.id === Number(communityId));
        if (!community) {
          console.error('Community not found:', communityId);
          return;
        }

        const newUserCommunities = selectedUsers.map(userId => ({
          user_id: userId,
          community_id: communityId,
          community_name: community.name,
          user_name: users.find(u => u.id === userId)?.username || 'Unknown User'
        }));

        setUserCommunities(prevState => {
          const updatedState = { ...prevState };
          newUserCommunities.forEach(uc => {
            if (!updatedState[uc.user_id]) {
              updatedState[uc.user_id] = {
                user_name: uc.user_name,
                communities: []
              };
            }
            // Ensure the community is not duplicated for the user
            if (!updatedState[uc.user_id].communities.some(c => c.community_id === uc.community_id)) {
              updatedState[uc.user_id].communities.push({
                community_id: uc.community_id,
                community_name: uc.community_name
              });
            }
          });
          return updatedState;
        });

        setSelectedUsers([]);
        setCommunityId('');
        setTimeout(() => {
          setMessage('');
        }, 3000);
      }
    })
    .catch(error => console.error('Error assigning users to community:', error));
  };

  return (
    <div>
      <button onClick={() => navigate('/manage_team')} style={{ marginBottom: '20px' }}>
        Back
      </button>
      <h2>User Communities Manager</h2>
      <div>
        <h3>User Communities</h3>
        <table>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Communities</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(userCommunities).map(userId => (
              <tr key={userId}>
                <td>{userCommunities[userId].user_name}</td>
                <td>
                  {userCommunities[userId].communities.map(c => (
                    <div key={c.community_id}>{c.community_name}</div>
                  ))}
                </td>
                <td>
                  {userCommunities[userId].communities.map(c => (
                    <button
                      key={c.community_id}
                      onClick={() => handleDeleteClick(userId, c.community_id)}
                    >
                      Remove
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3>Assign Users to Community</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Select Community</label>
            <select value={communityId} onChange={e => setCommunityId(e.target.value)} required>
              <option value="">Select Community</option>
              {communities.map(community => (
                <option key={community.id} value={community.id}>
                  {community.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Select Users</label>
            {users.map(user => (
              <div key={user.id}>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleUserSelection(user.id)}
                />
                {user.username}
              </div>
            ))}
          </div>
          <button type="submit">Assign</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default UserCommunitiesManager;
