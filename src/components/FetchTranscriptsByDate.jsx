import React, { useState } from 'react';

const FetchTranscriptsByDate = () => {
  const [dateStr, setDateStr] = useState('');
  const [transcripts, setTranscripts] = useState([]);
  const [error, setError] = useState('');

  const fetchTranscripts = async () => {
    try {
      const response = await fetch(`/transcripts/date/${dateStr}`, {
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
        value={dateStr}
        onChange={(e) => setDateStr(e.target.value)}
        placeholder="Enter Date (YYYY-MM-DD)"
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

export default FetchTranscriptsByDate;
