import React, { useState, useEffect } from 'react';
import { retrieve } from "./Encryption";

const ViewPollDetails = () => {
  const [pollDetails, setPollDetails] = useState([]);

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

  return (
    <div className='content-wrapper' style={{ marginLeft: "280px", backgroundColor: "white", marginTop: "20px" }}>
      <h2 style={{ marginLeft: "500px", marginBottom: "50px" }}>Poll Details</h2>
      <table className='ui striped table' style={{ width: "1200px", marginLeft: "60px", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Question</th>
            <th>Options</th>
            <th>Event ID</th>
            <th>Poll Owner ID</th>
          </tr>
        </thead>
        <tbody>
          {pollDetails.map(poll => (
            <tr key={poll.id}>
              <td>{poll.id}</td>
              <td>{poll.question}</td>
              <td>{JSON.stringify(poll.options)}</td>
              <td>{poll.event_id}</td>
              <td>{poll.poll_owner_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewPollDetails;
