import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { retrieve } from './Encryption';

const ManageCommunity = () => {
  const [communityDetails, setCommunityDetails] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/communities', {
      headers: {
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then(response => response.json())
      .then(data => {
        setCommunityDetails(data);
      })
      .catch(error => {
        console.error('Error fetching communities:', error);
      });
  }, []);

  const handleRowClick = (id) => {
    navigate(`/community/${id}`);
  };

  const handleEditClick = (id) => {
    navigate(`/edit_community/${id}`);
  };

  const handleCreateCommunityClick = () => {
    navigate('/add_community');
  };

  const handleAssignGoalClick = () => {
    navigate('/assign_community_goal');
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this community?')) {
      fetch(`/communities/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + retrieve().access_token,
        },
      })
        .then(response => {
          if (response.ok) {
            setCommunityDetails(prevDetails => prevDetails.filter(community => community.id !== id));
          } else {
            console.error('Failed to delete community');
          }
        })
        .catch(error => {
          console.error('Error deleting community:', error);
        });
    }
  };

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>All Community Details</h2>
        <div>
          <button onClick={handleCreateCommunityClick}>Create Community</button>
          <button onClick={handleAssignGoalClick}>Assign Goal</button>
        </div>
      </div>
      <table className='ui striped table' style={{ width: "1200px", marginLeft: "60px", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Coordinator</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {communityDetails.map(community => (
            <tr key={community.id} style={{ cursor: 'pointer' }}>
              <td onClick={() => handleRowClick(community.id)}>{community.id}</td>
              <td onClick={() => handleRowClick(community.id)}>{community.name}</td>
              <td onClick={() => handleRowClick(community.id)}>{community.description}</td>
              <td onClick={() => handleRowClick(community.id)}>{community.coordinator_name}</td>
              <td>
                <button onClick={() => handleEditClick(community.id)}>Edit</button>
                <button onClick={() => handleDeleteClick(community.id)} style={{ marginLeft: '10px', color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageCommunity;
