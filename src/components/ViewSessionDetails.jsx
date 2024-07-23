import React, { useState, useEffect } from 'react';
import { retrieve } from "./Encryption"; // Import the retrieve function for getting the token

const ViewSessionDetails = () => {
  const [sessionDetails, setSessionDetails] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date()); // Current date and time

  useEffect(() => {
    fetch('/sessions', {
      headers: {
        Authorization: "Bearer " + retrieve().access_token,
      }
    })
      .then(response => response.json())
      .then(data => {
        setSessionDetails(data);
      })
      .catch(error => {
        console.error('Error fetching sessions:', error);
      });

    // Update current date and time every minute
    const timer = setInterval(() => setCurrentDateTime(new Date()), 60000);
    
    // Clean up the timer on component unmount
    return () => clearInterval(timer);
  }, []);

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <h2 style={{ marginLeft: "500px", marginBottom: "50px" }}>Session Details</h2>
      <table className='ui striped table' style={{ width: "1200px", marginLeft: "60px", marginBottom: "20px" }}>
        <thead>
          <tr>
          
            <th>Session Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Year Name</th>
          </tr>
        </thead>
        <tbody>
          {sessionDetails.map(session => (
            <tr key={session.id}>
            
              <td>{session.session_name}</td>
              <td>{new Date(session.start_date).toLocaleDateString()}</td>
              <td>{new Date(session.end_date).toLocaleDateString()}</td>
              <td>{session.year_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewSessionDetails;
