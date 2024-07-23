import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { retrieve } from './Encryption';

const ViewGoalsDetails = () => {
  const [goalsDetails, setGoalsDetails] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/goals', {
      headers: {
        Authorization: 'Bearer ' + retrieve().access_token,
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
    navigate(`/goals/${id}`);
  };

  return (
    <div className='content-wrapper' style={{ marginLeft: '280px', backgroundColor: 'white', marginTop: '20px' }}>
      <h2 style={{ marginLeft: '500px', marginBottom: '50px' }}>Goals Details</h2>
      <table className='ui striped table' style={{ width: '1200px', marginLeft: '60px', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Session</th>
            <th>Community</th>
          </tr>
        </thead>
        <tbody>
          {goalsDetails.map(goal => (
            <tr key={goal.goal_id} onClick={() => handleRowClick(goal.goal_id)} style={{ cursor: 'pointer' }}>
              <td>{goal.goal_id}</td>
              <td>{goal.goal_name}</td>
              <td>{goal.goal_description}</td>
              <td>{goal.goal_status}</td>
              <td>{goal.session_name}</td>
              <td>{goal.community_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewGoalsDetails;
