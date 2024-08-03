import React, { useState, useEffect } from 'react';
import { format as formatZonedTime, toZonedTime } from 'date-fns-tz';
import { parseISO, formatISO } from 'date-fns';
import { retrieve } from './Encryption'; // Adjust the import path as needed
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
        setEventDate(data.event_date.substring(0, 10)); // Remove the time part
        setStartTime(convertUTCToLocal(data.start_time));
        setEndTime(convertUTCToLocal(data.end_time));
        setZoomLink(data.zoom_link);
        setCommunityId(data.community_id);
        setCoordinatorId(data.coordinator_id);
      })
      .catch((error) => {
        console.error('Error fetching event:', error);
        setError('Failed to fetch event details. Please try again.');
      });
  }, [id]);

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

  useEffect(() => {
    fetch('/fetch_coordinators', {
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

    const startTimeUTC = convertToUTC(eventDate, startTime);
    const endTimeUTC = convertToUTC(eventDate, endTime);

    const updatedEvent = {
      title,
      description,
      event_date: eventDate,
      start_time: startTimeUTC,
      end_time: endTimeUTC,
      zoom_link: zoomLink,
      community_id: communityId,
      coordinator_id: coordinatorId,
    };

    fetch(`/events/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
        'X-Viewer-Timezone': viewerTimeZone
      },
      body: JSON.stringify(updatedEvent),
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('Failed to update event');
        }
        return resp.json();
      })
      .then((data) => {
        console.log('Event updated:', data);
        setMessage('Event updated successfully!');
        setTimeout(() => {
          navigate('/manage_events');
        }, 2000);
      })
      .catch((error) => {
        console.error('Error updating event:', error);
        setError('Failed to update event. Please try again.');
      });
  };

  return (
    <div>
      <h1>Edit Event</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {event && (
        <form onSubmit={handleSubmit}>
          <label>
            Title:
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <br />
          <label>
            Description:
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
          </label>
          <br />
          <label>
            Event Date:
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
          </label>
          <br />
          <label>
            Start Time (UTC):
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          </label>
          <br />
          <label>
            End Time (UTC):
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </label>
          <br />
          <label>
            Zoom Link:
            <input type="url" value={zoomLink} onChange={(e) => setZoomLink(e.target.value)} />
          </label>
          <br />
          <label>
            Community:
            <select value={communityId} onChange={(e) => setCommunityId(e.target.value)} required>
              <option value="">Select Community</option>
              {communityList.map((community) => (
                <option key={community.id} value={community.id}>
                  {community.name}
                </option>
              ))}
            </select>
          </label>
          <br />
          <label>
            Coordinator:
            <select value={coordinatorId} onChange={(e) => setCoordinatorId(e.target.value)} required>
              <option value="">Select Coordinator</option>
              {coordinatorList.map((coordinator) => (
                <option key={coordinator.id} value={coordinator.id}>
                  {coordinator.name}
                </option>
              ))}
            </select>
          </label>
          <br />
          <button type="submit">Save Changes</button>
        </form>
      )}
    </div>
  );
};

export default EditEvent;
