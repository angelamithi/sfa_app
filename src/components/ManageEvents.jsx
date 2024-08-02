import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { retrieve } from './Encryption';

const ManageEvents = () => {
  const [eventDetails, setEventDetails] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/events', {
      headers: {
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then(response => response.json())
      .then(data => {
        setEventDetails(data);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });
  }, []);

  const handleRowClick = (id) => {
    navigate(`/event/${id}`);
  };

  const handleEditClick = (id) => {
    navigate(`/edit_event/${id}`);
  };

  const handleCreateEventClick = () => {
    navigate('/add_event');
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      fetch(`/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + retrieve().access_token,
        },
      })
        .then(response => {
          if (response.ok) {
            setEventDetails(prevDetails => prevDetails.filter(event => event.id !== id));
          } else {
            console.error('Failed to delete event');
          }
        })
        .catch(error => {
          console.error('Error deleting event:', error);
        });
    }
  };

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>All Event Details</h2>
        <div>
          <button onClick={handleCreateEventClick}>Create Event</button>
        </div>
      </div>
      <table className='ui striped table' style={{ width: "1200px", marginLeft: "60px", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Zoom Link</th>
            <th>Coordinator</th>
            <th>Community</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {eventDetails.map(event => (
            <tr key={event.id} style={{ cursor: 'pointer' }}>
              <td onClick={() => handleRowClick(event.id)}>{event.id}</td>
              <td onClick={() => handleRowClick(event.id)}>{event.title}</td>
              <td onClick={() => handleRowClick(event.id)}>{event.description}</td>
              <td onClick={() => handleRowClick(event.id)}>{event.event_date}</td>
              <td onClick={() => handleRowClick(event.id)}>{event.start_time}</td>
              <td onClick={() => handleRowClick(event.id)}>{event.end_time}</td>
              <td onClick={() => handleRowClick(event.id)}>{event.zoom_link}</td>
              <td onClick={() => handleRowClick(event.id)}>{event.coordinator_name}</td>
              <td onClick={() => handleRowClick(event.id)}>{event.community_name}</td>
              <td>
                <button onClick={() => handleEditClick(event.id)}>Edit</button>
                <button onClick={() => handleDeleteClick(event.id)} style={{ marginLeft: '10px', color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageEvents;
