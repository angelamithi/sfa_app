import React, { useState } from 'react';

const FetchTranscriptsByEvent = () => {
  const [eventId, setEventId] = useState('');
  const [transcripts, setTranscripts] = useState([]);
  const [error, setError] = useState('');

  const fetchTranscripts = async () => {
    try {
      const response = await fetch(`/transcripts/${eventId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming JWT is stored in localStorage
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setTranscripts(data.transcripts);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
        placeholder="Enter Event ID"
      />
      <button onClick={fetchTranscripts}>Fetch Transcripts</button>
      {error && <p>Error: {error}</p>}
      <ul>
        {transcripts.map((transcript, index) => (
          <li key={index}>
            <h3>{transcript.file_name}</h3>
            <pre>{transcript.content}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FetchTranscriptsByEvent;
