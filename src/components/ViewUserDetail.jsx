import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { retrieve } from "./Encryption";

const ViewUserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/users/${id}`, {
      method: 'GET',
      headers: {
        Authorization: "Bearer " + retrieve().access_token,
      }
    })
      .then(response => response.json())
      .then(data => {
        setUser(data);
      })
      .catch(error => {
        console.error('Error fetching user details:', error);
      });
  }, [id]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className='user-details-card'>
      <h2>User Details</h2>
      <div>ID: {user.id}</div>
      <div>Username: {user.username}</div>
      <div>Email: {user.email}</div>
      <div>First Name: {user.first_name}</div>
      <div>Last Name: {user.last_name}</div>
      <div>Phone Number: {user.phone_number}</div>
      <div>Role: {user.role}</div>
      <div>
      <h3>Communities:</h3>{Array.isArray(user.communities) && user.communities.length > 0
          ? user.communities.map(community => <div key={community.id}>{community.name}</div>)
          : "No community"
        }
      </div>

      {/* Display events coordinated by the user if they are a coordinator */}
      {user.role === 'Coordinator' && (
        <div>
          <h3>Events Coordinated</h3>
          {Array.isArray(user.events) && user.events.length > 0
            ? user.events.map(event => (
              <div key={event.id}>
                <h4>{event.title}</h4>
                <p>{event.description}</p>
                <p>Date: {new Date(event.event_date).toLocaleDateString()}</p>
                <p>Start Time: {new Date(event.start_time).toLocaleTimeString()}</p>
                <p>End Time: {new Date(event.end_time).toLocaleTimeString()}</p>
              </div>
            ))
            : "No events coordinated"
          }
        </div>
      )}

      {/* Display volunteer hours and events volunteered in if the user is a volunteer */}
      {user.role === 'Volunteer' && (
        <div>
          <h3>Volunteer Hours</h3>
          {Array.isArray(user.volunteer_hours) && user.volunteer_hours.length > 0
            ? user.volunteer_hours.map(hour => (
              <div key={hour.id}>
                <p>Date: {new Date(hour.date).toLocaleDateString()}</p>
                <p>Hours: {hour.hours}</p>
              </div>
            ))
            : "No volunteer hours recorded"
          }

          <h3>Events Volunteered In</h3>
          {Array.isArray(user.events) && user.events.length > 0
            ? user.events.map(event => (
              <div key={event.id}>
                <h4>{event.title}</h4>
                <p>{event.description}</p>
                <p>Date: {new Date(event.event_date).toLocaleDateString()}</p>
                <p>Start Time: {new Date(event.start_time).toLocaleTimeString()}</p>
                <p>End Time: {new Date(event.end_time).toLocaleTimeString()}</p>
              </div>
            ))
            : "No events volunteered in"
          }
        </div>
      )}
    </div>
  );
};

export default ViewUserDetail;
