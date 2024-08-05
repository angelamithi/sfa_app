import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { retrieve } from './Encryption'; // Assuming you have a retrieve function for getting tokens

const ManagePolls = () => {
  const [pollsDetails, setPollsDetails] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/polls', {
      headers: {
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPollsDetails(data);
        } else {
          setPollsDetails([]);
          console.error('Error: data is not an array', data);
        }
      })
      .catch(error => {
        setPollsDetails([]);
        console.error('Error fetching polls:', error);
      });
  }, []);

  const handleRowClick = (id) => {
    navigate(`/poll/${id}`);
  };

  const handleEditClick = (id) => {
    navigate(`/edit_poll/${id}`);
  };

  const handleCreatePollClick = () => {
    navigate('/add_poll');
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this poll?')) {
      fetch(`/polls/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + retrieve().access_token,
        },
      })
        .then(response => {
          if (response.ok) {
            setPollsDetails(prevDetails => prevDetails.filter(poll => poll.id !== id));
          } else {
            console.error('Failed to delete poll');
          }
        })
        .catch(error => {
          console.error('Error deleting poll:', error);
        });
    }
  };

  const formatDate = (dateString) => {
    if (dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString(); // Format to 'MM/DD/YYYY' or adjust as needed
    }
    return '';
  };

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Manage Polls</h2>
        <button onClick={handleCreatePollClick}>Create Poll</button>
      </div>
      {pollsDetails.length === 0 ? (
        <p>No polls found.</p>
      ) : (
        <table className='ui striped table' style={{ width: "100%", marginLeft: "60px", marginBottom: "20px" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Question</th>
              <th>Event Name</th>
              <th>Poll Owner</th>
              <th>Start Date</th>
              <th>Stop Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pollsDetails.map(poll => (
              <tr key={poll.id} style={{ cursor: 'pointer' }}>
                <td onClick={() => handleRowClick(poll.id)}>{poll.id}</td>
                <td onClick={() => handleRowClick(poll.id)}>{poll.question}</td>
                <td onClick={() => handleRowClick(poll.id)}>{poll.event_name || 'No Event'}</td>
                <td onClick={() => handleRowClick(poll.id)}>{poll.poll_owner_name || 'No Owner'}</td>
                <td onClick={() => handleRowClick(poll.id)}>{formatDate(poll.poll_start_date)}</td>
                <td onClick={() => handleRowClick(poll.id)}>{formatDate(poll.poll_stop_date)}</td>
                <td>
                  <button onClick={() => handleEditClick(poll.id)}>Edit</button>
                  <button onClick={() => handleDeleteClick(poll.id)} style={{ marginLeft: '10px', color: 'red' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManagePolls;
