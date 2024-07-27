import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ManageTeam = () => {
  const [userDetails, setUserDetails] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/users')
      .then(response => response.json())
      .then(data => {
        const users = data.map(user => ({ ...user, type: 'User' }));
        setUserDetails(users);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  }, []);

  const handleRowClick = (id) => {
    navigate(`/user/${id}`);
  };

  const handleEditClick = (id) => {
    navigate(`/edit_user/${id}`);
  };

  const handleDeleteClick = (id) => {
    // Add logic to delete the user
    console.log(`Delete user with id: ${id}`);
  };

  const handleCreateUserClick = () => {
    navigate('/add_user');
  };

  const handleAssignCommunityClick = () => {
    navigate('/assign_community');
  };

  const handleAssignTaskClick = () => {
    navigate('/assign_task');
  };

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>All Member Details</h2>
        <div>
          <button onClick={handleCreateUserClick}>Create User</button>
          <button onClick={handleAssignCommunityClick}>Assign Community</button>
          <button onClick={handleAssignTaskClick}>Assign Task</button>
        </div>
      </div>
      <table className='ui striped table' style={{ width: "1200px", marginLeft: "60px", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Phone Number</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {userDetails.map(user => (
            <tr key={user.id} style={{ cursor: 'pointer' }}>
              <td onClick={() => handleRowClick(user.id)}>{user.id}</td>
              <td onClick={() => handleRowClick(user.id)}>{user.username}</td>
              <td onClick={() => handleRowClick(user.id)}>{user.email}</td>
              <td onClick={() => handleRowClick(user.id)}>{user.first_name}</td>
              <td onClick={() => handleRowClick(user.id)}>{user.last_name}</td>
              <td onClick={() => handleRowClick(user.id)}>{user.phone_number}</td>
              <td onClick={() => handleRowClick(user.id)}>{user.role}</td>
              <td>
                <button onClick={() => handleEditClick(user.id)}>Edit</button>
                <button onClick={() => handleDeleteClick(user.id)}>Deactivate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageTeam;
