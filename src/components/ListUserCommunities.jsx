import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ListUserCommunities = () => {
  const [userCommunities, setUserCommunities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/user_communities')
      .then(response => response.json())
      .then(data => {
        setUserCommunities(data);
      })
      .catch(error => {
        console.error('Error fetching user-communities:', error);
      });
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
      .catch(error => {
        console.error('Error deleting user-community relationship:', error);
      });
  };

  return (
    <div>
      <h2>User Communities</h2>
      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Community ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {userCommunities.map(uc => (
            <tr key={`${uc.user_id}-${uc.community_id}`}>
              <td>{uc.user_id}</td>
              <td>{uc.community_id}</td>
              <td>
                <button onClick={() => navigate(`/edit_user_community/${uc.user_id}/${uc.community_id}`)}>Edit</button>
                <button onClick={() => handleDeleteClick(uc.user_id, uc.community_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListUserCommunities;
