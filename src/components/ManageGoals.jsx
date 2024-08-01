import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { retrieve } from './Encryption';

const ManageGoals = () => {
  const [goalsDetails, setGoalsDetails] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/years', {
      headers: {
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then(response => response.json())
      .then(data => {
        console.log('Fetched years:', data); // Log the data to inspect it
        if (Array.isArray(data)) {
          setYears(data);
          const currentYear = new Date().getFullYear();
          const currentYearData = data.find(year => parseInt(year.year_name) === currentYear);
          if (currentYearData) {
            setSelectedYear(currentYearData.id);
          } else if (data.length > 0) {
            setSelectedYear(data[0].id);
          }
        } else {
          console.error('Error: data is not an array', data);
        }
      })
      .catch(error => {
        console.error('Error fetching years:', error);
      });
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetch(`/goals?year_id=${selectedYear}`, {
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
    }
  }, [selectedYear]);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

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
        <div>
          <label htmlFor="year-select">Select Year: </label>
          <select id="year-select" value={selectedYear} onChange={handleYearChange}>
            {years.map(year => (
              <option key={year.id} value={year.id}>
                {year.year_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button onClick={handleCreateGoalClick}>Create Goal</button>
        </div>
      </div>
      <h2>All Goals for Selected Year</h2>
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
              <td onClick={() => handleRowClick(goal.goal_id)}>{goal.goal_status || 'No Status'}</td>
              <td onClick={() => handleRowClick(goal.goal_id)}>{goal.session_name}</td>
              <td onClick={() => handleRowClick(goal.goal_id)}>{goal.community_name || 'No Community'}</td>
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
