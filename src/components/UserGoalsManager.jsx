import React, { useState, useEffect } from 'react';
import { retrieve } from './Encryption';
import { useNavigate } from 'react-router-dom';

const UserGoalsManager = () => {
  const [users, setUsers] = useState([]);
  const [goals, setGoals] = useState([]);
  const [userGoals, setUserGoals] = useState({});
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchGoals();
    fetchUserGoals();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/users', {
        headers: {
          'Authorization': 'Bearer ' + retrieve().access_token,
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('Expected users to be an array:', data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await fetch('/fetching_goals', {
        headers: {
          'Authorization': 'Bearer ' + retrieve().access_token,
        },
      });
      const data = await response.json();
      if (data.goals && Array.isArray(data.goals)) {
        const formattedGoals = data.goals.map(goal => ({
          goal_id: goal.id,
          goal_name: goal.name
        }));
        setGoals(formattedGoals);
      } else {
        console.error('Expected data to have a goals property that is an array:', data);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const fetchUserGoals = async () => {
    try {
      const response = await fetch('/user_goals', {
        headers: {
          'Authorization': 'Bearer ' + retrieve().access_token,
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        const groupedData = data.reduce((acc, ug) => {
          if (!acc[ug.user_id]) {
            acc[ug.user_id] = {
              username: ug.username,
              first_name: ug.first_name,
              last_name: ug.last_name,
              goals: []
            };
          }
          if (!acc[ug.user_id].goals.some(g => g.goal_id === ug.goal_id)) {
            acc[ug.user_id].goals.push({
              goal_id: ug.goal_id,
              goal_name: ug.goal_name
            });
          }
          return acc;
        }, {});
        setUserGoals(groupedData);
      } else {
        console.error('Expected user-goals to be an array:', data);
      }
    } catch (error) {
      console.error('Error fetching user-goals:', error);
    }
  };

  const handleUserSelection = (userId) => {
    setSelectedUsers(prevSelectedUsers =>
      prevSelectedUsers.includes(userId)
        ? prevSelectedUsers.filter(id => id !== userId)
        : [...prevSelectedUsers, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedGoal) {
      setMessage('Please select a goal.');
      return;
    }

    const existingAssignments = selectedUsers.filter(userId =>
      userGoals[userId]?.goals.some(g => g.goal_id === Number(selectedGoal))
    );

    if (existingAssignments.length > 0) {
      setMessage('Some users already have this goal assigned.');
      return;
    }

    const requestData = {
      user_ids: selectedUsers,
      goal_id: selectedGoal
    };

    try {
      const response = await fetch('/assign_goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + retrieve().access_token,
        },
        body: JSON.stringify(requestData)
      });
      const data = await response.json();

      if (data.error) {
        setMessage(data.error);
      } else {
        let responseMessage = 'Goals successfully assigned!';
        if (data.already_assigned.length > 0) {
          const alreadyAssignedUsers = data.already_assigned.map(user => user.user_name);
          responseMessage += ` Already assigned goals: ${alreadyAssignedUsers.join(', ')}`;
        }
        if (data.not_found_users.length > 0) {
          responseMessage += ` Not found users: ${data.not_found_users.join(', ')}`;
        }
        setMessage(responseMessage);

        // Update user goals state
        let updatedUserGoals = { ...userGoals };
        selectedUsers.forEach(userId => {
          if (!updatedUserGoals[userId]) {
            updatedUserGoals[userId] = {
              username: users.find(u => u.id === userId)?.username || 'Unknown User',
              first_name: users.find(u => u.id === userId)?.first_name || 'Unknown',
              last_name: users.find(u => u.id === userId)?.last_name || 'Unknown',
              goals: []
            };
          }
          if (!updatedUserGoals[userId].goals.some(g => g.goal_id === Number(selectedGoal))) {
            updatedUserGoals[userId].goals.push({
              goal_id: Number(selectedGoal),
              goal_name: goals.find(g => g.goal_id === Number(selectedGoal))?.goal_name || 'Unknown Goal'
            });
          }
        });
        setUserGoals(updatedUserGoals);
        setSelectedUsers([]);
        setSelectedGoal('');
        setTimeout(() => {
          setMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error assigning goals to users:', error);
    }
  };

  return (
    <div>
      <button onClick={() => navigate('/manage_team')} style={{ marginBottom: '20px' }}>
        Back
      </button>
      <h2>User Goals Manager</h2>
      <div>
        <h3>Current User Goals:</h3>
        {Object.keys(userGoals).length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>User Name</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Goals</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(userGoals).map(userId => (
                <tr key={userId}>
                  <td>{userGoals[userId].username}</td>
                  <td>{userGoals[userId].first_name}</td>
                  <td>{userGoals[userId].last_name}</td>
                  <td>
                    {userGoals[userId].goals.length > 0 ? (
                      <ul>
                        {userGoals[userId].goals.map(goal => (
                          <li key={goal.goal_id}>{goal.goal_name}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No goals assigned</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No goals assigned yet.</p>
        )}
      </div>
      <div>
        <h3>Assign Goals to Users</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Select Goal:</label>
            <select value={selectedGoal} onChange={(e) => setSelectedGoal(e.target.value)}>
              <option value="">Select a goal</option>
              {goals.map(goal => (
                <option key={goal.goal_id} value={goal.goal_id}>{goal.goal_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Select Users:</label>
            {users.map(user => (
              <div key={user.id}>
                <input
                  type="checkbox"
                  id={`user-${user.id}`}
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleUserSelection(user.id)}
                />
                <label htmlFor={`user-${user.id}`}>
                  {user.username} ({user.first_name} {user.last_name})
                </label>
              </div>
            ))}
          </div>
          <button type="submit">Assign Goals</button>
          {message && <p>{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default UserGoalsManager;
