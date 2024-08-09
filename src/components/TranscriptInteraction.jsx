import React, { useState } from 'react';

const TranscriptInteraction = () => {
  const [transcripts, setTranscripts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [interactionQuestion, setInteractionQuestion] = useState('');
  const [reportUrl, setReportUrl] = useState('');
  const [botResponse, setBotResponse] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleTranscriptsUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('transcripts', JSON.stringify([{ file_name: selectedFile.name, content: await selectedFile.text() }]));

    try {
      const response = await fetch('/process_transcripts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming JWT is stored in localStorage
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.blob();
      setReportUrl(URL.createObjectURL(data));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInteraction = async () => {
    if (!interactionQuestion) {
      setError('Please enter a question.');
      return;
    }

    try {
      const response = await fetch('/interact_with_bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming JWT is stored in localStorage
        },
        body: JSON.stringify({ question: interactionQuestion }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setBotResponse(data.response);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Process Transcripts</h2>
      <input type="file" accept=".txt" onChange={handleFileChange} />
      <button onClick={handleTranscriptsUpload}>Upload and Process Transcripts</button>
      {reportUrl && (
        <div>
          <a href={reportUrl} download="report.docx">Download Report</a>
        </div>
      )}

      <h2>Interact with Bot</h2>
      <input
        type="text"
        value={interactionQuestion}
        onChange={(e) => setInteractionQuestion(e.target.value)}
        placeholder="Enter your question"
      />
      <button onClick={handleInteraction}>Ask Bot</button>
      {botResponse && <p>Bot Response: {botResponse}</p>}

      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default TranscriptInteraction;
