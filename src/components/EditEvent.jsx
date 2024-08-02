import React, { useState, useEffect } from 'react';
import { retrieve } from './Encryption';
import { useParams, useNavigate } from 'react-router-dom';

const EditEvent = () => {
  const [event, setEvent] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [coordinatorId, setCoordinatorId] = useState('');
  const [communityList, setCommunityList] = useState([]);
  const [coordinatorList, setCoordinatorList] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch the event details by ID
  useEffect(() => {
    fetch(`/events/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('Failed to fetch event');
        }
        return resp.json();
      })
      .then((data) => {
        setEvent(data);
        setTitle(data.title);
        setDescription(data.description);
        setEventDate(data.event_date);
        setStartTime(data.start_time);
        setEndTime(data.end_time);
        setZoomLink(data.zoom_link);
        setCommunityId(data.community_id);
        setCoordinatorId(data.coordinator_id);
      })
      .catch((error) => {
        console.error('Error fetching event:', error);
        setError('Failed to fetch event details. Please try again.');
      });
  }, [id]);

  // Fetch the list of communities
  useEffect(() => {
    fetch('/communities', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('Failed to fetch communities');
        }
        return resp.json();
      })
      .then((data) => {
        setCommunityList(data);
      })
      .catch((error) => {
        console.error('Error fetching communities:', error);
        setError('Failed to fetch communities. Please try again.');
      });
  }, []);

  // Fetch the list of coordinators
  useEffect(() => {
    fetch('/coordinators', { // Update this endpoint if needed
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('Failed to fetch coordinators');
        }
        return resp.json();
      })
      .then((data) => {
        setCoordinatorList(data);
      })
      .catch((error) => {
        console.error('Error fetching coordinators:', error);
        setError('Failed to fetch coordinators. Please try again.');
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous error message

    const updatedEvent = {
      title,
      description,
      event_date: eventDate,
      start_time: startTime,
      end_time: endTime,
      zoom_link: zoomLink,
      community_id: communityId,
      coordinator_id: coordinatorId,
    };

    fetch(`/events/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
      body: JSON.stringify(updatedEvent),
    })
      .then((resp) => {
        if (!resp.ok) {
          return resp.json().then((err) => {
            setError(err.error || 'Failed to update event. Please try again.');
            setMessage(''); // Clear previous success message
            throw new Error(err.error || 'Failed to update event. Please try again.');
          });
        }
        return resp.json();
      })
      .then((updatedData) => {
        console.log('Updated Event:', updatedData);
        setMessage('Event details have been updated successfully!');
        setTimeout(() => {
          navigate('/manage_events'); // Redirect to Manage Events after a few seconds
        }, 3000); // Wait for 3 seconds before redirecting
      })
      .catch((error) => {
        console.error('Error updating event:', error);
        setError('Failed to update event. Please try again.');
      });
  };

  // Reset error message when the user starts typing again
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError(''); // Clear error when user starts fixing it
  };

  return (
    <div className="content-wrapper" style={{ marginLeft: '280px', backgroundColor: 'white', marginTop: '20px' }}>
      <h2>Edit Event</h2>
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input type="text" id="title" value={title} onChange={handleInputChange(setTitle)} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" value={description} onChange={handleInputChange(setDescription)} required></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="eventDate">Event Date</label>
          <input type="date" id="eventDate" value={eventDate} onChange={handleInputChange(setEventDate)} required />
        </div>
        <div className="form-group">
          <label htmlFor="startTime">Start Time</label>
          <input type="time" id="startTime" value={startTime} onChange={handleInputChange(setStartTime)} required />
        </div>
        <div className="form-group">
          <label htmlFor="endTime">End Time</label>
          <input type="time" id="endTime" value={endTime} onChange={handleInputChange(setEndTime)} required />
        </div>
        <div className="form-group">
          <label htmlFor="zoomLink">Zoom Link</label>
          <input type="url" id="zoomLink" value={zoomLink} onChange={handleInputChange(setZoomLink)} required />
        </div>
        <div className="form-group">
          <label htmlFor="communityId">Community</label>
          <select id="communityId" value={communityId} onChange={handleInputChange(setCommunityId)} required>
            <option value="">Select Community</option>
            {communityList.map((community) => (
              <option key={community.id} value={community.id}>
                {community.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="coordinatorId">Coordinator</label>
          <select id="coordinatorId" value={coordinatorId} onChange={handleInputChange(setCoordinatorId)} required>
            <option value="">Select Coordinator</option>
            {coordinatorList.map((coordinator) => (
              <option key={coordinator.id} value={coordinator.id}>
                {coordinator.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditEvent;
