import React, { useState, useEffect } from 'react';
import { retrieve } from './Encryption';
import { useNavigate } from 'react-router-dom';

const CommunityGoalsManager = () => {
  const [communities, setCommunities] = useState([]);
  const [goals, setGoals] = useState([]);
  const [communityGoals, setCommunityGoals] = useState({});
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchCommunities();
    fetchGoals();
    fetchCommunityGoals();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await fetch('/communities', {
        headers: {
          'Authorization': 'Bearer ' + retrieve().access_token,
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setCommunities(data);
      } else {
        console.error('Expected communities to be an array:', data);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
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

  const fetchCommunityGoals = async () => {
    try {
      const response = await fetch('/community_goals', {
        headers: {
          'Authorization': 'Bearer ' + retrieve().access_token,
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        const groupedData = data.reduce((acc, cg) => {
          if (!acc[cg.community_id]) {
            acc[cg.community_id] = {
              community_name: cg.community_name,
              goals: []
            };
          }
          if (!acc[cg.community_id].goals.some(g => g.goal_id === cg.goal_id)) {
            acc[cg.community_id].goals.push({
              goal_id: cg.goal_id,
              goal_name: cg.goal_name
            });
          }
          return acc;
        }, {});
        setCommunityGoals(groupedData);
      } else {
        console.error('Expected community-goals to be an array:', data);
      }
    } catch (error) {
      console.error('Error fetching community-goals:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedGoal || !selectedCommunity) {
      setMessage('Please select a goal and a community.');
      return;
    }

    const requestData = {
      community_id: selectedCommunity,
      goal_id: selectedGoal
    };

    try {
      const response = await fetch('/assign_goal_to_community', {
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
        setMessage('Goal successfully assigned to community!');
        setSelectedCommunity('');
        setSelectedGoal('');
        setTimeout(() => {
          setMessage('');
        }, 3000);
        fetchCommunityGoals();
      }
    } catch (error) {
      console.error('Error assigning goal to community:', error);
    }
  };

  return (
    <div>
      <button onClick={() => navigate('/manage_community')} style={{ marginBottom: '20px' }}>
        Back
      </button>
      <h2>Community Goals Manager</h2>
      <div>
        <h3>Current Community Goals:</h3>
        {Object.keys(communityGoals).length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Community Name</th>
                <th>Goals</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(communityGoals).map(communityId => (
                <tr key={communityId}>
                  <td>{communityGoals[communityId].community_name}</td>
                  <td>
                    {communityGoals[communityId].goals.length > 0 ? (
                      <ul>
                        {communityGoals[communityId].goals.map(goal => (
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
        <h3>Assign Goal to Community</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Select Community:</label>
            <select value={selectedCommunity} onChange={(e) => setSelectedCommunity(e.target.value)}>
              <option value="">Select a community</option>
              {communities.map(community => (
                <option key={community.id} value={community.id}>{community.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Select Goal:</label>
            <select value={selectedGoal} onChange={(e) => setSelectedGoal(e.target.value)}>
              <option value="">Select a goal</option>
              {goals.map(goal => (
                <option key={goal.goal_id} value={goal.goal_id}>{goal.goal_name}</option>
              ))}
            </select>
          </div>
          <button type="submit">Assign Goal</button>
          {message && <p>{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default CommunityGoalsManager;
