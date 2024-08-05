import React, { useState, useEffect } from 'react';
import { retrieve } from './Encryption'; // Assumed method for retrieving access token
import { useNavigate } from 'react-router-dom';

const AddPoll = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['']); // Start with one empty option
  const [pollStartDate, setPollStartDate] = useState('');
  const [pollStopDate, setPollStopDate] = useState('');
  const [eventId, setEventId] = useState('');
  const [eventList, setEventList] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
 
  const navigate = useNavigate();

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

    const newPoll = {
      question,
      options: options.reduce((acc, option, index) => {
        acc[`Option ${index + 1}`] = option;
        return acc;
      }, {}),
      poll_start_date: pollStartDate,
      poll_stop_date: pollStopDate,
      event_id: eventId,
      poll_owner_id: retrieve().user_id // Assuming you have a user_id stored in the token
    };

    fetch('/polls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
      body: JSON.stringify(newPoll),
    })
      .then((resp) => {
        if (!resp.ok) {
          return resp.json().then((err) => {
            setError(err.error || 'Failed to add poll. Please try again.');
            setMessage('');
            throw new Error(err.error || 'Failed to add poll. Please try again.');
          });
        }
        return resp.json();
      })
      .then((data) => {
        console.log('New Poll Added:', data);
        setMessage('Poll has been added successfully!');
        setTimeout(() => {
          navigate('/manage_polls');
        }, 3000);
      })
      .catch((error) => {
        console.error('Error adding poll:', error);
        setError('Failed to add poll. Please try again.');
      });
  };

  // Reset error message when the user starts typing again
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError('');
  };

  return (
    <div
      className='content-wrapper'
      style={{ marginLeft: '280px', backgroundColor: 'white', marginTop: '20px' }}
    >
      <h2>Add New Poll</h2>
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
        <button type='submit'>Add Poll</button>
      </form>
    </div>
  );
};

export default AddPoll;
