import React, { useState, useEffect } from 'react';
import { retrieve } from "./Encryption";
import { useParams } from 'react-router-dom';

const ViewSingleCommunityDetails = () => {
  const { id } = useParams(); // Get the ID from the URL params
  const [communityDetails, setCommunityDetails] = useState(null); // Set initial state to null
  const [currentDateTime, setCurrentDateTime] = useState(new Date()); // Current date and time
  
  useEffect(() => {
    fetch(`/communities/${id}`, {
      method: 'GET',
      headers: {
        Authorization: "Bearer " + retrieve().access_token,
      }
    })
      .then(response => response.json())
      .then(data => {
        // Process data and set it to state
        setCommunityDetails(data);
      })
      .catch(error => {
        console.error('Error fetching community details:', error);
      });
    
    // Update current date and time every minute
    const timer = setInterval(() => setCurrentDateTime(new Date()), 60000);
    
    // Clean up the timer on component unmount
    return () => clearInterval(timer);
  }, [id]);

  if (!communityDetails) {
    return <div>Loading...</div>; // Handle loading state
  }

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
      <h2 style={{ marginLeft: "500px", marginBottom: "50px" }}>Community Details</h2>
      <table className='ui striped table' style={{ width: "1200px", marginLeft: "60px", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Coordinator ID</th>
            <th>Coordinator Name</th>
            <th>Total Volunteer Hours</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{communityDetails.id}</td>
            <td>{communityDetails.name}</td>
            <td>{communityDetails.description}</td>
            <td>{communityDetails.coordinator_id ? communityDetails.coordinator_id : 'N/A'}</td>
            <td>{communityDetails.coordinator_name ? communityDetails.coordinator_name : 'N/A'}</td>
            <td>{communityDetails.total_volunteer_hours}</td>
          </tr>
        </tbody>
      </table>

      <h3>Members</h3>
      <table className='ui striped table' style={{ width: "1200px", marginLeft: "60px", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
            <th>Volunteer Hours</th>
          </tr>
        </thead>
        <tbody>
          {communityDetails.members && communityDetails.members.map(member => (
            <tr key={member.id}>
              <td>{member.id}</td>
              <td>{member.username}</td>
              <td>{member.role}</td>
              <td>
                {member.volunteer_hours ? member.volunteer_hours.reduce((total, hour) => total + hour.hours, 0) : 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Events</h3>
      {communityDetails.events && communityDetails.events.map(event => (
        <div key={event.id}>
          <h4>{event.title}</h4>
          <p>{event.description}</p>
          <p>Date: {new Date(event.event_date).toLocaleDateString()}</p>
          <p>Start Time: {new Date(event.start_time).toLocaleTimeString()}</p>
          <p>End Time: {new Date(event.end_time).toLocaleTimeString()}</p>
          <p>Zoom Link: <a href={event.zoom_link} target="_blank" rel="noopener noreferrer">{event.zoom_link}</a></p>
          <p>Status: {getEventStatus(event.start_time, event.end_time)}</p>
          {event.report && (
            <div>
              <h5>Event Report</h5>
              <p>Overview: {event.report.overview}</p>
              <p>Number of Attendees: {event.report.num_attendees}</p>
            </div>
          )}
          <h5>Volunteer Hours</h5>
          <ul>
            {event.volunteer_hours && event.volunteer_hours.map(hour => (
              <li key={hour.id}>User ID: {hour.user_id}, Hours: {hour.hours}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ViewSingleCommunityDetails;
