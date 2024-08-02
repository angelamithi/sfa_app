import React, { useState, useEffect } from 'react';
import { retrieve } from './Encryption'; // Adjust the import based on your file structure
import { useNavigate } from 'react-router-dom';

const AddEvent = ({ events = [], setEvents }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [communities, setCommunities] = useState([]);
  const [coordinatorId, setCoordinatorId] = useState('');
  const [coordinators, setCoordinators] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch communities data from the backend
    fetch('/communities', { headers: { 'Authorization': 'Bearer ' + retrieve().access_token } })
      .then(response => response.json())
      .then((communityData) => {
        setCommunities(communityData);
      })
      .catch(error => {
        console.error('Error fetching communities:', error);
        setError('Error fetching communities.');
      });

    // Fetch coordinators data from the backend
    fetch('/users?role=coordinator', { headers: { 'Authorization': 'Bearer ' + retrieve().access_token } })
      .then(response => response.json())
      .then((coordinatorData) => {
        setCoordinators(coordinatorData);
      })
      .catch(error => {
        console.error('Error fetching coordinators:', error);
        setError('Error fetching coordinators.');
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newEvent = {
      title,
      description,
      event_date: eventDate,
      start_time: startTime,
      end_time: endTime,
      zoom_link: zoomLink,
      community_id: communityId,
      coordinator_id: coordinatorId
    };

    fetch('/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
      body: JSON.stringify(newEvent),
    })
      .then((resp) => {
        if (!resp.ok) {
          return resp.json().then(err => {
            setError(err.error || 'Error adding event. Please try again.');
            setMessage(''); // Clear previous success message
            throw new Error(err.error || 'Error adding event. Please try again.');
          });
        }
        return resp.json();
      })
      .then((data) => {
        console.log('Added Event:', data);
        if (setEvents) {
          setEvents([...events, data]);
        }
        setError(''); // Clear any previous error
        setMessage('Event has been successfully created');
        setTimeout(() => {
          setShowForm(false);
          navigate('/manage_events');
        }, 3000); // Display message for 3 seconds before navigating
      })
      .catch((error) => {
        console.error('Error adding event:', error);
      });
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError(''); // Clear error when user starts fixing it
  };

  if (!showForm) {
    return null;
  }

  return (
    <div className='content-wrapper' style={{ marginLeft: "60px", backgroundColor: "white", marginTop: "20px" }}>
      <h2 style={{ marginTop: "120px" }}>Add Event</h2>
      <div className="ui equal width form" style={{ marginTop: "60px" }}>
        <form onSubmit={handleSubmit}>
          <div className="six wide field">
            <label>
              Event Title:
              <input
                type="text"
                value={title}
                onChange={handleInputChange(setTitle)}
                required
              />
            </label>
          </div>
          <br />
          <div className="six wide field">
            <label>
              Description:
              <textarea
                value={description}
                onChange={handleInputChange(setDescription)}
                required
              />
            </label>
          </div>
          <br />
          <div className="six wide field">
            <label>
              Event Date:
              <input
                type="date"
                value={eventDate}
                onChange={handleInputChange(setEventDate)}
                required
              />
            </label>
          </div>
          <br />
          <div className="six wide field">
            <label>
              Start Time:
              <input
                type="time"
                value={startTime}
                onChange={handleInputChange(setStartTime)}
                required
              />
            </label>
          </div>
          <br />
          <div className="six wide field">
            <label>
              End Time:
              <input
                type="time"
                value={endTime}
                onChange={handleInputChange(setEndTime)}
                required
              />
            </label>
          </div>
          <br />
          <div className="six wide field">
            <label>
              Zoom Link:
              <input
                type="url"
                value={zoomLink}
                onChange={handleInputChange(setZoomLink)}
              />
            </label>
          </div>
          <br />
          <div className="six wide field">
            <label>
              Community:
              <select
                value={communityId}
                onChange={handleInputChange(setCommunityId)}
                required
              >
                <option value="">Select Community</option>
                {communities.map((community) => (
                  <option key={community.id} value={community.id}>
                    {community.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <br />
          <div className="six wide field">
            <label>
              Coordinator:
              <select
                value={coordinatorId}
                onChange={handleInputChange(setCoordinatorId)}
                required
              >
                <option value="">Select Coordinator</option>
                {coordinators.map((coordinator) => (
                  <option key={coordinator.id} value={coordinator.id}>
                    {coordinator.first_name} {coordinator.last_name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <br />
          <button
            type="submit"
            className='ui teal button'
            style={{ width: "200px", marginLeft: "110px", marginTop: "20px" }}
          >
            Add Event
          </button>
        </form>
        {message && <div className="ui positive message" style={{ marginTop: "20px" }}>{message}</div>}
        {error && <div className="ui negative message" style={{ marginTop: "20px" }}>{error}</div>}
      </div>
    </div>
  );
};

export default AddEvent;
