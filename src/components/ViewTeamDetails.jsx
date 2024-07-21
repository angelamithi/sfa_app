// ViewTeamDetails.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ViewTeamDetails = () => {
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

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <h2 style={{ marginLeft: "500px", marginBottom: "50px" }}>All Member Details</h2>
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
          </tr>
        </thead>
        <tbody>
          {userDetails.map(user => (
            <tr key={user.id} onClick={() => handleRowClick(user.id)} style={{ cursor: 'pointer' }}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.first_name}</td>
              <td>{user.last_name}</td>
              <td>{user.phone_number}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewTeamDetails;
