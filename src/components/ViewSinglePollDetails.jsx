import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { retrieve } from './Encryption'; // Ensure this path is correct

const ViewSinglePollDetails = () => {
  const { id } = useParams();
  const [pollDetail, setPollDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch poll details from the backend
    fetch(`/polls/${id}`, {
      headers: {
        Authorization: `Bearer ${retrieve().access_token}`, // Use template literals for better readability
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Poll not found');
        }
        return response.json();
      })
      .then(data => {
        setPollDetail(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className='content-wrapper' style={{ marginLeft: '280px', backgroundColor: 'white', marginTop: '20px' }}>
      <h2 style={{ marginLeft: '500px', marginBottom: '50px' }}>Poll Details</h2>
      <div>
        <h3>{pollDetail?.poll?.question || 'Poll question not available'}</h3>
        <div>
          <h4>Event:</h4>
          <p>{pollDetail?.poll?.event_name || 'Event name not available'}</p>
        </div>
        <div>
          <h4>Poll Owner:</h4>
          <p>{pollDetail?.poll?.poll_owner_name || 'Poll owner name not available'}</p>
        </div>
        <div>
          <h4>Start Date:</h4>
          <p>{pollDetail?.poll?.poll_start_date || 'Start date not available'}</p>
        </div>
        <div>
          <h4>Stop Date:</h4>
          <p>{pollDetail?.poll?.poll_stop_date || 'Stop date not available'}</p>
        </div>
        <div>
          <h4>Options:</h4>
          <ul>
            {pollDetail?.poll?.options ? (
              Object.entries(pollDetail.poll.options).map(([key, value]) => (
                <li key={key}>{key}: {value}</li>
              ))
            ) : (
              <li>No options available</li>
            )}
          </ul>
        </div>
        <div>
          <h4>Responses:</h4>
          {pollDetail?.responses?.length > 0 ? (
            <ul>
              {pollDetail.responses.map((response, index) => (
                <li key={index}>
                  {response.user_name}: {response.response}
                </li>
              ))}
            </ul>
          ) : (
            <p>No responses yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewSinglePollDetails;
