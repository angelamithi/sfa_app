import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { retrieve } from "./Encryption";

const ViewSingleGoalDetails = () => {
  const { id } = useParams(); // Get the goal ID from the URL
  const [goalDetail, setGoalDetail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/goals/${id}`, {
      headers: {
        Authorization: "Bearer " + retrieve().access_token,
      }
    })
      .then(response => response.json())
      .then(data => {
        setGoalDetail(data);
      })
      .catch(error => console.error('Error fetching goal details:', error));
  }, [id]);

  const handleTaskClick = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  if (!goalDetail) return <div>Loading...</div>;

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <h2 style={{ marginLeft: "500px", marginBottom: "50px" }}>Goal Details</h2>
      <div>
        <h3>{goalDetail.name}</h3>
        <p>{goalDetail.description}</p>
        <p>Status: {goalDetail.status}</p>
        
        {/* Display session details */}
        {goalDetail.session && (
          <div>
            <h4>Session Details:</h4>
            <p>Session Name: {goalDetail.session.name}</p>
            <p>Start Date: {new Date(goalDetail.session.start_date).toLocaleDateString()}</p>
            <p>End Date: {new Date(goalDetail.session.end_date).toLocaleDateString()}</p>
          </div>
        )}

        {/* Display task details */}
        {goalDetail.tasks && goalDetail.tasks.length > 0 && (
          <div>
            <h4>Tasks:</h4>
            <table>
              <thead>
                <tr>
                  <th>Task Name</th>
                  <th>Description</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {goalDetail.tasks.map(task => (
                  <tr key={task.id} onClick={() => handleTaskClick(task.id)} style={{ cursor: 'pointer' }}>
                    <td>{task.name}</td>
                    <td>{task.description}</td>
                    <td>{new Date(task.start_date).toLocaleDateString()}</td>
                    <td>{new Date(task.end_date).toLocaleDateString()}</td>
                    <td>{task.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Remove the community details section */}
      </div>
    </div>
  );
};

export default ViewSingleGoalDetails;
