import React, { useState, useEffect } from 'react';
import { retrieve } from './Encryption'; // Assumed method for retrieving access token
import { useParams, useNavigate } from 'react-router-dom';

const EditPoll = () => {
  const [poll, setPoll] = useState(null);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]); // Initial state with empty array
  const [pollStartDate, setPollStartDate] = useState('');
  const [pollStopDate, setPollStopDate] = useState('');
  const [eventId, setEventId] = useState('');
  const [eventList, setEventList] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { id } = useParams(); // Get poll ID from URL
  const navigate = useNavigate();

  // Fetch poll details
  useEffect(() => {
    fetch(`/polls/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('Failed to fetch poll');
        }
        return resp.json();
      })
      .then((data) => {
        setPoll(data.poll);
        setQuestion(data.poll.question);

        // Convert options object to an array of strings
        const optionsArray = Object.values(data.poll.options || {});
        setOptions(optionsArray);

        // Ensure the dates are in YYYY-MM-DD format
        setPollStartDate(data.poll.poll_start_date);
        setPollStopDate(data.poll.poll_stop_date);

        setEventId(data.poll.event_id);
      })
      .catch((error) => {
        console.error('Error fetching poll:', error);
        setError('Failed to fetch poll details. Please try again.');
      });
  }, [id]);

  // Fetch list of events
  useEffect(() => {
    fetch('/events', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('Failed to fetch events');
        }
        return resp.json();
      })
      .then((data) => {
        setEventList(data);
      })
      .catch((error) => {
        console.error('Error fetching events:', error);
        setError('Failed to fetch events. Please try again.');
      });
  }, []);

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const updatedPoll = {
      question,
      options: options.reduce((acc, option, index) => {
        acc[`Option ${index + 1}`] = option;
        return acc;
      }, {}),
      poll_start_date: pollStartDate,
      poll_stop_date: pollStopDate,
      event_id: eventId,
    };

    fetch(`/polls/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
      body: JSON.stringify(updatedPoll),
    })
      .then((resp) => {
        if (!resp.ok) {
          return resp.json().then((err) => {
            setError(err.error || 'Failed to update poll. Please try again.');
            setMessage('');
            throw new Error(err.error || 'Failed to update poll. Please try again.');
          });
        }
        return resp.json();
      })
      .then((updatedData) => {
        console.log('Updated Poll:', updatedData);
        setMessage('Poll details have been updated successfully!');
        setTimeout(() => {
          navigate('/manage_polls');
        }, 3000);
      })
      .catch((error) => {
        console.error('Error updating poll:', error);
        setError('Failed to update poll. Please try again.');
      });
  };

  // Reset error message when the user starts typing again
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError('');
  };

  // Ensure form fields are only rendered when poll data is available
  if (!poll) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className='content-wrapper'
      style={{ marginLeft: '280px', backgroundColor: 'white', marginTop: '20px' }}
    >
      <h2>Edit Poll</h2>
      {error && <div className='error-message'>{error}</div>}
      {message && <div className='success-message'>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='question'>Question</label>
          <input
            type='text'
            id='question'
            value={question}
            onChange={handleInputChange(setQuestion)}
            required
          />
        </div>
        <div className='form-group'>
          <label>Options</label>
          {options.map((option, index) => (
            <div key={index} className='option-field'>
              <input
                type='text'
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                required
              />
              <button type='button' onClick={() => removeOption(index)}>
                Remove
              </button>
            </div>
          ))}
          <button type='button' onClick={addOption}>
            Add Option
          </button>
        </div>
        <div className='form-group'>
          <label htmlFor='pollStartDate'>Poll Start Date</label>
          <input
            type='date'
            id='pollStartDate'
            value={pollStartDate}
            onChange={handleInputChange(setPollStartDate)}
            required
          />
        </div>
        <div className='form-group'>
          <label htmlFor='pollStopDate'>Poll Stop Date</label>
          <input
            type='date'
            id='pollStopDate'
            value={pollStopDate}
            onChange={handleInputChange(setPollStopDate)}
            required
          />
        </div>
        <div className='form-group'>
          <label htmlFor='eventId'>Event</label>
          <select
            id='eventId'
            value={eventId}
            onChange={handleInputChange(setEventId)}
            required
          >
            <option value=''>Select an event</option>
            {eventList.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>
        <button type='submit'>Update Poll</button>
      </form>
    </div>
  );
};

export default EditPoll;
