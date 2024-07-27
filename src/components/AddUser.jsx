import React, { useState } from 'react';
import { retrieve } from './Encryption';
import { useNavigate } from 'react-router-dom';

const AddUser = ({ users = [], setUsers }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const defaultPassword = 'default123';

    const newUser = {
      username,
      email,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      password: defaultPassword,
      role
    };

    fetch(`/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
      body: JSON.stringify(newUser),
    })
      .then((resp) => {
        if (!resp.ok) {
          return resp.json().then(err => {
            setError(err.message || 'Error adding user. Please try again.');
            throw new Error(err.message || 'Error adding user. Please try again.');
          });
        }
        return resp.json();
      })
      .then((data) => {
        console.log('Added User:', data);
        if (setUsers) {
          setUsers([...users, data]);
        }
        setError(''); // Clear any previous error
        setMessage('User has been successfully created');
        setTimeout(() => {
          setShowForm(false);
          navigate('/manage_team');
        }, 3000); // Display message for 3 seconds before navigating
      })
      .catch((error) => {
        console.error('Error adding user:', error);
      });
  };

  // Reset error message when the user starts typing again
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError(''); // Clear error when user starts fixing it
  };

  if (!showForm) {
    return null;
  }

  return (
    <div className='content-wrapper' style={{ marginLeft: "60px", backgroundColor: "white", marginTop: "20px" }}>
      <h2 style={{ marginTop: "120px" }}>Add User</h2>
      <div className="ui equal width form" style={{ marginTop: "60px" }}>
        <form onSubmit={handleSubmit}>
          <div className="six wide field">
            <label>
              Username:
              <input
                type="text"
                value={username}
                onChange={handleInputChange(setUsername)}
                required
              />
            </label>
          </div>
          <br />
          <div className="six wide field">
            <label>
              Email:
              <input
                type="email"
                value={email}
                onChange={handleInputChange(setEmail)}
                required
              />
            </label>
          </div>
          <br />
          <div className="six wide field">
            <label>
              First Name:
              <input
                type="text"
                value={firstName}
                onChange={handleInputChange(setFirstName)}
                required
              />
            </label>
          </div>
          <br />
          <div className="six wide field">
            <label>
              Last Name:
              <input
                type="text"
                value={lastName}
                onChange={handleInputChange(setLastName)}
                required
              />
            </label>
          </div>
          <br />
          <div className="six wide field">
            <label>
              Phone Number:
              <input
                type="text"
                value={phoneNumber}
                onChange={handleInputChange(setPhoneNumber)}
              />
            </label>
          </div>
          <br />
          <div className="six wide field">
            <label>
              Role:
              <select
                value={role}
                onChange={handleInputChange(setRole)}
                required
              >
                <option value="">Select a role</option>
                <option value="Administrator">Administrator</option>
                <option value="Coordinator">Coordinator</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Member">Member</option>
              </select>
            </label>
          </div>
          <br />
          <button
            type="submit"
            className='ui teal button'
            style={{ width: "200px", marginLeft: "110px", marginTop: "20px" }}
          >
            Add User
          </button>
        </form>
        {message && <div className="ui positive message" style={{ marginTop: "20px" }}>{message}</div>}
        {error && <div className="ui negative message" style={{ marginTop: "20px" }}>{error}</div>}
      </div>
    </div>
  );
};

export default AddUser;
