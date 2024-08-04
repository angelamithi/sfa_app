import React, { useState, useEffect } from 'react';
import { format as formatZonedTime, toZonedTime } from 'date-fns-tz';
import { parseISO, formatISO } from 'date-fns';
import { retrieve } from './Encryption'; // Adjust the import path as needed
import { useNavigate } from 'react-router-dom';

const AddEvent = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [communityList, setCommunityList] = useState([]);
  const [coordinatorId, setCoordinatorId] = useState('');
  const [coordinatorList, setCoordinatorList] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [events, setEvents] = useState([]); // Initialize local state for events
  const [showForm, setShowForm] = useState(true);
  const navigate = useNavigate();
  
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const viewerTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const convertUTCToLocal = (utcDateTime) => {
    const utcDate = parseISO(utcDateTime);
    const zonedDate = toZonedTime(utcDate, timeZone);
    return formatZonedTime(zonedDate, 'HH:mm:ss', { timeZone });
  };

  const convertToUTC = (date, time) => {
    const localDateTime = new Date(`${date}T${time}`);
    return formatISO(localDateTime, { representation: 'complete' });
  };

  useEffect(() => {
    fetch('/communities', {
      headers: {
        'Authorization': 'Bearer ' + retrieve().access_token
      }
    })
      .then(response => response.json())
      .then((data) => {
        setCommunityList(data);
      })
      .catch(error => {
        console.error('Error fetching communities:', error);
        setError('Error fetching communities.');
      });

    fetch('/fetch_coordinators', {
      headers: {
        'Authorization': 'Bearer ' + retrieve().access_token
      }
    })
      .then(response => response.json())
      .then((data) => {
        setCoordinatorList(data);
      })
      .catch(error => {
        console.error('Error fetching coordinators:', error);
        setError('Error fetching coordinators.');
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('Original Start Time:', startTime);
    console.log('Original End Time:', endTime);

    const startTimeUTC = convertToUTC(eventDate, startTime);
    const endTimeUTC = convertToUTC(eventDate, endTime);
    

    console.log('Converted Start Time (UTC):', startTimeUTC);
    console.log('Converted End Time (UTC):', endTimeUTC);

    const newEvent = {
      title,
      description,
      event_date: eventDate,
      start_time: startTimeUTC,
      end_time: endTimeUTC,
      zoom_link: zoomLink,
      community_id: communityId,
      coordinator_id: coordinatorId
    };

    fetch('/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
        'X-Viewer-Timezone': viewerTimeZone
      },
      body: JSON.stringify(newEvent),
    })
      .then((resp) => {
        if (!resp.ok) {
          return resp.json().then(err => {
            setError(err.error || 'Error adding event. Please try again.');
            setMessage('');
            throw new Error(err.error || 'Error adding event. Please try again.');
          });
        }
        return resp.json();
      })
      .then((data) => {
        console.log('Event Data (UTC):', data);

        const updatedData = {
          ...data,
          start_time: convertUTCToLocal(data.start_time),
          end_time: convertUTCToLocal(data.end_time),
        };

        console.log('Event Data (Local):', updatedData);

        setEvents(prevEvents => [...prevEvents, updatedData]); // Update local events state
        setError('');
        setMessage('Event has been successfully created');
        setTimeout(() => {
          setShowForm(false);
          navigate('/manage_events');
        }, 3000);
      })
      .catch((error) => {
        console.error('Error adding event:', error);
      });
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError('');
  };

  if (!showForm) {
    return null;
  }

  return (
    <div className='content-wrapper' style={{ marginLeft: "60px", backgroundColor: "white", marginTop: "20px" }}>
      <h2 style={{ marginTop: "120px" }}>Add Event</h2>
      <div className="ui equal width form" style={{ marginTop: "60px" }}>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Title:</label>
            <input type="text" value={title} onChange={handleInputChange(setTitle)} required />
          </div>
          <div className="field">
            <label>Description:</label>
            <input type="text" value={description} onChange={handleInputChange(setDescription)} required />
          </div>
          <div className="field">
            <label>Event Date:</label>
            <input type="date" value={eventDate} onChange={handleInputChange(setEventDate)} required />
          </div>
          <div className="field">
            <label>Start Time:</label>
            <input type="time" value={startTime} onChange={handleInputChange(setStartTime)} required />
          </div>
          <div className="field">
            <label>End Time:</label>
            <input type="time" value={endTime} onChange={handleInputChange(setEndTime)} required />
          </div>
          <div className="field">
            <label>Zoom Link:</label>
            <input type="text" value={zoomLink} onChange={handleInputChange(setZoomLink)} />
          </div>
          <div className="field">
            <label>Community:</label>
            <select value={communityId} onChange={handleInputChange(setCommunityId)} required>
              <option value="">Select Community</option>
              {communityList.map((community) => (
                <option key={community.id} value={community.id}>{community.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Coordinator:</label>
            <select value={coordinatorId} onChange={handleInputChange(setCoordinatorId)} required>
              <option value="">Select Coordinator</option>
              {coordinatorList.map((coordinator) => (
                <option key={coordinator.id} value={coordinator.id}>{coordinator.name}</option>
              ))}
            </select>
          </div>
          <button className="ui button" type="submit">Submit</button>
        </form>
        {error && <div className="ui red message">{error}</div>}
        {message && <div className="ui green message">{message}</div>}
      </div>
    </div>
  );
};

export default AddEvent;
