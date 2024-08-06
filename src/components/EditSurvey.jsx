import React, { useState, useEffect } from 'react';
import { retrieve } from './Encryption'; // Assumed method for retrieving access token
import { useParams, useNavigate } from 'react-router-dom';

const EditSurvey = () => {
  const [survey, setSurvey] = useState(null);
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState({});
  const [surveyStartDate, setSurveyStartDate] = useState('');
  const [surveyStopDate, setSurveyStopDate] = useState('');
  const [eventId, setEventId] = useState('');
  const [eventList, setEventList] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { id } = useParams(); // Get survey ID from URL
  const navigate = useNavigate();

  // Fetch survey details
  useEffect(() => {
    fetch(`/surveys/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('Failed to fetch survey');
        }
        return resp.json();
      })
      .then((data) => {
        setSurvey(data);
        setTitle(data.survey.title);
        setQuestions(data.survey.questions || {});
        setSurveyStartDate(data.survey.survey_start_date.split('T')[0]);
        setSurveyStopDate(data.survey.survey_stop_date.split('T')[0]);
        setEventId(data.survey.survey_id); // Assuming survey_id is the related event ID
      })
      .catch((error) => {
        console.error('Error fetching survey:', error);
        setError('Failed to fetch survey details. Please try again.');
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

  const handleQuestionChange = (key, value) => {
    setQuestions((prevQuestions) => ({ ...prevQuestions, [key]: value }));
  };

  const addQuestion = () => {
    const newKey = `Question ${Object.keys(questions).length + 1}`;
    setQuestions((prevQuestions) => ({ ...prevQuestions, [newKey]: '' }));
  };

  const removeQuestion = (key) => {
    const { [key]: removed, ...remainingQuestions } = questions;
    setQuestions(remainingQuestions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const updatedSurvey = {
      title,
      questions,
      survey_start_date: surveyStartDate,
      survey_stop_date: surveyStopDate,
      survey_id: eventId,
    };

    fetch(`/surveys/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + retrieve().access_token,
      },
      body: JSON.stringify(updatedSurvey),
    })
      .then((resp) => {
        if (!resp.ok) {
          return resp.json().then((err) => {
            setError(err.error || 'Failed to update survey. Please try again.');
            setMessage('');
            throw new Error(err.error || 'Failed to update survey. Please try again.');
          });
        }
        return resp.json();
      })
      .then((updatedData) => {
        console.log('Updated Survey:', updatedData);
        setMessage('Survey details have been updated successfully!');
        setTimeout(() => {
          navigate('/manage_surveys');
        }, 3000);
      })
      .catch((error) => {
        console.error('Error updating survey:', error);
        setError('Failed to update survey. Please try again.');
      });
  };

  // Reset error message when the user starts typing again
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError('');
  };

  if (!survey) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className='content-wrapper'
      style={{ marginLeft: '280px', backgroundColor: 'white', marginTop: '20px' }}
    >
      <h2>Edit Survey</h2>
      {error && <div className='error-message'>{error}</div>}
      {message && <div className='success-message'>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='title'>Title</label>
          <input
            type='text'
            id='title'
            value={title}
            onChange={handleInputChange(setTitle)}
            required
          />
        </div>
        <div className='form-group'>
          <label>Questions</label>
          {Object.keys(questions).map((key) => (
            <div key={key} className='question-field'>
              <input
                type='text'
                value={questions[key]}
                onChange={(e) => handleQuestionChange(key, e.target.value)}
                required
              />
              <button type='button' onClick={() => removeQuestion(key)}>
                Remove
              </button>
            </div>
          ))}
          <button type='button' onClick={addQuestion}>
            Add Question
          </button>
        </div>
        <div className='form-group'>
          <label htmlFor='surveyStartDate'>Survey Start Date</label>
          <input
            type='date'
            id='surveyStartDate'
            value={surveyStartDate}
            onChange={handleInputChange(setSurveyStartDate)}
            required
          />
        </div>
        <div className='form-group'>
          <label htmlFor='surveyStopDate'>Survey Stop Date</label>
          <input
            type='date'
            id='surveyStopDate'
            value={surveyStopDate}
            onChange={handleInputChange(setSurveyStopDate)}
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
        <button type='submit'>Update Survey</button>
      </form>
    </div>
  );
};

export default EditSurvey;
