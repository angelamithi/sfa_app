import React, { useState, useEffect } from 'react';
import { retrieve } from "./Encryption";

const ViewEventDetails = () => {
  const [eventDetails, setEventDetails] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date()); // Current date and time

  useEffect(() => {
    fetch('/events', {
      headers: {
        Authorization: "Bearer " + retrieve().access_token,
      }
    })
      .then(response => response.json())
      .then(data => {
        const events = data.map(event => ({
          ...event,
          type: 'Event',
          status: getEventStatus(event.start_time, event.end_time)
        }));
        setEventDetails(events);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });

    // Update current date and time every minute
    const timer = setInterval(() => setCurrentDateTime(new Date()), 60000);
    
    // Clean up the timer on component unmount
    return () => clearInterval(timer);
  }, []);

  // Helper function to determine event status
  const getEventStatus = (startTime, endTime) => {
    const eventStart = new Date(startTime);
    const eventEnd = new Date(endTime);
    const now = new Date();

    if (now < eventStart) return 'Upcoming';
    if (now > eventEnd) return 'Past';
    return 'Ongoing';
  };

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <h2 style={{ marginLeft: "500px", marginBottom: "50px" }}>Event Details</h2>
      <table className='ui striped table' style={{ width: "1200px", marginLeft: "60px", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Event Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Zoom Link</th>
            <th>Community ID</th>
            <th>Coordinator ID</th>
            <th>Status</th> {/* Added status column */}
          </tr>
        </thead>
        <tbody>
          {eventDetails.map(event => (
            <tr key={event.id}>
              <td>{event.id}</td>
              <td>{event.title}</td>
              <td>{event.description}</td>
              <td>{new Date(event.event_date).toLocaleDateString()}</td>
              <td>{new Date(event.start_time).toLocaleTimeString()}</td>
              <td>{new Date(event.end_time).toLocaleTimeString()}</td>
              <td>{event.zoom_link}</td>
              <td>{event.community_id}</td>
              <td>{event.coordinator_id}</td>
              <td>{event.status}</td> {/* Display the event status */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewEventDetails;
