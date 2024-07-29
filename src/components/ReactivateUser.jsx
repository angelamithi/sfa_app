import React, { useState, useEffect } from 'react';
import { retrieve } from './Encryption';
import { useParams, useNavigate } from 'react-router-dom';

const  ReactivateUser = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/users/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('Failed to fetch user');
        }
        return resp.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch((error) => {
        console.error('Error fetching user:', error);
        setError('Failed to fetch user details. Please try again.');
      });
  }, [id]);

  const handleReactivate = () => {
    setError(''); // Clear previous error message

    fetch(`/users_reactivate/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then((resp) => {
        if (!resp.ok) {
          return resp.json().then(err => {
            setError(err.error || 'Failed to reactivate user. Please try again.');
            setMessage(''); // Clear previous success message
            throw new Error(err.error || 'Failed to reactivate user. Please try again.');
          });
        }
        return resp.json();
      })
      .then((reactivatedUser) => {
        console.log('Reactivated User:', reactivatedUser);
        setMessage('User has been reactivated successfully!');
        setTimeout(() => {
          navigate("/manage_team"); // Redirect to ManageTeam after a few seconds
        }, 3000); // Wait for 3 seconds before redirecting
      })
      .catch((error) => {
        console.error('Error reactivating user:', error);
        setError('Failed to reactivate user. Please try again.');
      });
  };

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <h2 style={{ marginLeft: "570px", marginTop: "60px" }}>Deactivate User</h2>
      <div className="ui equal width form" style={{ marginLeft: "450px", marginTop: "60px" }}>
        {user && (
          <div>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>First Name:</strong> {user.first_name}</p>
            <p><strong>Last Name:</strong> {user.last_name}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        )}
        <br />
        <button onClick={handleReactivate} className='ui red button' style={{ width: "200px", marginLeft: "110px", marginTop: "20px" }}>Reactivate User</button>
        {message && <div className="ui positive message" style={{ marginTop: "20px" }}>{message}</div>}
        {error && <div className="ui negative message" style={{ marginTop: "20px" }}>{error}</div>}
      </div>
    </div>
  );
};

export default ReactivateUser;
