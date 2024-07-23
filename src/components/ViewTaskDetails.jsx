import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { retrieve } from "./Encryption";

const ViewSingleTaskDetails = () => {
  const { taskId } = useParams(); // Get the task ID from the URL
  const [taskDetail, setTaskDetail] = useState(null);

  useEffect(() => {
    fetch(`/tasks/${taskId}`, {
      headers: {
        Authorization: "Bearer " + retrieve().access_token,
      }
    })
      .then(response => response.json())
      .then(data => {
        setTaskDetail(data);
      })
      .catch(error => console.error('Error fetching task details:', error));
  }, [taskId]);

  if (!taskDetail) return <div>Loading...</div>;

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <h2 style={{ marginLeft: "500px", marginBottom: "50px" }}>Task Details</h2>
      <div>
        <h3>{taskDetail.name}</h3>
        <p>{taskDetail.description}</p>
        <p>Start Date: {new Date(taskDetail.start_date).toLocaleDateString()}</p>
        <p>End Date: {new Date(taskDetail.end_date).toLocaleDateString()}</p>
        <p>Status: {taskDetail.task_status}</p>

        {taskDetail.allocated_users && (
          <div>
            <h4>Allocated Users</h4>
            <ul>
              {taskDetail.allocated_users.map(user => (
                <li key={user.user_id}>
                  <strong>{user.first_name} {user.last_name}</strong> (Username: {user.username}, Email: {user.email})
                  <br />
                  Status: {user.status} (Assigned at: {new Date(user.assigned_at).toLocaleDateString()})
                </li>
              ))}
            </ul>
          </div>
        )}

        {taskDetail.community && (
          <div>
            <h4>Community</h4>
            <p><strong>Name:</strong> {taskDetail.community.name}</p>
            <p><strong>Description:</strong> {taskDetail.community.description}</p>
          </div>
        )}

        {taskDetail.session && (
          <div>
            <h4>Session</h4>
            <p><strong>Name:</strong> {taskDetail.session.name}</p>
            <p><strong>Start Date:</strong> {new Date(taskDetail.session.start_date).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> {new Date(taskDetail.end_date).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewSingleTaskDetails;
