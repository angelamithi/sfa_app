import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { retrieve } from './Encryption';

const ManageGoals = () => {
  const [goalsDetails, setGoalsDetails] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/goals', {
      headers: {
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then(response => response.json())
      .then(data => {
        setGoalsDetails(data);
      })
      .catch(error => {
        console.error('Error fetching goals:', error);
      });
  }, []);

  const handleRowClick = (id) => {
    navigate(`/goal/${id}`);
  };

  const handleEditClick = (id) => {
    navigate(`/edit_goal/${id}`);
  };

  const handleCreateGoalClick = () => {
    navigate('/add_goal');
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      fetch(`/goals/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + retrieve().access_token,
        },
      })
        .then(response => {
          if (response.ok) {
            setGoalsDetails(prevDetails => prevDetails.filter(goal => goal.goal_id !== id));
          } else {
            console.error('Failed to delete goal');
          }
        })
        .catch(error => {
          console.error('Error deleting goal:', error);
        });
    }
  };

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>All Goals for Current Year</h2>
        <div>
          <button onClick={handleCreateGoalClick}>Create Goal</button>
        </div>
      </div>
      <table className='ui striped table' style={{ width: "1200px", marginLeft: "60px", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Session</th>
            <th>Community</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {goalsDetails.map(goal => (
            <tr key={goal.goal_id} style={{ cursor: 'pointer' }}>
              <td onClick={() => handleRowClick(goal.goal_id)}>{goal.goal_id}</td>
              <td onClick={() => handleRowClick(goal.goal_id)}>{goal.goal_name}</td>
              <td onClick={() => handleRowClick(goal.goal_id)}>{goal.goal_description}</td>
              <td onClick={() => handleRowClick(goal.goal_id)}>{goal.goal_status}</td>
              <td onClick={() => handleRowClick(goal.goal_id)}>{goal.session_name}</td>
              <td onClick={() => handleRowClick(goal.goal_id)}>{goal.community_name}</td>
              <td>
                <button onClick={() => handleEditClick(goal.goal_id)}>Edit</button>
                <button onClick={() => handleDeleteClick(goal.goal_id)} style={{ marginLeft: '10px', color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageGoals;
