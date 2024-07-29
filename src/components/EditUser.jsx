import React, { useState, useEffect } from 'react';
import { retrieve } from './Encryption';
import { useParams, useNavigate } from 'react-router-dom';

const EditUser = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('');
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
        setUsername(data.username);
        setEmail(data.email);
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setPhoneNumber(data.phone_number);
        setRole(data.role);
      })
      .catch((error) => {
        console.error('Error fetching user:', error);
        setError('Failed to fetch user details. Please try again.');
      });
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous error message

    const updatedUser = {
      username,
      email,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      role,
    };

    fetch(`/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
      body: JSON.stringify(updatedUser),
    })
      .then((resp) => {
        if (!resp.ok) {
          return resp.json().then(err => {
            setError(err.error || 'Failed to update user. Please try again.');
            setMessage(''); // Clear previous success message
            throw new Error(err.error || 'Failed to update user. Please try again.');
          });
        }
        return resp.json();
      })
      .then((updatedData) => {
        console.log('Updated User:', updatedData);
        setMessage('User details have been updated successfully!');
        setTimeout(() => {
          navigate("/manage_team"); // Redirect to ManageTeam after a few seconds
        }, 3000); // Wait for 3 seconds before redirecting
      })
      .catch((error) => {
        console.error('Error updating user:', error);
        setError('Failed to update user. Please try again.');
      });
  };

  // Reset error message when the user starts typing again
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError(''); // Clear error when user starts fixing it
  };

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <h2 style={{ marginLeft: "570px", marginTop: "60px" }}>Edit User</h2>
      <div className="ui equal width form" style={{ marginLeft: "450px", marginTop: "60px" }}>
        <form onSubmit={handleSubmit}>
          <div className="eight wide field">
            <label>
              Username:
              <input type="text" value={username} onChange={handleInputChange(setUsername)} required />
            </label>
          </div>
          <div className="eight wide field">
            <label>
              Email:
              <input type="email" value={email} onChange={handleInputChange(setEmail)} required />
            </label>
          </div>
          <div className="eight wide field">
            <label>
              First Name:
              <input type="text" value={firstName} onChange={handleInputChange(setFirstName)} required />
            </label>
          </div>
          <div className="eight wide field">
            <label>
              Last Name:
              <input type="text" value={lastName} onChange={handleInputChange(setLastName)} required />
            </label>
          </div>
          <div className="eight wide field">
            <label>
              Phone Number:
              <input type="text" value={phoneNumber} onChange={handleInputChange(setPhoneNumber)} />
            </label>
          </div>
          <div className="eight wide field">
            <label>
              Role:
              <select value={role} onChange={handleInputChange(setRole)} required>
                <option value="" disabled>Select Role</option>
                <option value="Administrator">Administrator</option>
                <option value="Coordinator">Coordinator</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Member">Member</option>
                {/* Add more roles as needed */}
              </select>
            </label>
          </div>
          <br />
          <button type="submit" className='ui teal button' style={{ width: "200px", marginLeft: "110px", marginTop: "20px" }}>Update User</button>
        </form>
        {message && <div className="ui positive message" style={{ marginTop: "20px" }}>{message}</div>}
        {error && <div className="ui negative message" style={{ marginTop: "20px" }}>{error}</div>}
      </div>
    </div>
  );
};

export default EditUser;
