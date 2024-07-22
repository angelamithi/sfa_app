import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { retrieve } from "./Encryption";

const ViewPollDetails = () => {
  const [pollDetails, setPollDetails] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/polls', {
      headers: {
        Authorization: "Bearer " + retrieve().access_token,
      }
    })
      .then(response => response.json())
      .then(data => {
        const polls = data.map(poll => ({ ...poll, type: 'Poll' }));
        setPollDetails(polls);
      })
      .catch(error => {
        console.error('Error fetching polls:', error);
      });
  }, []);

  // Handler for row click
  const handleRowClick = (id) => {
    navigate(`/polls/${id}`); // Navigate to poll details page
  };

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <h2 style={{ marginLeft: "500px", marginBottom: "50px" }}>Poll Details</h2>
      <table className='ui striped table' style={{ width: "1200px", marginLeft: "60px", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Question</th>
            <th>Event Name</th>
            <th>Poll Owner Name</th>
            <th>Start Date</th>
            <th>Stop Date</th>
          </tr>
        </thead>
        <tbody>
          {pollDetails.map(poll => (
            <tr key={poll.id} onClick={() => handleRowClick(poll.id)} style={{ cursor: 'pointer' }}>
              <td>{poll.id}</td>
              <td>{poll.question}</td>
              <td>{poll.event_name}</td>
              <td>{poll.poll_owner_name}</td>
              <td>{poll.poll_start_date}</td>
              <td>{poll.poll_stop_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewPollDetails;
