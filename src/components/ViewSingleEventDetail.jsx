import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { retrieve } from "./Encryption";

const ViewSingleEventDetail = () => {
  const { id } = useParams(); // Get the event ID from the URL
  const [eventDetail, setEventDetail] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date()); // Current date and time

  useEffect(() => {
    fetch(`/events/${id}`, {
      headers: {
        Authorization: "Bearer " + retrieve().access_token,
      }
    })
      .then(response => response.json())
      .then(data => {
        const status = getEventStatus(data.start_time, data.end_time);
        setEventDetail({ ...data, status });
      })
      .catch(error => console.error('Error fetching event details:', error));

    // Update current date and time every minute
    const timer = setInterval(() => setCurrentDateTime(new Date()), 60000);
    
    // Clean up the timer on component unmount
    return () => clearInterval(timer);
  }, [id]);

  // Helper function to determine event status
  const getEventStatus = (startTime, endTime) => {
    const eventStart = new Date(startTime);
    const eventEnd = new Date(endTime);
    const now = new Date();

    if (now < eventStart) return 'Upcoming';
    if (now > eventEnd) return 'Past';
    return 'Ongoing';
  };

  if (!eventDetail) return <div>Loading...</div>;

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <h2 style={{ marginLeft: "500px", marginBottom: "50px" }}>Event Details</h2>
      <div>
        <h3>{eventDetail.title}</h3>
        <p>{eventDetail.description}</p>
        <p>Date: {new Date(eventDetail.event_date).toLocaleDateString()}</p>
        <p>Start Time: {new Date(eventDetail.start_time).toLocaleTimeString()}</p>
        <p>End Time: {new Date(eventDetail.end_time).toLocaleTimeString()}</p>
        <p>Zoom Link: <a href={eventDetail.zoom_link} target="_blank" rel="noopener noreferrer">{eventDetail.zoom_link}</a></p>
        <p>Coordinator: {eventDetail.coordinator_name}</p>
        <p>Community: {eventDetail.community_name}</p>
        <p>Status: {eventDetail.status}</p>
        
        {/* Display report details */}
        {eventDetail.report && (
          <div>
            <h4>Report Details:</h4>
           
            <p>Number of Attendees: {eventDetail.report.num_attendees}</p>
            <p>Overview: {eventDetail.report.overview}</p>
            <p>Report Owner: {eventDetail.report.user_name}</p> {/* Changed to display user_name */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewSingleEventDetail;
